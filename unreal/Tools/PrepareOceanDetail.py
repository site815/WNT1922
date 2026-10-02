"""Create missing lit ocean and photographic sky materials; called by PrepareAssets.

The native actor supplies wave spectrum/phase parameters. No textures or plugins
are required by the water shader, and no CPU mesh rebuild occurs during play.
"""
import unreal
import importlib.util
from pathlib import Path


def prepare(force=False):
    spec = importlib.util.spec_from_file_location("wnt_ocean_chart_projection", Path(__file__).with_name("PrepareChartProjection.py"))
    projection = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(projection)
    assets = unreal.get_editor_subsystem(unreal.EditorAssetSubsystem)
    tools = unreal.AssetToolsHelpers.get_asset_tools()
    edit = unreal.MaterialEditingLibrary
    changed, preserved = [], []

    def node(mat, cls, x=0, y=0):
        result = edit.create_material_expression(mat, cls, x, y)
        if not result:
            raise RuntimeError("Cannot create ocean material node: " + str(cls))
        return result

    def wire(source, target, name="", output=""):
        if not edit.connect_material_expressions(source, output, target, name):
            raise RuntimeError("Cannot connect ocean material input " + name)

    def prop(source, target, output=""):
        if not edit.connect_material_property(source, output, target):
            raise RuntimeError("Cannot connect ocean material property " + str(target))

    def parameter(mat, name, value):
        vector = isinstance(value, tuple)
        result = node(mat, unreal.MaterialExpressionVectorParameter if vector else unreal.MaterialExpressionScalarParameter)
        result.set_editor_property("parameter_name", name)
        result.set_editor_property("default_value", unreal.LinearColor(*value) if vector else value)
        return result

    def custom(mat, description, code, inputs, output=unreal.CustomMaterialOutputType.CMOT_FLOAT3):
        result = node(mat, unreal.MaterialExpressionCustom)
        result.set_editor_property("description", description)
        result.set_editor_property("code", code)
        result.set_editor_property("output_type", output)
        pins = []
        for name in inputs:
            pin = unreal.CustomInput()
            pin.set_editor_property("input_name", name)
            pins.append(pin)
        result.set_editor_property("inputs", pins)
        for name, (source, channel) in inputs.items():
            wire(source, result, name, channel)
        return result

    def material(name):
        path = "/Game/Materials/" + name
        exists = assets.does_asset_exist(path)
        refresh_projection = name == "M_OceanFar" and exists and assets.get_metadata_tag(assets.load_asset(path), "WNTChartProjectionSchema") != projection.SCHEMA
        if exists and not force and not refresh_projection:
            preserved.append(path)
            return None
        mat = assets.load_asset(path) if exists else tools.create_asset(name, "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
        if not isinstance(mat, unreal.Material):
            raise RuntimeError("Incompatible native water material: " + path)
        # UE recompiles on each expression deletion. Remove terminal expressions
        # before their dependencies, otherwise an old Custom node briefly has
        # disconnected required inputs and logs a real shader-fallback warning.
        for property_ in [unreal.MaterialProperty.MP_BASE_COLOR, unreal.MaterialProperty.MP_METALLIC,
                          unreal.MaterialProperty.MP_SPECULAR, unreal.MaterialProperty.MP_ROUGHNESS,
                          unreal.MaterialProperty.MP_EMISSIVE_COLOR, unreal.MaterialProperty.MP_NORMAL,
                          unreal.MaterialProperty.MP_OPACITY, unreal.MaterialProperty.MP_OPACITY_MASK,
                          unreal.MaterialProperty.MP_WORLD_POSITION_OFFSET]:
            terminal = edit.get_material_property_input_node(mat, property_)
            if terminal:
                edit.delete_material_expression(mat, terminal)
        edit.delete_unused_expressions(mat)
        return mat

    def save(mat):
        errors = edit.recompile_material(mat)
        if errors:
            raise RuntimeError("Native water/sky shader compilation: " + str(errors))
        if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
            raise RuntimeError("Cannot save native water/sky material")
        changed.append(mat.get_path_name().split(".")[0])

    # Inputs remain native LWC values until world minus split patch origin has
    # been evaluated. The custom expressions only see nearby metre coordinates.
    for name, detailed in [("M_OceanFar", False), ("M_OceanDetail", True)]:
        mat = material(name)
        if not mat:
            continue
        mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_MASKED)
        mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_DEFAULT_LIT)
        mat.set_editor_property("two_sided", False)
        mat.set_editor_property("tangent_space_normal", False)
        world = node(mat, unreal.MaterialExpressionWorldPosition)
        world.set_editor_property("world_position_shader_offset", unreal.WorldPositionIncludedOffsets.WPT_EXCLUDE_ALL_SHADER_OFFSETS)
        high = parameter(mat, "PatchCentreHigh", (0, 0, 0, 0))
        low = parameter(mat, "PatchCentreLow", (0, 0, 0, 0))
        first = node(mat, unreal.MaterialExpressionSubtract)
        wire(world, first, "A"); wire(high, first, "B")
        local = node(mat, unreal.MaterialExpressionSubtract)
        wire(first, local, "A"); wire(low, local, "B")
        radius = parameter(mat, "PatchRadius", 74000.0)
        active = parameter(mat, "PatchActive", 0.0)
        strength = parameter(mat, "WaveStrength", 0.0)
        parameters = {"P": (local, ""), "Radius": (radius, ""), "Strength": (strength, "")}
        for index in range(8):
            parameters["W" + str(index)] = (parameter(mat, "Wave" + str(index), (0, 0, 0, 0)), "RGB")
        parameters["Phase0"] = (parameter(mat, "WavePhase0", (0, 0, 0, 0)), "RGBA")
        parameters["Phase1"] = (parameter(mat, "WavePhase1", (0, 0, 0, 0)), "RGBA")
        parameters["NoiseOrigin"] = (parameter(mat, "WaveNoiseOrigin", (0, 0, 0, 0)), "RGB")
        for index in range(5):
            parameters["Wind" + str(index)] = (parameter(mat, "WindOrigin" + str(index), (0, 0, 0, 0)), "RGB")
        common = """
float2 p=P.xy*.01;
float radius=Radius*.01;
float r=length(p);
float span=radius*.41;
float t=saturate((r-radius*.55)/span);
float window=1-t*t*(3-2*t);
float2 windowGradient=-(6*t*(1-t)/span)*p/max(r,.001);
float3 waves[8]={W0,W1,W2,W3,W4,W5,W6,W7};
float phases[8]={Phase0.x,Phase0.y,Phase0.z,Phase0.w,Phase1.x,Phase1.y,Phase1.z,Phase1.w};
float height=0;
float2 slope=0;
[unroll] for(int i=0;i<3;i++) {
    float phase=dot(p,waves[i].xy)+phases[i];
    height+=waves[i].z*sin(phase);
    slope+=waves[i].z*cos(phase)*waves[i].xy;
}
"""
        if detailed:
            displacement = custom(mat, "Resolved gravity-wave height in centimetres", common + "return float3(0,0,100*height*window*Strength);", parameters)
            prop(displacement, unreal.MaterialProperty.MP_WORLD_POSITION_OFFSET)
        else:
            chart_offset = projection.add_projection(mat)
            # Water masking and phase must use the same displaced chart point
            # as the visible surface, while near water remains camera-local.
            projected_local = node(mat, unreal.MaterialExpressionAdd)
            wire(local, projected_local, "A"); wire(chart_offset, projected_local, "B")
            local = projected_local
            parameters["P"] = (local, "")
            assets.set_metadata_tag(mat, "WNTChartProjectionSchema", projection.SCHEMA)
        normal_code = common + """
slope=Strength*(slope*window+height*windowGradient);
// Small wind waves use a multiscale anisotropic height field, rather than a
// handful of infinitely long periodic trains. Analytic noise derivatives give
// the true slope of each normal-only height field in metres.
// Integer wrapping is deliberate: CPU origin reduction must not change noise.
struct FWaterWindNoise {
    float Hash(float2 q) {
        uint2 cell=uint2(int2(q)&1023);
        uint h=cell.x*1597334677u^cell.y*3812015801u;
        h=(h^(h>>16))*2246822519u;
        h=(h^(h>>13))*3266489917u;
        return float((h^(h>>16))&16777215u)*(2.0/16777215.0)-1;
    }
    float3 Evaluate(float2 q) {
        float2 cell=floor(q),f=frac(q);
        float2 u=f*f*f*(f*(f*6-15)+10);
        float2 du=30*f*f*(f*(f-2)+1);
        float a=Hash(cell),b=Hash(cell+float2(1,0));
        float c=Hash(cell+float2(0,1)),d=Hash(cell+1);
        return float3(lerp(lerp(a,b,u.x),lerp(c,d,u.x),u.y),
            lerp(b-a,d-c,u.y)*du.x,lerp(c-a,d-b,u.x)*du.y);
    }
};
FWaterWindNoise wind;
float3 broad=wind.Evaluate((p+NoiseOrigin.xy)/64);
broad.yz/=64;
float packet=.8+.2*broad.x;
float2 packetGradient=.2*broad.yz;
float2 windOrigins[5]={Wind0.xy,Wind1.xy,Wind2.xy,Wind3.xy,Wind4.xy};
[unroll] for(int j=3;j<8;j++) {
    float2 along=waves[j].xy/6.28318530718;
    float2 across=float2(-along.y,along.x)*.35;
    float2 q=float2(dot(p,along),dot(p,across))+windOrigins[j-3]+float2(19*j,73*j);
    float footprint=max(length(ddx(q)),length(ddy(q)));
    // Noise gradients carry more bandwidth than heights: fade before a cell
    // becomes only two screen pixels, including at oblique viewing angles.
    float resolved=1-smoothstep(.125,.45,footprint);
    float3 ripple=wind.Evaluate(q);
    float2 gradient=ripple.y*along+ripple.z*across;
    slope+=resolved*(2*waves[j].z)*(packet*gradient+ripple.x*packetGradient);
}
return normalize(float3(-slope,1));
"""
        prop(custom(mat, "Band-limited analytic water normals", normal_code, parameters), unreal.MaterialProperty.MP_NORMAL)
        mask = custom(mat, "Complementary local/far water coverage",
                      "return Active>.5 && length(P.xy)<Radius ? 1 : 0;" if detailed else "return Active>.5 && length(P.xy)<Radius ? 0 : 1;",
                      {"P": (local, ""), "Radius": (radius, ""), "Active": (active, "")}, unreal.CustomMaterialOutputType.CMOT_FLOAT1)
        prop(mask, unreal.MaterialProperty.MP_OPACITY_MASK)
        prop(parameter(mat, "BaseColor", (.006, .027, .038, 1)), unreal.MaterialProperty.MP_BASE_COLOR)
        prop(parameter(mat, "Roughness", .23), unreal.MaterialProperty.MP_ROUGHNESS)
        # Water is a dielectric. UE's .255 specular corresponds to F0~.0204 (IOR 1.333).
        prop(parameter(mat, "Specular", .255), unreal.MaterialProperty.MP_SPECULAR)
        prop(parameter(mat, "Metallic", 0.0), unreal.MaterialProperty.MP_METALLIC)
        save(mat)

    sky = material("M_PhotographicSky")
    if sky:
        sky.set_editor_property("blend_mode", unreal.BlendMode.BLEND_OPAQUE)
        sky.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT)
        sky.set_editor_property("two_sided", True)
        sky.set_editor_property("is_sky", True)
        camera = node(sky, unreal.MaterialExpressionCameraVectorWS)
        inverse = node(sky, unreal.MaterialExpressionMultiply)
        inverse.set_editor_property("const_b", -1.0)
        wire(camera, inverse, "A")
        cube = node(sky, unreal.MaterialExpressionTextureSampleParameterCube)
        cube.set_editor_property("parameter_name", "SkyEnvironment")
        texture = assets.load_asset("/Engine/EngineResources/DefaultTextureCube.DefaultTextureCube")
        if not texture:
            raise RuntimeError("Cannot find engine default cubemap")
        if texture.get_editor_property("srgb"):
            path = "/Game/Materials/T_LinearSkyDefault"
            texture = assets.load_asset(path) or assets.duplicate_asset("/Engine/EngineResources/DefaultTextureCube", path)
            texture.set_editor_property("srgb", False)
            assets.save_loaded_asset(texture, only_if_is_dirty=False)
        cube.set_editor_property("texture", texture)
        cube.set_editor_property("sampler_type", unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
        wire(inverse, cube, "UVs")
        prop(cube, unreal.MaterialProperty.MP_EMISSIVE_COLOR, "RGB")
        save(sky)
    return changed, preserved


if __name__ == "__main__":
    import os
    unreal.log("WNT ocean/sky preparation: " + str(prepare(os.environ.get("WNT_FORCE_ASSETS") == "1")))
