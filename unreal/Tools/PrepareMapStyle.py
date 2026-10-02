"""Pixel-filtered political borders and truthful strategic campaign lines.

Invoked by PrepareAssets with its preparation context. Geometry, colors and
Equal Earth coefficients come from the terrain actor; these materials sample
no raster imagery and add no per-territory components.
"""
import unreal

SCHEMA = "1-political-lines-equal-earth"


def prepare_map_style(context):
    assets = context["assets"]
    tools = context["tools"]
    edit = context["editing"]
    projection = context["projection"]
    for name, half_width, casing in [("M_MapBorder", .6, .3), ("M_CampaignFront", 1.1, .65)]:
        path = "/Game/Materials/" + name
        existing = assets.load_asset(path) if assets.does_asset_exist(path) else None
        if existing and not context["force"] and assets.get_metadata_tag(existing, "WNTMapStyleSchema") == SCHEMA:
            context["preserved"].append(path)
            continue
        mat = existing or tools.create_asset(name, "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
        context["clear_expressions"](mat)
        mat.set_editor_property("blend_mode", unreal.BlendMode.BLEND_TRANSLUCENT)
        mat.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT)
        mat.set_editor_property("two_sided", True)
        mat.set_editor_property("disable_depth_test", True)
        mat.set_editor_property("translucency_pass", unreal.MaterialTranslucencyPass.MTP_AFTER_MOTION_BLUR)
        color = edit.create_material_expression(mat, unreal.MaterialExpressionVertexColor)
        uv = edit.create_material_expression(mat, unreal.MaterialExpressionTextureCoordinate)
        uv.set_editor_property("coordinate_index", 0)
        # fwidth accounts for camera angle, resolution and zoom. The CPU ribbon
        # supplies generous support; its world-space width is never the visible
        # line thickness. A soft dark casing keeps battle lines clear on snow.
        for output, code, prop in [
            (unreal.CustomMaterialOutputType.CMOT_FLOAT3,
             f"float px=abs(UV.x-.5)/max(abs(ddx(UV.x))+abs(ddy(UV.x)),1e-7); return lerp(Color.rgb*.28,Color.rgb,1-smoothstep({half_width},{half_width+casing},px));",
             unreal.MaterialProperty.MP_EMISSIVE_COLOR),
            (unreal.CustomMaterialOutputType.CMOT_FLOAT1,
             f"float px=abs(UV.x-.5)/max(abs(ddx(UV.x))+abs(ddy(UV.x)),1e-7); return Alpha*(1-smoothstep({half_width+casing},{half_width+casing+.75},px));",
             unreal.MaterialProperty.MP_OPACITY),
        ]:
            custom = edit.create_material_expression(mat, unreal.MaterialExpressionCustom)
            custom.set_editor_property("code", code)
            custom.set_editor_property("output_type", output)
            inputs = []
            for pin_name in ["UV", "Color", "Alpha"]:
                pin = unreal.CustomInput()
                pin.set_editor_property("input_name", pin_name)
                inputs.append(pin)
            custom.set_editor_property("inputs", inputs)
            if not edit.connect_material_expressions(uv, "", custom, "UV"):
                raise RuntimeError("Cannot wire map line UV")
            if not edit.connect_material_expressions(color, "", custom, "Color"):
                raise RuntimeError("Cannot wire map line color")
            if not edit.connect_material_expressions(color, "A", custom, "Alpha"):
                raise RuntimeError("Cannot wire map line alpha")
            if not edit.connect_material_property(custom, "", prop):
                raise RuntimeError("Cannot wire map line coverage")
        projection.add_projection(mat)
        errors = edit.recompile_material(mat)
        if errors:
            raise RuntimeError("Map line material compilation: " + str(errors))
        assets.set_metadata_tag(mat, "WNTMapStyleSchema", SCHEMA)
        if not assets.save_loaded_asset(mat, only_if_is_dirty=False):
            raise RuntimeError("Cannot save map line material")
        context["changed"].append(path)
