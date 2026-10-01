"""Create missing native bootstrap assets inside Unreal's editor.

Existing artist assets are preserved unless WNT_FORCE_ASSETS=1 is explicitly set.
The generated terrain master also refreshes when its shader schema changes.
"""
import json
import os
from pathlib import Path
import unreal

force = os.environ.get("WNT_FORCE_ASSETS") == "1"
assets = unreal.get_editor_subsystem(unreal.EditorAssetSubsystem)
tools = unreal.AssetToolsHelpers.get_asset_tools()
editing = unreal.MaterialEditingLibrary
changed, preserved = [], []


def expression(material, cls, x, y):
    node = editing.create_material_expression(material, cls, x, y)
    if not node:
        raise RuntimeError("Cannot create material expression: " + str(cls))
    return node


def connect(source, target, input_name, output_name=""):
    if not editing.connect_material_expressions(source, output_name, target, input_name):
        raise RuntimeError("Cannot connect expression input: " + input_name)


def scalar(material, name, value, property_, y):
    node = expression(material, unreal.MaterialExpressionScalarParameter, -250, y)
    node.set_editor_property("parameter_name", name)
    node.set_editor_property("default_value", value)
    if not editing.connect_material_property(node, "", property_):
        raise RuntimeError("Cannot connect " + name)


def ocean_normal(material):
    # Analytic per-pixel ripples in world centimetres. No mesh displacement,
    # ship motion, texture dependency or geometry rebuild is implied.
    material.set_editor_property("tangent_space_normal", False)
    position = expression(material, unreal.MaterialExpressionWorldPosition, -1400, 500)
    time = expression(material, unreal.MaterialExpressionTime, -1400, 800)
    axes = []
    for row, (axis, frequency, rate, strength) in enumerate([(0, .00018, .10, .04), (1, .00023, .07, .03)]):
        y = 500 + row * 450
        mask = expression(material, unreal.MaterialExpressionComponentMask, -1200, y)
        for key, flag in [("r", axis == 0), ("g", axis == 1), ("b", False), ("a", False)]:
            mask.set_editor_property(key, flag)
        connect(position, mask, "")
        spatial = expression(material, unreal.MaterialExpressionMultiply, -1000, y)
        spatial.set_editor_property("const_b", frequency)
        connect(mask, spatial, "A")
        temporal = expression(material, unreal.MaterialExpressionMultiply, -1000, y + 150)
        temporal.set_editor_property("const_b", rate)
        connect(time, temporal, "A")
        phase = expression(material, unreal.MaterialExpressionAdd, -800, y)
        connect(spatial, phase, "A")
        connect(temporal, phase, "B")
        sine = expression(material, unreal.MaterialExpressionSine, -600, y)
        connect(phase, sine, "")
        amplitude = expression(material, unreal.MaterialExpressionMultiply, -400, y)
        amplitude.set_editor_property("const_b", strength)
        connect(sine, amplitude, "A")
        axes.append(amplitude)
    xy = expression(material, unreal.MaterialExpressionAppendVector, -200, 600)
    connect(axes[0], xy, "A")
    connect(axes[1], xy, "B")
    one = expression(material, unreal.MaterialExpressionConstant, -200, 850)
    one.set_editor_property("r", 1.0)
    normal = expression(material, unreal.MaterialExpressionAppendVector, 0, 600)
    connect(xy, normal, "A")
    connect(one, normal, "B")
    if not editing.connect_material_property(normal, "", unreal.MaterialProperty.MP_NORMAL):
        raise RuntimeError("Cannot connect ocean ripple normal")


def material(name, roughness, metallic, unlit=False, color=None, parameter="Tint"):
    asset_path = "/Game/Materials/" + name
    exists = assets.does_asset_exist(asset_path)
    if exists and not force:
        preserved.append(asset_path)
        return
    mat = assets.load_asset(asset_path) if exists else tools.create_asset(name, "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    if not isinstance(mat, unreal.Material):
        raise RuntimeError("Material path has an incompatible asset: " + asset_path)
    if exists:
        editing.delete_all_material_expressions(mat)
    mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_OPAQUE)
    mat.set_editor_property("two_sided", False)
    mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT if unlit else unreal.MaterialShadingModel.MSM_DEFAULT_LIT)
    if color is None:
        node = expression(mat, unreal.MaterialExpressionVertexColor, -450, 0)
    else:
        node = expression(mat, unreal.MaterialExpressionVectorParameter, -450, 0)
        node.set_editor_property("parameter_name", parameter)
        node.set_editor_property("default_value", unreal.LinearColor(*color, 1.0))
    prop = unreal.MaterialProperty.MP_EMISSIVE_COLOR if unlit else unreal.MaterialProperty.MP_BASE_COLOR
    # UE's VertexColor RGB output is unnamed, unlike VectorParameter's "RGB".
    # Empty output name selects output zero for both node types.
    if not editing.connect_material_property(node, "", prop):
        raise RuntimeError("Cannot connect color: " + name)
    if not unlit:
        scalar(mat, "Roughness", roughness, unreal.MaterialProperty.MP_ROUGHNESS, 150)
        scalar(mat, "Metallic", metallic, unreal.MaterialProperty.MP_METALLIC, 300)
    if name == "M_Ocean":
        ocean_normal(mat)
    compile_errors = editing.recompile_material(mat)
    if compile_errors:
        raise RuntimeError("Material compilation failed for " + name + ": " + "; ".join(str(error) for error in compile_errors))
    if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
        raise RuntimeError("Cannot save material: " + asset_path)
    changed.append(asset_path)


def terrain_surface():
    asset_path = "/Game/Materials/M_TerrainSurface"
    shader_schema = "3-full-precision-satellite-division"
    existing = assets.load_asset(asset_path) if assets.does_asset_exist(asset_path) else None
    if existing and not force and assets.get_metadata_tag(existing, "WNTTerrainShaderSchema") == shader_schema:
        preserved.append(asset_path)
        return
    mat = existing if existing else tools.create_asset(
        "M_TerrainSurface", "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    editing.delete_all_material_expressions(mat)
    mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_DEFAULT_LIT)
    mat.set_editor_property("tangent_space_normal", False)
    mat.set_editor_property("two_sided", False)
    world = expression(mat, unreal.MaterialExpressionWorldPosition, -1600, 0)
    # Use full-precision local positions, not the procedural mesh's half-float
    # UV buffer. The per-tile geographic phase survives world-origin rebases
    # and is a common multiple of all three surface repeat distances.
    local = expression(mat, unreal.MaterialExpressionLocalPosition, -2100, 0)
    local.set_editor_property("local_origin", unreal.LocalPositionOrigin.PRIMITIVE)
    local.set_editor_property("included_offsets", unreal.PositionIncludedOffsets.EXCLUDE_OFFSETS)
    phase = expression(mat, unreal.MaterialExpressionVectorParameter, -2100, 200)
    phase.set_editor_property("parameter_name", "GeographicTexturePhase")
    phase.set_editor_property("use_custom_primitive_data", True)
    phase.set_editor_property("primitive_data_index", 0)
    stable = expression(mat, unreal.MaterialExpressionAdd, -1850, 0)
    connect(local, stable, "A")
    connect(phase, stable, "B", "RGB")
    xy = expression(mat, unreal.MaterialExpressionComponentMask, -1600, 0)
    xy.set_editor_property("r", True)
    xy.set_editor_property("g", True)
    connect(stable, xy, "")
    uv = expression(mat, unreal.MaterialExpressionDivide, -1200, 0)
    uv.set_editor_property("const_b", 5000.0)
    connect(xy, uv, "A")
    linear_white_path = "/Game/Materials/T_LinearWhite"
    linear_white = assets.load_asset(linear_white_path)
    if not linear_white:
        linear_white = assets.duplicate_asset("/Engine/EngineResources/WhiteSquareTexture", linear_white_path)
    if not linear_white:
        raise RuntimeError("Cannot create linear roughness default")
    linear_white.set_editor_property("srgb", False)
    if not assets.save_loaded_asset(linear_white, only_if_is_dirty=False):
        raise RuntimeError("Cannot save linear roughness default")
    maps = {}
    for row, (name, sampler, default) in enumerate([
        ("baseColorTexture", unreal.MaterialSamplerType.SAMPLERTYPE_COLOR, "/Engine/EngineResources/DefaultTexture.DefaultTexture"),
        ("normalTexture", unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL, "/Engine/EngineMaterials/DefaultNormal.DefaultNormal"),
        ("metallicRoughnessTexture", unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR, linear_white_path)
    ]):
        sample = expression(mat, unreal.MaterialExpressionTextureSampleParameter2D, -950, row * 250)
        sample.set_editor_property("parameter_name", name)
        texture = assets.load_asset(default)
        if not texture:
            raise RuntimeError("Missing engine default texture: " + default)
        sample.set_editor_property("texture", texture)
        sample.set_editor_property("sampler_type", sampler)
        connect(uv, sample, "UVs")
        maps[name] = sample
    # Geography remains shaded terrain. Political tint grows only at strategic distance.
    camera = expression(mat, unreal.MaterialExpressionCameraPositionWS, -1600, -450)
    distance = expression(mat, unreal.MaterialExpressionDistance, -1400, -400)
    connect(camera, distance, "A")
    connect(world, distance, "B")
    scaled = expression(mat, unreal.MaterialExpressionDivide, -1200, -400)
    scaled.set_editor_property("const_b", 50000000.0)
    connect(distance, scaled, "A")
    bounded = expression(mat, unreal.MaterialExpressionSaturate, -1000, -400)
    connect(scaled, bounded, "")
    weight = expression(mat, unreal.MaterialExpressionMultiply, -800, -400)
    weight.set_editor_property("const_b", .18)
    connect(bounded, weight, "A")
    nation = expression(mat, unreal.MaterialExpressionVertexColor, -800, -200)
    # The north-up world uses affine longitude/latitude positions. Reconstruct
    # satellite UV in full float precision; mesh UV0 is half precision and
    # loses coast-scale detail even though the original image is fully loaded.
    # CPD comes from the original geographic tile, never its wrapped position.
    global_origin = expression(mat, unreal.MaterialExpressionVectorParameter, -2300, -900)
    global_origin.set_editor_property("parameter_name", "GlobalTextureOrigin")
    global_origin.set_editor_property("use_custom_primitive_data", True)
    global_origin.set_editor_property("primitive_data_index", 4)
    uv_components = []
    for channel, factor in [("g", 1.0), ("r", -2.0)]:
        component = expression(mat, unreal.MaterialExpressionComponentMask, -2300, -1150-len(uv_components)*200)
        for mask_channel in ["r", "g", "b", "a"]:
            component.set_editor_property(mask_channel, mask_channel == channel)
        connect(local, component, "")
        # The legacy UE material translator prints scalar constants with only
        # eight fractional digits. Multiplying by ~2.5e-10 therefore compiles
        # to zero, leaving one satellite colour for an entire tile. Dividing
        # by a large denominator preserves the spatial term in generated HLSL.
        scale = expression(mat, unreal.MaterialExpressionDivide, -2100, -1150-len(uv_components)*200)
        scale.set_editor_property("const_b", (2.0 * 3.141592653589793 * 6371000.0 * 100.0) / factor)
        scale.set_editor_property("desc", "Satellite longitude UV" if channel == "g" else "Satellite latitude UV")
        connect(component, scale, "A")
        uv_components.append(scale)
    global_delta = expression(mat, unreal.MaterialExpressionAppendVector, -1900, -1100)
    connect(uv_components[0], global_delta, "A")
    connect(uv_components[1], global_delta, "B")
    origin_xy = expression(mat, unreal.MaterialExpressionComponentMask, -1900, -900)
    origin_xy.set_editor_property("r", True)
    origin_xy.set_editor_property("g", True)
    origin_xy.set_editor_property("b", False)
    origin_xy.set_editor_property("a", False)
    connect(global_origin, origin_xy, "")
    global_uv = expression(mat, unreal.MaterialExpressionAdd, -1600, -900)
    connect(global_delta, global_uv, "A")
    connect(origin_xy, global_uv, "B")
    satellite = expression(mat, unreal.MaterialExpressionTextureSampleParameter2D, -1350, -900)
    satellite.set_editor_property("parameter_name", "globalColorTexture")
    satellite.set_editor_property("texture", assets.load_asset("/Engine/EngineResources/WhiteSquareTexture"))
    satellite.set_editor_property("sampler_type", unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
    connect(global_uv, satellite, "UVs")
    # Satellite color preserves regional vegetation/desert/ice. The local scan
    # adds surface variation only on approach; it never replaces global color.
    # Layer bounded local, landscape and regional detail. The regional imagery
    # supplies geography/biome colour; approaching it reveals surface structure
    # instead of enlarging a single satellite pixel or repeating one small scan.
    blended_detail = maps["baseColorTexture"]
    detail_output = "RGB"
    for layer, repeat in enumerate([16.0, 96.0]):
        scale = expression(mat, unreal.MaterialExpressionDivide, -1550, -1250-layer*300)
        scale.set_editor_property("const_b", repeat)
        connect(uv, scale, "A")
        sample = expression(mat, unreal.MaterialExpressionTextureSampleParameter2D, -1300, -1250-layer*300)
        sample.set_editor_property("parameter_name", "baseColorTexture")
        sample.set_editor_property("texture", assets.load_asset("/Engine/EngineResources/DefaultTexture.DefaultTexture"))
        sample.set_editor_property("sampler_type", unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
        connect(scale, sample, "UVs")
        mix = expression(mat, unreal.MaterialExpressionLinearInterpolate, -1050+layer*180, -1100-layer*300)
        mix.set_editor_property("const_alpha", .5)
        connect(blended_detail, mix, "A", detail_output)
        connect(sample, mix, "B", "RGB")
        blended_detail, detail_output = mix, ""
    texture_detail = expression(mat, unreal.MaterialExpressionMultiply, -900, -800)
    texture_detail.set_editor_property("const_b", 1.1)
    connect(blended_detail, texture_detail, "A", detail_output)
    detail_bias = expression(mat, unreal.MaterialExpressionAdd, -700, -800)
    detail_bias.set_editor_property("const_b", .45)
    connect(texture_detail, detail_bias, "A")
    close_color = expression(mat, unreal.MaterialExpressionMultiply, -500, -800)
    connect(satellite, close_color, "A", "RGB")
    connect(detail_bias, close_color, "B")
    surface_color = expression(mat, unreal.MaterialExpressionLinearInterpolate, -250, -600)
    connect(close_color, surface_color, "A")
    connect(satellite, surface_color, "B", "RGB")
    connect(bounded, surface_color, "Alpha")
    color = expression(mat, unreal.MaterialExpressionLinearInterpolate, 0, 0)
    connect(surface_color, color, "A")
    connect(nation, color, "B")
    connect(weight, color, "Alpha")
    editing.connect_material_property(color, "", unreal.MaterialProperty.MP_BASE_COLOR)
    editing.connect_material_property(maps["metallicRoughnessTexture"], "G", unreal.MaterialProperty.MP_ROUGHNESS)
    normal_delta = expression(mat, unreal.MaterialExpressionSubtract, -700, 350)
    connect(maps["normalTexture"], normal_delta, "A", "RGB")
    flat = expression(mat, unreal.MaterialExpressionConstant3Vector, -950, 800)
    flat.set_editor_property("constant", unreal.LinearColor(0, 0, 1, 1))
    connect(flat, normal_delta, "B")
    detail = expression(mat, unreal.MaterialExpressionMultiply, -500, 350)
    detail.set_editor_property("const_b", .35)
    connect(normal_delta, detail, "A")
    geometry_normal = expression(mat, unreal.MaterialExpressionVertexNormalWS, -700, 700)
    combined = expression(mat, unreal.MaterialExpressionAdd, -300, 400)
    connect(geometry_normal, combined, "A")
    connect(detail, combined, "B")
    normalized = expression(mat, unreal.MaterialExpressionNormalize, -100, 400)
    connect(combined, normalized, "VectorInput")
    editing.connect_material_property(normalized, "", unreal.MaterialProperty.MP_NORMAL)
    errors = editing.recompile_material(mat)
    if errors:
        raise RuntimeError("Terrain surface compilation: " + str(errors))
    assets.set_metadata_tag(mat, "WNTTerrainShaderSchema", shader_schema)
    if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
        raise RuntimeError("Cannot save terrain surface material")
    changed.append(asset_path)


material("M_Ship", .85, .12)
material("M_Terrain", 1.0, 0.0)
terrain_surface()
material("M_Ocean", .26, .15, color=(.018, .065, .10), parameter="BaseColor")
material("M_Line", 1.0, 0.0, unlit=True)
material("M_Marker", 1.0, 0.0, unlit=True, color=(.5, .65, .8))
material("M_Port", .9, 0.0, color=(.35, .38, .4))

map_path = "/Game/Maps/WNTWorld"
if assets.does_asset_exist(map_path):
    preserved.append(map_path)
else:
    level = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
    if not level.new_level(map_path):
        raise RuntimeError("Cannot create native world map")
    # The controller owns world/camera creation; WNTWorldActor owns lighting.
    if not level.save_current_level():
        raise RuntimeError("Cannot save native world map")
    changed.append(map_path)

import importlib.util

ocean_module_spec = importlib.util.spec_from_file_location("wnt_ocean_materials", Path(__file__).with_name("PrepareOceanDetail.py"))
ocean_module = importlib.util.module_from_spec(ocean_module_spec)
ocean_module_spec.loader.exec_module(ocean_module)
ocean_changed, ocean_preserved = ocean_module.prepare(force)
changed.extend(ocean_changed)
preserved.extend(ocean_preserved)

status = {"format": 1, "success": True, "created_or_updated": changed, "preserved": preserved, "force": force}
destination = Path(unreal.Paths.project_saved_dir()) / "WNTAssetPreparation.json"
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(status, indent=2), encoding="utf-8")
unreal.log("WNT native bootstrap assets prepared: " + json.dumps(status))
