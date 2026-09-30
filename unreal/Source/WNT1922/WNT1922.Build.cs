using UnrealBuildTool;
public class WNT1922 : ModuleRules
{
    public WNT1922(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new string[] {
            "Core", "CoreUObject", "Engine", "InputCore", "Json", "JsonUtilities",
            "ProceduralMeshComponent", "GeometryCore", "GeometryAlgorithms"
        });
        PrivateDependencyModuleNames.AddRange(new string[] {
            "Slate", "SlateCore", "WebBrowser", "ApplicationCore", "RenderCore", "RHI", "glTFRuntime"
        });
    }
}
