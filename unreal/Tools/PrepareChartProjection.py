"""Equal Earth longitude shear shared by immutable native geographic meshes.

Stock procedural meshes use half-float UVs. UV1 contains exact high/mid integer
digits of the local east coefficient; UV2.x holds its fractional digit and
UV2.y holds its north derivative times 1024. CPD0 is longitude shift in degrees.
CPU tile transforms carry the centre shift. No engine modification is required.
"""
import unreal

SCHEMA = "2-equal-earth-relief-and-gpu-ribbons"


def add_projection(mat, correct_normals=False, ribbon=False, relief=False):
    edit = unreal.MaterialEditingLibrary

    def node(cls):
        value = edit.create_material_expression(mat, cls)
        if not value:
            raise RuntimeError("Cannot create chart projection expression")
        return value

    def wire(source, target, pin, output=""):
        if not edit.connect_material_expressions(source, output, target, pin):
            raise RuntimeError("Cannot connect chart projection " + pin)

    def custom(description, code, inputs):
        value = node(unreal.MaterialExpressionCustom)
        value.set_editor_property("description", description)
        value.set_editor_property("code", code)
        value.set_editor_property("output_type", unreal.CustomMaterialOutputType.CMOT_FLOAT3)
        pins = []
        for name in inputs:
            pin = unreal.CustomInput()
            pin.set_editor_property("input_name", name)
            pins.append(pin)
        value.set_editor_property("inputs", pins)
        for name, source in inputs.items():
            wire(source, value, name)
        return value

    uv = node(unreal.MaterialExpressionTextureCoordinate)
    uv.set_editor_property("coordinate_index", 1)
    fine = node(unreal.MaterialExpressionTextureCoordinate)
    fine.set_editor_property("coordinate_index", 2)
    shift = node(unreal.MaterialExpressionScalarParameter)
    shift.set_editor_property("parameter_name", "ChartLongitudeShift")
    shift.set_editor_property("default_value", 0.0)
    shift.set_editor_property("use_custom_primitive_data", True)
    shift.set_editor_property("primitive_data_index", 0)
    inputs = {"Geo": uv, "Fine": fine, "Shift": shift}
    height_code = "0"
    if relief:
        scale = node(unreal.MaterialExpressionScalarParameter)
        scale.set_editor_property("parameter_name", "ChartReliefScale")
        scale.set_editor_property("default_value", 1.0)
        scale.set_editor_property("use_custom_primitive_data", True)
        scale.set_editor_property("primitive_data_index", 2)
        position = node(unreal.MaterialExpressionWorldPosition)
        position.set_editor_property("world_position_shader_offset", unreal.WorldPositionIncludedOffsets.WPT_EXCLUDE_ALL_SHADER_OFFSETS)
        inputs.update({"Relief": scale, "Position": position})
        height_code = "max(0,Position.z)*(Relief-1)"
    code = f"float k=(Geo.x*4096.0+Geo.y*4.0)+Fine.x*4.0; return float3(0,k*Shift,{height_code});"
    if ribbon:
        extrusion = node(unreal.MaterialExpressionTextureCoordinate)
        extrusion.set_editor_property("coordinate_index", 3)
        width = node(unreal.MaterialExpressionScalarParameter)
        width.set_editor_property("parameter_name", "ChartRibbonWidthCentimetres")
        width.set_editor_property("default_value", 9600000.0)
        width.set_editor_property("use_custom_primitive_data", True)
        width.set_editor_property("primitive_data_index", 1)
        inputs.update({"Extrusion": extrusion, "Width": width})
        # Immutable vertices use a 100 m support. Longitude metadata belongs
        # to its centreline, not the support edge. Expand only in the shader;
        # no map-wide procedural vertex uploads during a wheel gesture.
        code = ("float k=(Geo.x*4096.0+Geo.y*4.0)+Fine.x*4.0; "
                "float2 d=Extrusion*(Width-10000.0); "
                f"return float3(d.x,d.y+Shift*(k+Fine.y/1024.0*Extrusion.x*Width),{height_code});")
    offset = custom("Equal Earth tile-local longitude shear", code, inputs)
    if not edit.connect_material_property(offset, "", unreal.MaterialProperty.MP_WORLD_POSITION_OFFSET):
        raise RuntimeError("Cannot connect Equal Earth displacement")
    if correct_normals:
        mat.set_editor_property("tangent_space_normal", False)
        normal = node(unreal.MaterialExpressionVertexNormalWS)
        normal_inputs = {"N": normal, "Fine": fine, "Shift": shift}
        normal_z = "N.z"
        if relief:
            normal_inputs["Relief"] = scale
            normal_z = "N.z/max(1,Relief)"
        transformed = custom("Equal Earth inverse-transpose geometric normal",
                             f"return normalize(float3(N.x-Shift*(Fine.y/1024.0)*N.y,N.y,{normal_z}));",
                             normal_inputs)
        interpolator = node(unreal.MaterialExpressionVertexInterpolator)
        wire(transformed, interpolator, "VS")
        if not edit.connect_material_property(interpolator, "", unreal.MaterialProperty.MP_NORMAL):
            raise RuntimeError("Cannot connect Equal Earth geometric normal")
    return offset
