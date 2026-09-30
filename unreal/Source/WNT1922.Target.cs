using UnrealBuildTool;
using System.Collections.Generic;
public class WNT1922Target : TargetRules
{
    public WNT1922Target(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("WNT1922");
    }
}
