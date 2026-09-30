#if WITH_DEV_AUTOMATION_TESTS
#include "WNTShipActor.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "Dom/JsonObject.h"
#include "StaticMeshResources.h"
#include "HAL/FileManager.h"
#include "Misc/AutomationTest.h"
#include "Misc/CommandLine.h"
#include "Misc/FileHelper.h"
#include "Misc/Guid.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Misc/ScopeExit.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTDetailedModelsTest, "WNT.Ships.DetailedGLB",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FWNTDetailedModelsTest::RunTest(const FString& Parameters)
{
    FString Root;
    if (!FParse::Value(FCommandLine::Get(), TEXT("WNTDataRoot="), Root))
        Root = FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(), TEXT("..")));
    TArray<FString> Files;
    IFileManager::Get().FindFilesRecursive(Files, *FPaths::Combine(Root, TEXT("assets/models/ships")), TEXT("*.glb"), true, false);
    if (!TestTrue(TEXT("Detailed model collection is present"), !Files.IsEmpty())) return false;
    const auto Init = UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(true).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    const FName TestWorldName = MakeUniqueObjectName(GetTransientPackage(), UWorld::StaticClass(), TEXT("WNTDetailedModelTest"));
    UWorld* World = UWorld::CreateWorld(EWorldType::Game, false, TestWorldName, GetTransientPackage(), true, ERHIFeatureLevel::Num, &Init);
    if (!TestNotNull(TEXT("Model test world"), World)) return false;
    ON_SCOPE_EXIT { World->DestroyWorld(false); AWNTShipActor::ClearModelCache(); };
    for (const FString& File : Files)
    {
        AWNTShipActor* Ship = World->SpawnActor<AWNTShipActor>();
        if (!TestNotNull(TEXT("Detailed ship actor"), Ship)) continue;
        if (!TestTrue(FPaths::GetCleanFilename(File) + TEXT(" loads directly"), Ship->LoadModel(File))) continue;
        TestTrue(TEXT("Loaded GLB is the visible selectable model"), Ship->HasRenderableModel()
            && Ship->DetailedMesh->GetCollisionEnabled() == ECollisionEnabled::QueryOnly);
        UStaticMesh* Mesh = Ship->DetailedMesh->GetStaticMesh();
        if (!TestNotNull(TEXT("Native detailed mesh"), Mesh)) continue;
        const auto* Render = Mesh->GetRenderData();
        if (!TestTrue(TEXT("Native detailed render buffers"), Render && !Render->LODResources.IsEmpty())) continue;
        const auto& LOD = Render->LODResources[0];
        TestTrue(TEXT("Artist geometry was retained"), LOD.GetNumTriangles() > 5000);
        TestTrue(TEXT("UV coordinates were retained"), LOD.VertexBuffers.StaticMeshVertexBuffer.GetNumTexCoords() > 0);
        TestTrue(TEXT("Distinct physical surface materials were retained"), Mesh->GetStaticMaterials().Num() >= 3);
        const FBox Bounds = Mesh->GetBoundingBox();
        FString SourceText;TSharedPtr<FJsonObject> Source;
        const FString SourcePath=FPaths::ChangeExtension(File,TEXT("source.json"));
        const bool HasSource=FFileHelper::LoadFileToString(SourceText,*SourcePath)
            &&FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(SourceText),Source);
        if(TestTrue(TEXT("Detailed model has readable source dimensions"),HasSource))
        {
            const TSharedPtr<FJsonObject>* Dimensions=nullptr;
            const bool Authored=Source->TryGetObjectField(TEXT("dimensions"),Dimensions);
            if(!Authored)Source->TryGetObjectField(TEXT("historicalDimensions"),Dimensions);
            double Length=0,Beam=0;
            const bool Declared=Dimensions&&(*Dimensions)->TryGetNumberField(Authored?TEXT("length"):TEXT("lengthOverall"),Length)
                &&(*Dimensions)->TryGetNumberField(TEXT("beam"),Beam)&&Length>0&&Beam>0;
            if(TestTrue(TEXT("Model declares positive length and beam in metres"),Declared))
            {
                // Compare against this vessel, not a 100 m size cutoff that
                // rejects accurate torpedo boats and smaller destroyers.
                // Artist hull proportions/fittings can differ from historical
                // beam, as disclosed in their source sidecars; this checks
                // axis and unit conversion, not historical reconstruction.
                TestTrue(TEXT("Native ship length matches its declared metre scale"),
                    FMath::Abs(Bounds.GetSize().X*.01-Length)<=Length*.05);
                TestTrue(TEXT("Native transverse axis matches the declared beam"),
                    FMath::Abs(Bounds.GetSize().Y*.01-Beam)<=Beam*(Authored?.05:.2));
            }
        }
        TestTrue(TEXT("Full hull crosses the waterline on the native up axis"),Bounds.Min.Z<0&&Bounds.Max.Z>0);
        FHitResult SurfaceHit;
        const bool bSurfaceHit = Ship->DetailedMesh->LineTraceComponent(SurfaceHit,
            FVector(0, 0, Bounds.Max.Z + 5000), FVector(0, 0, Bounds.Min.Z - 5000),
            FCollisionQueryParams(SCENE_QUERY_STAT(WNTDetailedModelSurface), true));
        TestTrue(TEXT("Actual GLB deck surface answers a complex ray trace"),
            bSurfaceHit && SurfaceHit.Component.Get() == Ship->DetailedMesh.Get());
        int32 Faces = 0, Reversed = 0; double WorstFacing = -1;
        for (int32 I = 0; I + 2 < LOD.IndexBuffer.GetNumIndices(); I += 3)
        {
            const uint32 A = LOD.IndexBuffer.GetIndex(I), B = LOD.IndexBuffer.GetIndex(I + 1), C = LOD.IndexBuffer.GetIndex(I + 2);
            const FVector PA(LOD.VertexBuffers.PositionVertexBuffer.VertexPosition(A));
            const FVector PB(LOD.VertexBuffers.PositionVertexBuffer.VertexPosition(B));
            const FVector PC(LOD.VertexBuffers.PositionVertexBuffer.VertexPosition(C));
            const FVector N = FVector(LOD.VertexBuffers.StaticMeshVertexBuffer.VertexTangentZ(A))
                + FVector(LOD.VertexBuffers.StaticMeshVertexBuffer.VertexTangentZ(B))
                + FVector(LOD.VertexBuffers.StaticMeshVertexBuffer.VertexTangentZ(C));
            const FVector Cross = FVector::CrossProduct(PB - PA, PC - PA);
            if (Cross.SizeSquared() < 1e-12) continue;
            ++Faces;
            WorstFacing = FMath::Max(WorstFacing, FVector::DotProduct(Cross.GetSafeNormal(), N.GetSafeNormal()));
            if (FVector::DotProduct(Cross, N) > .00001) ++Reversed;
        }
        TestTrue(FString::Printf(TEXT("%s exterior fronts use Unreal winding (%d disagreeing faces; worst cosine %.9f)"),
            *FPaths::GetCleanFilename(File), Reversed, WorstFacing), Faces > 0 && Reversed == 0);
        // The revision cache should share native geometry between sister ships.
        auto* Sister = World->SpawnActor<AWNTShipActor>();
        TestTrue(TEXT("Shared detailed geometry cache"), Sister && Sister->LoadModel(File)
            && Sister->DetailedMesh->GetStaticMesh() == Mesh);
        Ship->SetModelCullDistance(50000);Ship->UpdateSymbolForCamera(FVector(1000000,0,0),FRotator(0,180,0));
        TestTrue(TEXT("Distant detailed geometry stays loaded but cannot be drawn or picked"),Ship->HasRenderableModel()
            &&!Ship->IsDetailedModelVisible()&&Ship->DetailedMesh->GetCollisionEnabled()==ECollisionEnabled::NoCollision);
        Ship->UpdateSymbolForCamera(FVector(10000,0,0),FRotator(0,180,0));
        TestTrue(TEXT("Detailed draw and picking both return on approach"),Ship->IsDetailedModelVisible()
            &&Ship->DetailedMesh->GetCollisionEnabled()==ECollisionEnabled::QueryOnly&&Ship->DetailedMesh->GetStaticMesh()==Mesh);
        Ship->SetModelCullDistance(0);Ship->UpdateSymbolForCamera(FVector(1000000,0,0),FRotator(0,180,0));
        TestTrue(TEXT("Battle and gallery zero-cull models remain visible and selectable"),Ship->IsDetailedModelVisible()
            &&Ship->DetailedMesh->GetCollisionEnabled()==ECollisionEnabled::QueryOnly);
        TestTrue(TEXT("Successful GLB is neither pending nor failed"),!Ship->IsModelPending()&&!Ship->HasModelLoadError());
        Ship->SetPendingModel();
        TestTrue(TEXT("Changing the same hull key to an unmodeled class removes unrelated geometry"),Ship->IsModelPending()
            && !Ship->HasRenderableModel() && Ship->DetailedMesh->GetStaticMesh()==nullptr && Ship->ModelId.IsEmpty());
        TestTrue(TEXT("Finished model can replace a pending symbol directly"),Ship->LoadModel(File)&&Ship->HasRenderableModel()&&!Ship->IsModelPending());
        TestFalse(TEXT("A different missing detailed model fails"),Ship->LoadModel(File+TEXT("-missing.glb")));
        TestTrue(TEXT("Different-path failure cannot retain an unrelated previous hull"),Ship->HasModelLoadError()
            && !Ship->IsModelPending() && !Ship->HasRenderableModel() && Ship->ModelId.IsEmpty());
    }
    // Editing the same external file may transiently invalidate it. Retain its
    // last valid geometry while reporting the failure, then reload on repair.
    const FString Temp=FPaths::Combine(FPaths::ProjectSavedDir(),TEXT("wnt-model-reload-")+FGuid::NewGuid().ToString()+TEXT(".glb"));
    ON_SCOPE_EXIT{IFileManager::Get().Delete(*Temp,false,true);};
    if(TestEqual(TEXT("Copy detailed model for isolated hot-reload test"),IFileManager::Get().Copy(*Temp,*Files[0]),uint32(COPY_OK)))
    {
        auto* Reload=World->SpawnActor<AWNTShipActor>();
        if(TestTrue(TEXT("Hot-reload initial model loads"),Reload&&Reload->LoadModel(Temp)))
        {
            UStaticMesh* ValidMesh=Reload->DetailedMesh->GetStaticMesh();IFileManager::Get().Delete(*Temp,false,true);
            TestFalse(TEXT("Removed same-path GLB reports failure"),Reload->LoadModel(Temp));
            TestTrue(TEXT("Only the same-path failed edit retains its valid geometry"),Reload->HasModelLoadError()&&!Reload->IsModelPending()
                &&Reload->HasRenderableModel()&&Reload->DetailedMesh->GetStaticMesh()==ValidMesh);
            auto* UnloadedSister=World->SpawnActor<AWNTShipActor>();
            if(!TestNotNull(TEXT("Unloaded sister shares the failed file revision"),UnloadedSister))return false;
            TestFalse(TEXT("Same failed revision remains an error for a new sister"),UnloadedSister->LoadModel(Temp));
            TestTrue(TEXT("Failure cache never lends another actor's last valid hull"),UnloadedSister->HasModelLoadError()
                &&!UnloadedSister->HasRenderableModel()&&!UnloadedSister->IsModelPending());
            TestEqual(TEXT("Repair isolated GLB file"),IFileManager::Get().Copy(*Temp,*Files[0]),uint32(COPY_OK));
            TestTrue(TEXT("Repaired direct GLB clears load failure"),Reload->LoadModel(Temp)&&Reload->HasRenderableModel()&&!Reload->HasModelLoadError());
            TestTrue(TEXT("Changed file revision also repairs the new sister"),UnloadedSister->LoadModel(Temp)
                &&UnloadedSister->HasRenderableModel()&&!UnloadedSister->HasModelLoadError());
        }
    }
    return true;
}
#endif
