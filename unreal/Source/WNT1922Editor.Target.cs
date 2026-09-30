using UnrealBuildTool;
using System.Collections.Generic;
public class WNT1922EditorTarget : TargetRules
{
    public WNT1922EditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("WNT1922");
    }
}
