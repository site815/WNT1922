"""Create missing native bootstrap assets inside Unreal's editor.

Existing artist assets are preserved unless WNT_FORCE_ASSETS=1 is explicitly set.
The generated terrain master also refreshes when its shader schema changes.
"""
import json
import os
from pathlib import Path
import unreal
import importlib.util

projection_spec = importlib.util.spec_from_file_location("wnt_chart_projection", Path(__file__).with_name("PrepareChartProjection.py"))
projection = importlib.util.module_from_spec(projection_spec)
projection_spec.loader.exec_module(projection)

force = os.environ.get("WNT_FORCE_ASSETS") == "1"
assets = unreal.get_editor_subsystem(unreal.EditorAssetSubsystem)
tools = unreal.AssetToolsHelpers.get_asset_tools()
editing = unreal.MaterialEditingLibrary
changed, preserved = [], []


def clear_expressions(material):
    # UE 5.8's DeleteAllMaterialExpressions iterates the expression array while
    # DeleteMaterialExpression removes entries from it. A single call can skip
    # old nodes (and retain their texture dependencies). Require actual emptiness
    # before constructing a replacement graph, with bounded progress each pass.
    remaining = editing.get_num_material_expressions(material)
    while remaining:
        editing.delete_all_material_expressions(material)
        current = editing.get_num_material_expressions(material)
        if current >= remaining:
            raise RuntimeError("Cannot clear material graph: " + material.get_path_name())
        remaining = current


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


def material(name, roughness, metallic, unlit=False, color=None, parameter="Tint", instanced=False, projected=False):
    asset_path = "/Game/Materials/" + name
    exists = assets.does_asset_exist(asset_path)
    refresh_projection = projected and exists and assets.get_metadata_tag(assets.load_asset(asset_path), "WNTChartProjectionSchema") != projection.SCHEMA
    if exists and not force and not refresh_projection:
        if instanced:
            mat = assets.load_asset(asset_path)
            if not isinstance(mat, unreal.Material):
                raise RuntimeError("Material path has an incompatible asset: " + asset_path)
            # Cook the instanced vertex-factory permutation explicitly. Runtime
            # usage discovery cannot compile it in Shipping and falls back to
            # the gray default material. Preserve the existing authored graph.
            if not mat.get_editor_property("used_with_instanced_static_meshes"):
                mat.set_editor_property("used_with_instanced_static_meshes", True)
                errors = editing.recompile_material(mat)
                if errors:
                    raise RuntimeError("Instanced material compilation failed for " + name + ": " + str(errors))
                if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
                    raise RuntimeError("Cannot save instanced material: " + asset_path)
                changed.append(asset_path)
                return
        preserved.append(asset_path)
        return
    mat = assets.load_asset(asset_path) if exists else tools.create_asset(name, "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    if not isinstance(mat, unreal.Material):
        raise RuntimeError("Material path has an incompatible asset: " + asset_path)
    if exists:
        clear_expressions(mat)
    mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_OPAQUE)
    mat.set_editor_property("two_sided", False)
    if instanced:
        mat.set_editor_property("used_with_instanced_static_meshes", True)
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
    if projected:
        projection.add_projection(mat, correct_normals=not unlit)
        assets.set_metadata_tag(mat, "WNTChartProjectionSchema", projection.SCHEMA)
    compile_errors = editing.recompile_material(mat)
    if compile_errors:
        raise RuntimeError("Material compilation failed for " + name + ": " + "; ".join(str(error) for error in compile_errors))
    if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
        raise RuntimeError("Cannot save material: " + asset_path)
    changed.append(asset_path)


def terrain_surface():
    """Lit geometric relief with CPU-authored elevation/climate vertex colors."""
    asset_path = "/Game/Materials/M_TerrainSurface"
    shader_schema = "6-equal-earth-geometric"
    existing = assets.load_asset(asset_path) if assets.does_asset_exist(asset_path) else None
    if existing and not force and assets.get_metadata_tag(existing, "WNTTerrainShaderSchema") == shader_schema:
        preserved.append(asset_path)
        return
    mat = existing if existing else tools.create_asset(
        "M_TerrainSurface", "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    clear_expressions(mat)
    mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_OPAQUE)
    mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_DEFAULT_LIT)
    mat.set_editor_property("tangent_space_normal", False)
    mat.set_editor_property("two_sided", False)
    color = expression(mat, unreal.MaterialExpressionVertexColor, -450, 0)
    if not editing.connect_material_property(color, "", unreal.MaterialProperty.MP_BASE_COLOR):
        raise RuntimeError("Cannot connect geometric terrain color")
    # Elevation supplies relief; the chart shear only changes east coordinates.
    scalar(mat, "Roughness", 1.0, unreal.MaterialProperty.MP_ROUGHNESS, 150)
    scalar(mat, "Metallic", 0.0, unreal.MaterialProperty.MP_METALLIC, 300)
    scalar(mat, "Specular", .12, unreal.MaterialProperty.MP_SPECULAR, 450)
    projection.add_projection(mat, correct_normals=True)
    errors = editing.recompile_material(mat)
    if errors:
        raise RuntimeError("Geometric terrain compilation: " + str(errors))
    assets.set_metadata_tag(mat, "WNTTerrainShaderSchema", shader_schema)
    if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
        raise RuntimeError("Cannot save geometric terrain material")
    changed.append(asset_path)


def graticule_material():
    """A screen-filtered overlay on the existing fixed geographic ribbons."""
    asset_path = "/Game/Materials/M_Graticule"
    shader_schema = "3-equal-earth-filtered"
    existing = assets.load_asset(asset_path) if assets.does_asset_exist(asset_path) else None
    if existing and not force and assets.get_metadata_tag(existing, "WNTGraticuleShaderSchema") == shader_schema:
        preserved.append(asset_path)
        return
    mat = existing if existing else tools.create_asset(
        "M_Graticule", "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    clear_expressions(mat)
    mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_TRANSLUCENT)
    mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT)
    mat.set_editor_property("two_sided", True)
    # The graticule is a chart overlay, visible only at strategic distances.
    # It must not alternate against terrain/water depth as the camera moves.
    mat.set_editor_property("disable_depth_test", True)
    # This overlay needs no temporal reconstruction. UE's after-motion-blur
    # pass avoids reprojecting a thin chart line through jittered scene depth.
    mat.set_editor_property("translucency_pass", unreal.MaterialTranslucencyPass.MTP_AFTER_MOTION_BLUR)
    color = expression(mat, unreal.MaterialExpressionVertexColor, -700, -350)
    if not editing.connect_material_property(color, "", unreal.MaterialProperty.MP_EMISSIVE_COLOR):
        raise RuntimeError("Cannot connect graticule color")
    uv = expression(mat, unreal.MaterialExpressionTextureCoordinate, -1600, 0)
    uv.set_editor_property("coordinate_index", 0)
    across = expression(mat, unreal.MaterialExpressionComponentMask, -1400, 0)
    for channel in ["r", "g", "b", "a"]:
        across.set_editor_property(channel, channel == "r")
    connect(uv, across, "")
    derivatives = []
    for row, cls in enumerate([unreal.MaterialExpressionDDX, unreal.MaterialExpressionDDY]):
        derivative = expression(mat, cls, -1200, 250 + row * 200)
        connect(across, derivative, "")
        absolute = expression(mat, unreal.MaterialExpressionAbs, -1000, 250 + row * 200)
        connect(derivative, absolute, "")
        derivatives.append(absolute)
    footprint = expression(mat, unreal.MaterialExpressionAdd, -800, 300)
    connect(derivatives[0], footprint, "A")
    connect(derivatives[1], footprint, "B")
    bounded = expression(mat, unreal.MaterialExpressionMax, -600, 300)
    bounded.set_editor_property("const_b", .000001)
    connect(footprint, bounded, "A")
    centered = expression(mat, unreal.MaterialExpressionSubtract, -1200, 0)
    centered.set_editor_property("const_b", .5)
    connect(across, centered, "A")
    absolute = expression(mat, unreal.MaterialExpressionAbs, -1000, 0)
    connect(centered, absolute, "")
    pixels = expression(mat, unreal.MaterialExpressionDivide, -400, 0)
    connect(absolute, pixels, "A")
    connect(bounded, pixels, "B")
    core = expression(mat, unreal.MaterialExpressionSubtract, -200, 0)
    core.set_editor_property("const_b", .25)
    connect(pixels, core, "A")
    transition = expression(mat, unreal.MaterialExpressionDivide, 0, 0)
    transition.set_editor_property("const_b", .75)
    connect(core, transition, "A")
    coverage = expression(mat, unreal.MaterialExpressionSaturate, 200, 0)
    connect(transition, coverage, "")
    inverse = expression(mat, unreal.MaterialExpressionOneMinus, 400, 0)
    connect(coverage, inverse, "")
    opacity = expression(mat, unreal.MaterialExpressionMultiply, 600, 0)
    opacity.set_editor_property("const_b", .42)
    connect(inverse, opacity, "A")
    if not editing.connect_material_property(opacity, "", unreal.MaterialProperty.MP_OPACITY):
        raise RuntimeError("Cannot connect filtered graticule opacity")
    projection.add_projection(mat)
    errors = editing.recompile_material(mat)
    if errors:
        raise RuntimeError("Graticule compilation: " + str(errors))
    assets.set_metadata_tag(mat, "WNTGraticuleShaderSchema", shader_schema)
    if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
        raise RuntimeError("Cannot save graticule material")
    changed.append(asset_path)


def chart_symbol_material():
    asset_path = "/Game/Materials/M_ChartSymbol"
    schema = "1-vertex-color-depth-safe-chart"
    existing = assets.load_asset(asset_path) if assets.does_asset_exist(asset_path) else None
    if existing and not force and assets.get_metadata_tag(existing, "WNTChartSymbolSchema") == schema:
        preserved.append(asset_path)
        return
    mat = existing or tools.create_asset("M_ChartSymbol", "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    clear_expressions(mat)
    mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_TRANSLUCENT)
    mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT)
    mat.set_editor_property("two_sided", True)
    mat.set_editor_property("disable_depth_test", True)
    mat.set_editor_property("translucency_pass", unreal.MaterialTranslucencyPass.MTP_AFTER_MOTION_BLUR)
    color = expression(mat, unreal.MaterialExpressionVertexColor, -350, 0)
    tint = expression(mat, unreal.MaterialExpressionVectorParameter, -350, -180)
    tint.set_editor_property("parameter_name", "Tint")
    tint.set_editor_property("default_value", unreal.LinearColor(1, 1, 1, 1))
    tinted = expression(mat, unreal.MaterialExpressionMultiply, -100, 0)
    connect(color, tinted, "A")
    connect(tint, tinted, "B")
    if not editing.connect_material_property(tinted, "", unreal.MaterialProperty.MP_EMISSIVE_COLOR):
        raise RuntimeError("Cannot connect chart symbol color")
    if not editing.connect_material_property(color, "A", unreal.MaterialProperty.MP_OPACITY):
        raise RuntimeError("Cannot connect chart symbol opacity")
    errors = editing.recompile_material(mat)
    if errors:
        raise RuntimeError("Chart symbol material compilation: " + str(errors))
    assets.set_metadata_tag(mat, "WNTChartSymbolSchema", schema)
    if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
        raise RuntimeError("Cannot save chart symbol material")
    changed.append(asset_path)


material("M_Ship", .85, .12)
material("M_Terrain", 1.0, 0.0, projected=True)
terrain_surface()
graticule_material()
material("M_Ocean", .26, .15, color=(.018, .065, .10), parameter="BaseColor")
material("M_Line", 1.0, 0.0, unlit=True, projected=True)
material("M_Marker", 1.0, 0.0, unlit=True, color=(.5, .65, .8), instanced=True)
material("M_Port", .9, 0.0, color=(.35, .38, .4))
chart_symbol_material()

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
