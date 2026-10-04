#include "WNTWorldActor.h"
#include "WNTProjection.h"
#include "WNTShipActor.h"
#include "WNTTerrainActor.h"
#include "WNTMapTileComponent.h"
#include "WNTVisualAssets.h"
#include "WNTOceanDetailActor.h"
#include "WNTBattleEffects.h"
#include "WNTBattleAircraft.h"
#include "WNTBattleTimeline.h"
#include "WNTPlayerController.h"

#include "Camera/PlayerCameraManager.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/BoxComponent.h"
#include "Components/MeshComponent.h"
#include "Components/SceneComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Engine/StaticMesh.h"
#include "Engine/TextureCube.h"
#include "Engine/World.h"
#include "Engine/Canvas.h"
#include "Engine/Engine.h"
#include "Engine/LocalPlayer.h"
#include "Engine/GameViewportClient.h"
#include "CanvasItem.h"
#include "CanvasTypes.h"
#include "BatchedElements.h"
#include "SceneView.h"
#include "RenderUtils.h"
#include "GameFramework/PlayerController.h"
#include "HAL/PlatformTime.h"
#include "Materials/MaterialInterface.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "ProceduralMeshComponent.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogWNTWorld, Log, All);

namespace
{
    // Same engine projection and post-processing as ProjectWorldLocationToScreen,
    // but the immutable view data is acquired once for this draw/pick call.
    struct FChartScreenProjection
    {
        const APlayerController* Player;
        FSceneViewProjectionData Data;
        FMatrix Matrix=FMatrix::Identity;
        bool bCached=false;
        explicit FChartScreenProjection(const APlayerController* InPlayer):Player(InPlayer)
        {
            if(const ULocalPlayer* Local=Player?Player->GetLocalPlayer():nullptr)
                if(Local->ViewportClient&&Local->GetProjectionData(Local->ViewportClient->Viewport,Data))
                {Matrix=Data.ComputeViewProjectionMatrix();bCached=true;}
        }
        bool Project(const FVector& Position,FVector2D& Screen) const
        {
            if(!bCached)return Player&&Player->ProjectWorldLocationToScreen(Position,Screen);
            return FSceneView::ProjectWorldToScreen(Position,Data.GetConstrainedViewRect(),Matrix,Screen)
                &&Player->PostProcessWorldToScreen(Position,Screen,false);
        }
    };
    // Keep FCanvas::DrawItem's normal immediate/deferred flush semantics while
    // submitting shared indexed vertices instead of expanding every triangle.
    class FChartCanvasItem final:public FCanvasItem
    {
    public:
        explicit FChartCanvasItem(TFunctionRef<void(FCanvas*)> InDraw):FCanvasItem(FVector2D::ZeroVector),DrawIndexed(InDraw){}
        void Draw(FCanvas* InCanvas) override {DrawIndexed(InCanvas);}
    private:
        TFunctionRef<void(FCanvas*)> DrawIndexed;
    };
    void ResetTemporalHistory(UWorld* World)
    {
        if (!World) return;
        for (auto It = World->GetPlayerControllerIterator(); It; ++It)
            if (auto* Controller = It->Get())
                if (Controller->PlayerCameraManager) Controller->PlayerCameraManager->SetGameCameraCutThisFrame();
    }
    constexpr double Radians = UE_DOUBLE_PI / 180.0;
    constexpr double RouteEarthMetres = 3440.065 * 1852.0;
    FString String(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key, const FString& Default = TEXT(""))
    {
        FString Value; return Object.IsValid() && Object->TryGetStringField(Key, Value) ? Value : Default;
    }
    FString Id(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key)
    {
        FString Value; double Number = 0;
        if (Object.IsValid() && Object->TryGetStringField(Key, Value)) return Value;
        return Object.IsValid() && Object->TryGetNumberField(Key, Number) ? FString::Printf(TEXT("%.0f"), Number) : TEXT("");
    }
    double Number(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key, double Default = 0)
    {
        double Value; return Object.IsValid() && Object->TryGetNumberField(Key, Value) && FMath::IsFinite(Value) ? Value : Default;
    }
    bool Boolean(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key, bool Default = false)
    {
        bool Value; return Object.IsValid() && Object->TryGetBoolField(Key, Value) ? Value : Default;
    }
    const TArray<TSharedPtr<FJsonValue>>& Array(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key)
    {
        static const TArray<TSharedPtr<FJsonValue>> Empty;
        const TArray<TSharedPtr<FJsonValue>>* Values = nullptr;
        return Object.IsValid() && Object->TryGetArrayField(Key, Values) && Values ? *Values : Empty;
    }
    TSharedPtr<FJsonObject> Object(const TSharedPtr<FJsonObject>& Parent, const TCHAR* Key)
    {
        const TSharedPtr<FJsonObject>* Value = nullptr;
        return Parent.IsValid() && Parent->TryGetObjectField(Key, Value) && Value ? *Value : nullptr;
    }
    bool Point(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key, FVector2D& Out)
    {
        const auto& Values = Array(Object, Key); double X, Y;
        if (Values.Num() != 2 || !Values[0]->TryGetNumber(X) || !Values[1]->TryGetNumber(Y) || !FMath::IsFinite(X) || !FMath::IsFinite(Y)) return false;
        Out = FVector2D(X, Y); return true;
    }
    FVector PositionMetres(const TSharedPtr<FJsonObject>& Object)
    {
        const auto& Values = Array(Object, TEXT("positionMetres"));
        double X = 0, Y = 0, Z = 0;
        if (Values.Num() == 3 && Values[0]->TryGetNumber(X) && Values[1]->TryGetNumber(Y) && Values[2]->TryGetNumber(Z)
            && FMath::IsFinite(X) && FMath::IsFinite(Y) && FMath::IsFinite(Z)) return FVector(X, Y, Z) * 100.0;
        return FVector::ZeroVector;
    }
    TSharedPtr<FJsonObject> ReadJson(const FString& Path, bool bMarkdown = false)
    {
        FString Text; TSharedPtr<FJsonObject> Result;
        if (!FFileHelper::LoadFileToString(Text, *Path)) return nullptr;
        if (bMarkdown)
        {
            const int32 Begin = Text.Find(TEXT("```json game-data"));
            if (Begin == INDEX_NONE) return nullptr;
            const int32 Body = Text.Find(TEXT("\n"), ESearchCase::CaseSensitive, ESearchDir::FromStart, Begin);
            const int32 End = Text.Find(TEXT("```"), ESearchCase::CaseSensitive, ESearchDir::FromStart, Body + 1);
            if (Body == INDEX_NONE || End == INDEX_NONE) return nullptr;
            Text = Text.Mid(Body + 1, End - Body - 1);
        }
        return FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), Result) ? Result : nullptr;
    }
    FVector2D Offset(const FVector2D& Anchor, double East, double North)
    {
        const double Distance = FMath::Sqrt(East * East + North * North);
        if (Distance < 1e-10) return Anchor;
        const double Angle = Distance / RouteEarthMetres, Bearing = FMath::Atan2(East, North), Latitude = Anchor.Y * Radians;
        const double Lat = FMath::Asin(FMath::Clamp(FMath::Sin(Latitude) * FMath::Cos(Angle) + FMath::Cos(Latitude) * FMath::Sin(Angle) * FMath::Cos(Bearing), -1.0, 1.0));
        const double Lon = Anchor.X * Radians + FMath::Atan2(FMath::Sin(Bearing) * FMath::Sin(Angle) * FMath::Cos(Latitude), FMath::Cos(Angle) - FMath::Sin(Latitude) * FMath::Sin(Lat));
        return FVector2D(WNTProjection::WrapLongitude(Lon / Radians), Lat / Radians);
    }
    double ProjectedYaw(const FVector2D& Position, double Heading, double Meridian)
    {
        const FVector2D Ahead = Offset(Position, FMath::Sin(Heading * Radians) * 100.0, FMath::Cos(Heading * Radians) * 100.0);
        const double Relative = WNTProjection::WrapLongitude(Position.X - Meridian);
        const FVector Here = WNTProjection::ForwardUnwrapped(FVector2D(Relative, Position.Y));
        const FVector There = WNTProjection::ForwardUnwrapped(FVector2D(Relative + WNTProjection::WrapLongitude(Ahead.X - Position.X), Ahead.Y));
        return FMath::Atan2(There.Y - Here.Y, There.X - Here.X) / Radians;
    }
    struct FNavigationSample { FVector2D Position; double Heading = 0; bool bValid = false; };
    FNavigationSample Sample(const TSharedPtr<FJsonObject>& Force, double Fraction)
    {
        FNavigationSample Result;
        Result.bValid = Point(Force, TEXT("position"), Result.Position);
        Result.Heading = Number(Force, TEXT("heading"));
        if (!Result.bValid) return Result;
        const auto Navigation = Object(Force, TEXT("navigation"));
        const auto& Segments = Array(Navigation, TEXT("segments"));
        if (Segments.IsEmpty() || Fraction >= 1.0) return Result;
        const double At = FMath::Lerp(Number(Navigation, TEXT("fromAt")), Number(Navigation, TEXT("toAt")), FMath::Clamp(Fraction, 0.0, 1.0));
        TSharedPtr<FJsonObject> Segment = Segments.Last()->AsObject();
        for (const auto& Value : Segments) if (At < Number(Value->AsObject(), TEXT("toAt"))) { Segment = Value->AsObject(); break; }
        FVector2D From, To, Course;
        if (!Point(Segment, TEXT("from"), From) || !Point(Segment, TEXT("to"), To)) return Result;
        const double T = FMath::Clamp((At - Number(Segment, TEXT("fromAt"))) / FMath::Max(1e-12, Number(Segment, TEXT("toAt")) - Number(Segment, TEXT("fromAt"))), 0.0, 1.0);
        Result.Position = FVector2D(WNTProjection::WrapLongitude(From.X + WNTProjection::WrapLongitude(To.X - From.X) * T), FMath::Lerp(From.Y, To.Y, T));
        Result.Heading = Number(Segment, TEXT("heading"));
        if (Boolean(Segment, TEXT("headingKnown")) && Point(Segment, TEXT("courseDelta"), Course) && !Course.IsNearlyZero())
            Result.Heading = FMath::Atan2(Course.X * FMath::Cos(Result.Position.Y * Radians), Course.Y) / Radians;
        return Result;
    }
    TSharedPtr<FJsonObject> Selection(const FString& Kind, const FString& Identity, const FString& Label)
    {
        auto Result = MakeShared<FJsonObject>(); Result->SetStringField(TEXT("kind"), Kind); Result->SetStringField(TEXT("id"), Identity); Result->SetStringField(TEXT("label"), Label); return Result;
    }
    FString MarkerKey(const FString& Identity, int32 Copy)
    {
        return Copy==0?Identity:Identity+FString::Printf(TEXT("|wrap:%d"),Copy);
    }
    FVector ChartPosition(const FVector2D& Geo, double Meridian, int32 Copy, double Height=0)
    {
        return WNTProjection::ForwardUnwrapped(FVector2D(WNTProjection::WrapLongitude(Geo.X-Meridian)+360.0*Copy,Geo.Y),Height);
    }
    // Same 100-unit, y-down paths as assets/ui/map-symbols.json and the SVG legend.
    UProceduralMeshComponent* ChartSymbol(AActor* Owner, const TSharedPtr<FJsonObject>& Spec,
        const FString& Kind, UMaterialInterface* Material, const FString& Variant=FString(), const FString& NationColor=FString())
    {
        const auto BaseSymbol=Object(Object(Spec,TEXT("symbols")),*Kind);
        if(!BaseSymbol.IsValid())return nullptr;
        const auto Symbol=MakeShared<FJsonObject>(*BaseSymbol);
        if(Kind==TEXT("fleet"))if(const auto Shape=Object(Object(Spec,TEXT("fleetVariants")),*Variant))
            for(const auto& Pair:Shape->Values)Symbol->SetField(Pair.Key,Pair.Value);
        if(NationColor.Len()==7&&NationColor[0]==TEXT('#'))Symbol->SetStringField(TEXT("color"),NationColor);
        auto* Mesh=NewObject<UProceduralMeshComponent>(Owner);
        Owner->AddInstanceComponent(Mesh);Mesh->SetupAttachment(Owner->GetRootComponent());
        Mesh->SetMobility(EComponentMobility::Movable);Mesh->SetCastShadow(false);
        // Retain shared vector paths and picking geometry, but never submit the
        // glyph to the 3D renderer. The HUD draws it after AA at physical pixels.
        Mesh->SetVisibility(false);
        Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);Mesh->SetTranslucentSortPriority(20);
        TArray<FVector> Vertices,Normals;TArray<int32> Indices;
        TArray<FVector2D> UVs;TArray<FLinearColor> Colors;TArray<FProcMeshTangent> Tangents;
        const auto Colour=[](const FString& Hex){return FLinearColor(FColor::FromHex(Hex));};
        const FLinearColor Backing=Colour(String(Spec,TEXT("backingColor")));
        auto AddVertex=[&](const FVector2D& P,const FLinearColor& Color)
        {
            Vertices.Add(FVector(0,-P.X*1000.,-P.Y*1000.));Normals.Add(FVector::ForwardVector);
            UVs.Add(FVector2D::ZeroVector);Colors.Add(Color);Tangents.Add(FProcMeshTangent(FVector::RightVector,false));
        };
        auto Disc=[&](FVector2D P,double Radius,FLinearColor Color)
        {
            const int32 Base=Vertices.Num();AddVertex(P,Color);
            // At the maximum chart width these rounded joints are only a few
            // physical pixels across. Eight sides stay within a quarter pixel.
            for(int32 I=0;I<8;++I)AddVertex(P+FVector2D(FMath::Cos(I*UE_DOUBLE_PI/4),FMath::Sin(I*UE_DOUBLE_PI/4))*Radius,Color);
            for(int32 I=0;I<8;++I)Indices.Append({Base,Base+1+I,Base+1+(I+1)%8});
        };
        auto Stroke=[&](FVector2D A,FVector2D B,double Width,FLinearColor Color,bool Caps=true)
        {
            const FVector2D Delta=(B-A).GetSafeNormal(),Side(-Delta.Y*Width*.5,Delta.X*Width*.5);const int32 Base=Vertices.Num();
            for(const FVector2D P:{A-Side,B-Side,B+Side,A+Side})AddVertex(P,Color);
            Indices.Append({Base,Base+1,Base+2,Base,Base+2,Base+3});
            if(Caps){Disc(A,Width*.5,Color);Disc(B,Width*.5,Color);}
        };
        auto Points=[](const TSharedPtr<FJsonObject>& Row)
        {
            TArray<FVector2D> Result;
            for(const auto& Value:Array(Row,TEXT("points")))
            {
                const auto& Pair=Value->AsArray();double X=0,Y=0;
                if(Pair.Num()==2&&Pair[0]->TryGetNumber(X)&&Pair[1]->TryGetNumber(Y)&&FMath::IsFinite(X)&&FMath::IsFinite(Y)
                    &&FMath::Abs(X)<=60&&FMath::Abs(Y)<=60)Result.Add(FVector2D(X,Y));
            }
            return Result;
        };
        auto Paths=[&](const TSharedPtr<FJsonObject>& Shape)
        {
            const FLinearColor Main=Colour(String(Shape,TEXT("color")));
            for(const auto& Value:Array(Shape,TEXT("polygons")))
            {
                const auto Row=Value->AsObject();const auto P=Points(Row);if(P.Num()<3)continue;
                const auto Color=Colour(String(Row,TEXT("color"),String(Shape,TEXT("color"))));
                FVector2D Centre=FVector2D::ZeroVector;for(const auto& Point:P)Centre+=Point;Centre/=P.Num();
                const int32 Base=Vertices.Num();AddVertex(Centre,Color);for(const auto& Point:P)AddVertex(Point,Color);
                for(int32 I=0;I<P.Num();++I)Indices.Append({Base,Base+1+I,Base+1+(I+1)%P.Num()});
                const double Casing=Number(Spec,TEXT("casingWidth"),4);
                for(int32 I=0;I<P.Num();++I){Stroke(P[I],P[(I+1)%P.Num()],Casing,Backing,false);Disc(P[I],Casing*.5,Backing);}
            }
            for(const auto& Value:Array(Shape,TEXT("strokes")))
            {
                const auto Row=Value->AsObject();const auto P=Points(Row);if(P.Num()<2)continue;
                const int32 Segments=P.Num()-1+(Boolean(Row,TEXT("closed"))?1:0);
                const double Width=FMath::Clamp(Number(Row,TEXT("width"),6),1.,12.);
                const FLinearColor Color=Row->HasField(TEXT("color"))?Colour(String(Row,TEXT("color"))):Main;
                for(int32 Layer=0;Layer<2;++Layer)
                {
                    const double LayerWidth=Width+(Layer==0?Number(Spec,TEXT("casingWidth"),4):0);
                    const FLinearColor Ink=Layer==0?Backing:Color;
                    for(int32 I=0;I<Segments;++I)Stroke(P[I],P[(I+1)%P.Num()],LayerWidth,Ink,false);
                    for(const auto& Point:P)Disc(Point,LayerWidth*.5,Ink);
                }
            }
        };
        auto SaveSection=[&](int32 Index)
        {
            // Store exact sRGB bytes, then decode for Canvas below. Quantizing
            // linear colors into eight bits visibly shifts dark national ink.
            Mesh->CreateMeshSection_LinearColor(Index,Vertices,Indices,Normals,UVs,Colors,Tangents,false,true);
            if(Material)Mesh->SetMaterial(Index,Material);
            Vertices.Reset();Indices.Reset();Normals.Reset();UVs.Reset();Colors.Reset();Tangents.Reset();
        };
        Paths(Symbol);SaveSection(0);
        if(Kind==TEXT("battle"))for(int32 Side=0;Side<2;++Side)
        {
            const double Sign=Side==0?-1.:1.;
            Stroke(FVector2D(Sign*27,-29),FVector2D(Sign*34,-36),4,FLinearColor::White);
            Stroke(FVector2D(Sign*27,-24),FVector2D(Sign*38,-25),3,FLinearColor::White);
            Stroke(FVector2D(Sign*22,-29),FVector2D(Sign*23,-40),3,FLinearColor::White);
            SaveSection(Side+1);
        }
        if(Kind==TEXT("fleet")||Kind==TEXT("convoy"))
        {Paths(Object(Spec,TEXT("selection")));SaveSection(3);Mesh->SetMeshSectionVisible(3,false);}
        Mesh->RegisterComponent();
        auto* HitBox=NewObject<UBoxComponent>(Owner);Owner->AddInstanceComponent(HitBox);HitBox->SetupAttachment(Owner->GetRootComponent());
        HitBox->SetMobility(EComponentMobility::Movable);HitBox->SetBoxExtent(FVector(40,50000,50000));HitBox->SetHiddenInGame(true);
        HitBox->SetCollisionEnabled(ECollisionEnabled::QueryOnly);HitBox->SetCollisionResponseToAllChannels(ECR_Ignore);HitBox->SetCollisionResponseToChannel(ECC_Visibility,ECR_Block);
        HitBox->SetGenerateOverlapEvents(false);HitBox->RegisterComponent();return Mesh;
    }
    AActor* PlainActor(UWorld* World, AActor* Owner)
    {
        auto* Actor = World->SpawnActor<AActor>(); if (!Actor) return nullptr; Actor->SetOwner(Owner);
        auto* Root = NewObject<USceneComponent>(Actor); Actor->AddInstanceComponent(Root); Actor->SetRootComponent(Root); Root->RegisterComponent(); return Actor;
    }
    FLinearColor BattleSymbolTint(double Time,int32 Side,bool Firing)
    {
        const float Amount=Firing?static_cast<float>(.5+.5*FMath::Sin(Time*3.+Side*UE_DOUBLE_PI)):.2f;
        return FMath::Lerp(FLinearColor(.42f,.19f,.07f),FLinearColor(1.f,.65f,.2f),Amount);
    }
    void PositionPortSymbol(AActor* Actor,const FVector& Ground,const FVector& Camera,const FRotator& CameraRotation,
        double Pixels=32,double ViewportWidth=1800,double HorizontalFOV=60)
    {
        const double Depth=FMath::Max(1.,FVector::DotProduct(Ground-Camera,CameraRotation.Vector()));
        const double CentimetresPerPixel=2.*Depth*FMath::Tan(FMath::DegreesToRadians(HorizontalFOV*.5))/FMath::Max(1.,ViewportWidth);
        Actor->SetActorScale3D(FVector(CentimetresPerPixel*Pixels/100000.));
        // Depth-safe chart material lets the centre stay at the exact geography.
        // No world-height lift or view-dependent drift away from its port/force.
        Actor->SetActorLocation(Ground);
        Actor->SetActorRotation(FRotationMatrix::MakeFromXZ(-CameraRotation.Vector(),CameraRotation.RotateVector(FVector::UpVector)).ToQuat());
    }

}

struct FWNTWorldRuntime
{
    TSharedPtr<FJsonObject> Packet, ChartSymbols;
    TSet<FString> SelectedForceIds;
    TMap<FString, FString> ModelFiles, PlatformModels, CustomDesignModels;
    TMap<FString, FString> LoadedWorldModels, LoadedBattleModels;
    TMap<FString, FLinearColor> Colours;
    TMap<FString, TWeakObjectPtr<AWNTShipActor>> Ships, BattleShips;
    TMap<FString, TWeakObjectPtr<AActor>> Markers;
    TArray<FString> MarkerDrawOrder;
    struct FPortLabel{TWeakObjectPtr<AActor> Actor;FString Key,Label;bool Major=false;double Capacity=0;};
    TArray<FPortLabel> PortLabels;
    int32 DrawnChartMarkers = 0;
    int32 DrawnPortLabels = 0;
    int32 ChartVertices = 0, ChartTriangles = 0;
    double ChartDrawMilliseconds = 0, ChartProjectionMilliseconds = 0, ChartBatchMilliseconds = 0;
    double ChartPortLabelsMilliseconds = 0;
    double MapRepositionMilliseconds = 0;
    double MapShipUpdateMilliseconds = 0;
    double PortReliefScale = 1;
    TMap<TWeakObjectPtr<AActor>, TSharedPtr<FJsonObject>> Selections;
    TMap<FString, FVector2D> PortPositions;
    TMap<FString, FVector2D> PublicPositions;
    struct FBattlePose { FVector From, To; double FromYaw = 0, ToYaw = 0; bool bSunk = false; FWNTBattleTrack Track; };
    TMap<FString, FBattlePose> BattlePoses;
    TMap<FString, FTransform> BattleSurfaceTransforms;
    struct FAirWing
    {
        struct FCount { double At=0; int32 Planes=0,Fighters=0; };
        FString Key,Side,Phase;
        int32 Planes=0,Fighters=0;
        FVector Position=FVector::ZeroVector;
        double Yaw=0;
        FWNTBattleTrack Track;
        TArray<FCount> Counts;
        FIntPoint CountAt(double At) const
        {
            FIntPoint Result(Planes,Fighters);
            if(!Counts.IsEmpty())Result=FIntPoint(Counts[0].Planes,Counts[0].Fighters);
            for(const auto& Count:Counts){if(Count.At>At)break;Result=FIntPoint(Count.Planes,Count.Fighters);}
            return Result;
        }
    };
    TArray<FAirWing> BattleAirWings;
    int32 VisibleAirWings=0;
    struct FShoreBattery
    {
        struct FHealth { double At=0,Health=1; };
        FString Key,Side,Label;
        FVector Position=FVector::ZeroVector;
        double Health=1;
        FWNTBattleTrack Track;
        TArray<FHealth> Conditions;
        double HealthAt(double At) const
        {
            if(Track.IsLost(At))return 0.;
            double Result=Conditions.IsEmpty()?Health:Conditions[0].Health;
            for(const auto& Condition:Conditions){if(Condition.At>At)break;Result=Condition.Health;}
            return Result;
        }
    };
    TArray<FShoreBattery> ShoreBatteries;
    int32 VisibleShoreBatteries=0;
    int32 VisibleBattleShipMarkers=0;
    FWNTBattleEffects BattleEffects;
    FWNTBattleAircraft BattleAircraft;
    FString BattleId;
    double BattleAt = 0;
    bool bBattleEffectsWereAnimating = false;
    bool bBattleMovie = false;
    double ReceivedAt = 0, Duration = 0, BattleReceivedAt = 0, BattleDuration = 0;
    double LastWorldFraction = -1, LastBattleFraction = -1;
    double BattlePacketApplyMilliseconds=0,BattlePacketApplyPeakMilliseconds=0;
    double BattleTimelineOriginSeconds=0,BattleSecondsPerRealSecond=0;
    double NextModelRefresh = 0, RouteWidth = 10000, BattleSymbolTime = 0;
    bool bGridVisible = true;
    FVector LastMarkerCamera = FVector(TNumericLimits<double>::Max());
    FQuat LastMarkerCameraRotation = FQuat::Identity;
    FIntPoint LastMarkerViewport=FIntPoint::ZeroValue;
    float LastMarkerFOV=-1;
};

void FWNTWorldRuntimeDeleter::operator()(FWNTWorldRuntime* Pointer) const { delete Pointer; }

AWNTWorldActor::AWNTWorldActor()
{
    PrimaryActorTick.bCanEverTick = true;
    SetRootComponent(CreateDefaultSubobject<USceneComponent>(TEXT("WorldRoot")));
    Ocean = CreateDefaultSubobject<USceneComponent>(TEXT("Ocean")); Ocean->SetupAttachment(RootComponent);
    Sun = CreateDefaultSubobject<UDirectionalLightComponent>(TEXT("Sun")); Sun->SetupAttachment(RootComponent);
    Sun->SetMobility(EComponentMobility::Movable);
    Sun->SetRelativeRotation(FRotator(-48, -32, 0)); Sun->SetIntensity(1.5f); Sun->SetLightColor(FLinearColor(1.0f, .94f, .82f));
    Sky = CreateDefaultSubobject<USkyLightComponent>(TEXT("Sky")); Sky->SetupAttachment(RootComponent);
    Sky->SetMobility(EComponentMobility::Movable); Sky->SetIntensity(.65f);
    SkyBackground = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PhotographicSky")); SkyBackground->SetupAttachment(RootComponent);
    SkyBackground->SetMobility(EComponentMobility::Movable);SkyBackground->SetCastShadow(false);
    SkyBackground->SetCollisionEnabled(ECollisionEnabled::NoCollision);SkyBackground->SetAffectDistanceFieldLighting(false);
    RouteMesh = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("OrderedRoute")); RouteMesh->SetupAttachment(RootComponent);
    RouteMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision); RouteMesh->SetCastShadow(false);
    Runtime.Reset(new FWNTWorldRuntime());
}
AWNTWorldActor::~AWNTWorldActor() = default;

bool AWNTWorldActor::Initialize(const FString& DataRoot)
{
    DataDirectory = FPaths::ConvertRelativePathToFull(DataRoot); FPaths::NormalizeDirectoryName(DataDirectory); LoadError.Reset();
    Runtime->ChartSymbols=ReadJson(FPaths::Combine(DataDirectory,TEXT("assets/ui/map-symbols.json")));
    if(Number(Runtime->ChartSymbols,TEXT("format"))!=1){LoadError=TEXT("Chart symbol specification is unavailable.");return false;}
    const auto Registry = ReadJson(FPaths::Combine(DataDirectory, TEXT("assets/models/ships/index.json")));
    if (!Registry.IsValid() || Number(Registry, TEXT("format")) != 1) { LoadError = TEXT("Ship model index is unavailable or unsupported."); return false; }
    Runtime->ModelFiles.Reset(); Runtime->PlatformModels.Reset(); Runtime->CustomDesignModels.Reset();
    for (const auto& Value : Array(Registry, TEXT("models")))
    {
        const auto Entry = Value->AsObject(); const FString ModelId = String(Entry, TEXT("id")), Relative = String(Entry, TEXT("file"));
        // Only data inside the registered model directory may be loaded.
        if (ModelId.IsEmpty() || Relative.Contains(TEXT("..")) || Relative.Contains(TEXT(":")) || !FPaths::IsRelative(Relative) || !(Relative.EndsWith(TEXT(".json")) || Relative.EndsWith(TEXT(".glb"))))
        { LoadError = TEXT("Invalid ship model path in index."); return false; }
        // Retain legacy JSON as source/reference data, never an active model or
        // an excuse to substitute a different class's finished hull.
        if (!Relative.EndsWith(TEXT(".glb"))) continue;
        Runtime->ModelFiles.Add(ModelId, FPaths::Combine(DataDirectory, TEXT("assets/models/ships"), Relative));
        for (const auto& PlatformValue : Array(Entry, TEXT("platforms")))
        {
            const auto Platform = PlatformValue->AsObject(); const FString Key = String(Platform, TEXT("campaign"));
            Runtime->PlatformModels.Add((Key.IsEmpty() ? TEXT("") : Key + TEXT(":")) + String(Platform, TEXT("id")), ModelId);
        }
    }
    if (const auto Fallbacks = Object(Registry, TEXT("fallbacks")))
        for (const auto& Pair : Fallbacks->Values)
        {
            FString Model;
            if (Pair.Value->TryGetString(Model) && Runtime->ModelFiles.Contains(Model))
                Runtime->CustomDesignModels.Add(FString(*Pair.Key), Model);
        }
    Runtime->Colours.Reset();
    if (const auto Profiles = ReadJson(FPaths::Combine(DataDirectory, TEXT("catalog/common/nations.md")), true))
        for (const auto& Pair : Profiles->Values)
        {
            // The shared document also contains a designs array; only national profiles have colours.
            const TSharedPtr<FJsonObject>* Profile = nullptr; FString Colour;
            if (Pair.Value.IsValid() && Pair.Value->TryGetObject(Profile) && Profile && (*Profile)->TryGetStringField(TEXT("color"), Colour))
                Runtime->Colours.Add(FString(*Pair.Key), FLinearColor(FColor::FromHex(Colour)));
        }
    UTextureCube* Environment=WNTVisualAssets::LoadSkyCube(DataDirectory);
    if(!Environment){LoadError=TEXT("Cannot load the external photographic HDR sky environment.");return false;}
    Sky->SourceType=SLS_SpecifiedCubemap;Sky->SetCubemap(Environment);
    auto* SkyMaterial=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_PhotographicSky.M_PhotographicSky"));
    auto* SkySphere=LoadObject<UStaticMesh>(nullptr,TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if(!SkyMaterial||!SkySphere){LoadError=TEXT("Cannot load the native HDR sky background material/mesh.");return false;}
    SkyBackground->SetStaticMesh(SkySphere);SkyBackground->SetRelativeScale3D(FVector(4.0e8));
    SkyBackground->SetMaterial(0,SkyMaterial);
    if(auto* Instance=SkyBackground->CreateDynamicMaterialInstance(0))Instance->SetTextureParameterValue(TEXT("SkyEnvironment"),Environment);
    if(!OceanDetail)OceanDetail=GetWorld()->SpawnActor<AWNTOceanDetailActor>();
    if(!OceanDetail){LoadError=TEXT("Cannot create detailed water surface.");return false;}
    OceanDetail->SetOwner(this);
    if(!OceanDetail->Initialize(LoadError))return false;
    if(!BuildOcean())return false;
    if (auto* Material = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/Materials/M_Line.M_Line"))) RouteMesh->SetMaterial(0, Material);
    if (!Terrain) Terrain = GetWorld()->SpawnActor<AWNTTerrainActor>();
    if (!Terrain) { LoadError = TEXT("Cannot create native terrain actor."); return false; }
    Terrain->SetOwner(this);
    if (!Terrain->Initialize(DataDirectory)) { LoadError = Terrain->GetLoadError(); return false; }
    Terrain->SetCentralMeridian(CentralMeridian); Sky->RecaptureSky(); return true;
}

bool AWNTWorldActor::BuildOcean()
{
    // Immutable Equal Earth tiles use the same latitude-dependent longitude
    // shear as land. Panning updates transforms/CPD, never ocean mesh buffers.
    UMaterialInterface* Material=OceanDetail?OceanDetail->GetFarMaterial():nullptr;
    if(!Material){LoadError=TEXT("Missing native ocean material. Run the Unreal asset preparation step.");return false;}
    if(!OceanTiles.IsEmpty())
    {
        for(UProceduralMeshComponent* Tile:OceanTiles)Tile->SetMaterial(0,Material);
        return true;
    }
    // Same 2.5-degree sampling with a quarter of the primitive updates/draws.
    constexpr int32 Divisions=12;
    constexpr double TileDegrees=30.0,Step=TileDegrees/Divisions;
    for(int32 Copy=-1;Copy<=1;++Copy)for(int32 Row=0;Row<6;++Row)for(int32 Column=0;Column<12;++Column)
    {
        const double West=-180+Column*TileDegrees,South=-90+Row*TileDegrees;
        const FVector Origin=WNTProjection::ForwardUnwrapped(FVector2D(West+TileDegrees*.5,South+TileDegrees*.5));
        TArray<FVector> Vertices,Normals;TArray<int32> Indices;TArray<FVector2D> UVs,ProjectionUVs,ProjectionFineUVs;TArray<FLinearColor> Colours;TArray<FProcMeshTangent> Tangents;
        FVector HalfExtent=FVector::ZeroVector;double ShearExtent=0;
        const double CentreScale=WNTProjection::EastUnitsPerDegree(South+TileDegrees*.5);
        for(int32 Y=0;Y<=Divisions;++Y)for(int32 X=0;X<=Divisions;++X)
        {
            const FVector Vertex=WNTProjection::ForwardUnwrapped(FVector2D(West+X*Step,South+Y*Step))-Origin;
            const double Shear=WNTProjection::EastUnitsPerDegree(South+Y*Step)-CentreScale;
            const auto Packed=WNTProjection::PackChartShear(Shear);
            Vertices.Add(Vertex);ProjectionUVs.Add(Packed.UV1);ProjectionFineUVs.Add(Packed.UV2);
            HalfExtent=HalfExtent.ComponentMax(Vertex.GetAbs());ShearExtent=FMath::Max(ShearExtent,FMath::Abs(Shear));
            Normals.Add(FVector::UpVector);UVs.Emplace(double(X)/Divisions,double(Y)/Divisions);
            Colours.Add(FLinearColor::White);Tangents.Emplace(FVector::ForwardVector,false);
        }
        for(int32 Y=0;Y<Divisions;++Y)for(int32 X=0;X<Divisions;++X)
        {
            const int32 A=Y*(Divisions+1)+X,B=A+1,C=A+Divisions+1,D=C+1;
            // Longitude is +Y and latitude is +X: A,B,C is clockwise from above.
            Indices.Append({A,B,C,B,D,C});
        }
        auto* Tile=NewObject<UWNTMapTileComponent>(this,*FString::Printf(TEXT("OceanTile_%d_%d_%d"),Copy,Row,Column));
        const double Shift=WNTTerrainGeometry::TileLongitudeShift(Origin,CentralMeridian,Copy);
        Tile->SetGeographicHalfExtent(HalfExtent+FVector(500,ShearExtent*FMath::Abs(Shift)+500,10000));
        Tile->SetCustomPrimitiveDataFloat(0,float(Shift));
        AddInstanceComponent(Tile);Tile->SetupAttachment(Ocean);Tile->SetRelativeLocation(WNTTerrainGeometry::WrappedTileOrigin(Origin,CentralMeridian,Copy));
        Tile->SetMobility(EComponentMobility::Movable);Tile->SetCastShadow(false);Tile->SetAffectDistanceFieldLighting(false);
        // Pointer geography uses the analytic surface; an undeformed physics
        // copy would intercept clicks at the old longitude after projection.
        Tile->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Tile->RegisterComponent();
        Tile->CreateMeshSection_LinearColor(0,Vertices,Indices,Normals,UVs,ProjectionUVs,ProjectionFineUVs,{},Colours,Tangents,false,false);
        if(Material)Tile->SetMaterial(0,Material);
        OceanTiles.Add(Tile);OceanTileOrigins.Add(Origin);OceanTileHalfExtents.Add(HalfExtent);OceanTileShearExtents.Add(ShearExtent);
    }
    return true;
}

FString AWNTWorldActor::ModelPath(const FString& ClassId, const FString& InCampaign, const FString& Type) const
{
    const FString* Model = Runtime->PlatformModels.Find(InCampaign + TEXT(":") + ClassId);
    if (!Model) Model = Runtime->PlatformModels.Find(ClassId);
    // Player-created designs have no historical class fit. Their explicitly
    // labelled original type model must never replace a missing catalog class.
    if (!Model && ClassId.StartsWith(TEXT("draft-"))) Model = Runtime->CustomDesignModels.Find(Type);
    return Model ? Runtime->ModelFiles.FindRef(*Model) : TEXT("");
}

void AWNTWorldActor::ApplyWorldPacket(const TSharedPtr<FJsonObject>& Packet)
{
    if (!Packet.IsValid() || Number(Packet, TEXT("format")) != 1) return;
    if(Boolean(Packet,TEXT("selectionOnly"))){ApplyWorldSelection(Packet);return;}
    const double Now = FPlatformTime::Seconds();
    // Tactical 60x emits one real 15-minute tick every 15 seconds. Interpolate
    // its observed interval continuously too; never extrapolate future orders.
    Runtime->Duration = Boolean(Packet, TEXT("paused")) || !Runtime->Packet.IsValid() ? 0.0 : FMath::Clamp(Now - Runtime->ReceivedAt, .05, 20.0);
    Runtime->ReceivedAt = Now; Runtime->Packet = Packet;
    const FString NextCampaign = String(Packet, TEXT("campaign"));
    if (Campaign != NextCampaign && Terrain)
    {
        Campaign = NextCampaign;
        const FString BaseMap=String(Packet,TEXT("baseMap"));
        Terrain->CampaignId = BaseMap==TEXT("1922")||BaseMap==TEXT("1936hindsight") ? BaseMap : Campaign==TEXT("campaign_1922") ? TEXT("1922") : TEXT("1936hindsight");
        if (!Terrain->Initialize(DataDirectory)) UE_LOG(LogWNTWorld, Error, TEXT("%s"), *Terrain->GetLoadError());
        Terrain->SetCentralMeridian(CentralMeridian);
    }
    TSet<FString> KeepShips, KeepMarkers, KeepPorts;
    if(const auto Spec=Object(Packet,TEXT("chartSymbols"));Number(Spec,TEXT("format"))==1)Runtime->ChartSymbols=Spec;
    Runtime->SelectedForceIds.Reset();
    for(const auto& Value:Array(Packet,TEXT("selectedForceIds"))){FString ForceId;if(Value->TryGetString(ForceId))Runtime->SelectedForceIds.Add(ForceId);}
    UMaterialInterface* MarkerMaterial=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_ChartSymbol.M_ChartSymbol"));
    auto Marker=[&](const FString& Key,const TSharedPtr<FJsonObject>& Pick)->AActor*
    {
        if(Packet->HasField(TEXT("instanceId")))Pick->SetField(TEXT("instanceId"),Packet->TryGetField(TEXT("instanceId")));
        AActor* CentralActor=nullptr;
        for(int32 Copy=-1;Copy<=1;++Copy)
        {
            const FString KeyCopy=MarkerKey(Key,Copy);
            KeepMarkers.Add(KeyCopy);AActor* Actor=Runtime->Markers.FindRef(KeyCopy).Get();
            const FName Style(*(String(Pick,TEXT("kind"))+TEXT(":")+String(Pick,TEXT("symbolVariant"))+TEXT(":")+String(Pick,TEXT("color"))));
            // Geometry is immutable between campaign packets. Recreate only
            // when casualties change the flagship role or ownership changes.
            if(Actor&&!Actor->Tags.Contains(Style)){Runtime->Selections.Remove(Actor);Actor->Destroy();Actor=nullptr;}
            if(!Actor)
            {
                Actor=PlainActor(GetWorld(),this);if(!Actor)continue;
                if(!ChartSymbol(Actor,Runtime->ChartSymbols,String(Pick,TEXT("kind")),MarkerMaterial,String(Pick,TEXT("symbolVariant")),String(Pick,TEXT("color")))){Actor->Destroy();continue;}
                Actor->Tags.Add(Style);
                Runtime->Markers.Add(KeyCopy,Actor);
            }
            auto CopyPick=MakeShared<FJsonObject>(*Pick);CopyPick->SetNumberField(TEXT("worldCopy"),Copy);
            Runtime->Selections.Add(Actor,CopyPick);if(Copy==0)CentralActor=Actor;
        }
        return CentralActor;
    };
    for (const auto& Value : Array(Packet, TEXT("forces")))
    {
        const auto Force = Value->AsObject(); const FString ForceId = Id(Force, TEXT("id")); const bool Merchant = Boolean(Force, TEXT("merchant"));
        FVector2D Geo; const bool Located = Point(Force, TEXT("position"), Geo);
        if (!Located) continue; // Explicitly unlocated, never placed at (0,0).
        auto FleetPick = Selection(Merchant ? TEXT("convoy") : TEXT("fleet"), ForceId, String(Force, TEXT("name")));
        FleetPick->SetStringField(TEXT("forceId"), ForceId);
        FleetPick->SetStringField(TEXT("nation"),String(Force,TEXT("nation"),String(Packet,TEXT("player"))));
        FleetPick->SetStringField(TEXT("color"),String(Force,TEXT("color")));
        FleetPick->SetStringField(TEXT("symbolVariant"),String(Force,TEXT("symbolVariant")));
        FleetPick->SetBoolField(TEXT("docked"),Boolean(Force,TEXT("docked")));
        FleetPick->SetBoolField(TEXT("selected"),Runtime->SelectedForceIds.Contains(ForceId));
        Marker(TEXT("force:")+ForceId,FleetPick);
        for (const auto& HullValue : Array(Force, TEXT("hulls")))
        {
            const auto Hull = HullValue->AsObject(); const FString Key = String(Hull, TEXT("key")); KeepShips.Add(Key);
            AWNTShipActor* Ship = Runtime->Ships.FindRef(Key).Get();
            if (!Ship) { Ship = GetWorld()->SpawnActor<AWNTShipActor>(); if (!Ship) continue; Ship->SetOwner(this); Runtime->Ships.Add(Key, Ship); }
            Ship->SetModelCullDistance(2000000.0f);
            const FString Path = ModelPath(String(Hull,TEXT("modelClassId"),String(Hull,TEXT("classId"))),String(Hull,TEXT("modelCampaign"),Campaign),String(Hull,TEXT("type")));
            if (Path.IsEmpty()) { Ship->SetPendingModel(); Runtime->LoadedWorldModels.Remove(Key); }
            else
            {
                Runtime->LoadedWorldModels.Add(Key, Path);
                Ship->SetModelReference(Path);
            }
            Ship->SelectionKey = Key;
            auto Pick = Selection(Merchant ? TEXT("merchant") : TEXT("ship"), Merchant ? ForceId : Id(Hull, TEXT("groupId")), String(Hull, TEXT("label")));
            Pick->SetStringField(TEXT("key"), Key); Pick->SetStringField(TEXT("forceId"), ForceId); Pick->SetStringField(TEXT("classId"), String(Hull, TEXT("classId")));
            Pick->SetNumberField(TEXT("hullIndex"), Number(Hull, TEXT("hullIndex")));
            Pick->SetBoolField(TEXT("representativeDesign"), !Path.IsEmpty() && String(Hull, TEXT("classId")).StartsWith(TEXT("draft-")));
            Pick->SetBoolField(TEXT("representativeModel"),Boolean(Hull,TEXT("representativeModel")));
            Pick->SetStringField(TEXT("modelClassId"),String(Hull,TEXT("modelClassId"),String(Hull,TEXT("classId"))));
            Pick->SetStringField(TEXT("modelCampaign"),String(Hull,TEXT("modelCampaign"),Campaign));
            if (Packet->HasField(TEXT("instanceId"))) Pick->SetField(TEXT("instanceId"), Packet->TryGetField(TEXT("instanceId")));
            Pick->SetStringField(Merchant ? TEXT("convoyId") : TEXT("fleetId"), ForceId); Runtime->Selections.Add(Ship, Pick);
        }
    }
    for (const auto& Value : Array(Packet, TEXT("contacts")))
    {
        const auto Contact = Value->AsObject(); FVector2D Geo; if (!Point(Contact, TEXT("position"), Geo)) continue;
        const FString ContactId = Id(Contact, TEXT("id")); auto Pick = Selection(TEXT("contact"), ContactId, String(Contact, TEXT("nation")) + TEXT(" · ") + String(Contact, TEXT("stage")) + TEXT(" report"));
        Pick->SetStringField(TEXT("nation"),String(Contact,TEXT("nation")));Pick->SetStringField(TEXT("color"),String(Contact,TEXT("color")));
        if (auto* Actor = Marker(TEXT("contact:") + ContactId, Pick)) Actor->SetActorLocation(WNTProjection::Forward(Geo, CentralMeridian));
    }
    for (const auto& Value : Array(Packet, TEXT("ports")))
    {
        const auto Port = Value->AsObject(); FVector2D Geo; if (!Point(Port, TEXT("position"), Geo)) continue;
        const FString PortId = Id(Port, TEXT("id")); KeepPorts.Add(PortId); Runtime->PortPositions.Add(PortId, Geo);
        auto PortPick = Selection(TEXT("port"), PortId, String(Port, TEXT("name")));
        PortPick->SetStringField(TEXT("nation"),String(Port,TEXT("owner")));PortPick->SetStringField(TEXT("color"),String(Port,TEXT("color")));
        PortPick->SetBoolField(TEXT("major"),Boolean(Port,TEXT("major"),true));
        PortPick->SetStringField(TEXT("tier"),String(Port,TEXT("tier"),TEXT("dock")));
        PortPick->SetNumberField(TEXT("capacity"),Number(Port,TEXT("capacity")));
        PortPick->SetStringField(TEXT("visualStatus"),TEXT("navigation-symbol")); PortPick->SetBoolField(TEXT("pendingScenery"),true);
        Marker(TEXT("port:") + PortId, PortPick);
    }
    Runtime->PublicPositions.Reset();
    for (const auto* Field : { TEXT("countries"), TEXT("fronts"), TEXT("battles") }) for (const auto& Value : Array(Packet, Field))
    {
        const auto Entry = Value->AsObject(); FVector2D Geo; if (!Point(Entry, TEXT("position"), Geo)) continue;
        const bool Country = FString(Field) == TEXT("countries"), Battle = FString(Field) == TEXT("battles");
        const FString Kind = Country ? TEXT("country") : Battle ? TEXT("battle") : TEXT("front"), Identity = Id(Entry, TEXT("id")), Key = Kind + TEXT(":") + Identity;
        Runtime->PublicPositions.Add(Key, Geo);
        auto Pick=Selection(Kind, Identity, String(Entry, Battle?TEXT("label"):TEXT("name")));
        if(Country){Pick->SetStringField(TEXT("nation"),Identity);Pick->SetStringField(TEXT("color"),String(Entry,TEXT("color")));}
        if(Battle)Pick->SetNumberField(TEXT("stage"),Number(Entry,TEXT("stage")));
        Marker(Key, Pick);
    }
    auto Prune = [&](auto& Actors, const TSet<FString>& Keep)
    {
        for (auto It = Actors.CreateIterator(); It; ++It) if (!Keep.Contains(It.Key()))
        { if (auto* Actor = It.Value().Get()) { Runtime->Selections.Remove(Actor); Actor->Destroy(); } It.RemoveCurrent(); }
    };
    Prune(Runtime->Ships, KeepShips); Prune(Runtime->Markers, KeepMarkers);
    Runtime->Markers.GetKeys(Runtime->MarkerDrawOrder);
    auto Rank=[&](const FString& Key)
    {
        const auto Pick=Runtime->Selections.FindRef(Runtime->Markers.FindRef(Key));
        const FString Kind=String(Pick,TEXT("kind"));
        return Boolean(Pick,TEXT("selected"))?8:Kind==TEXT("battle")?7:Kind==TEXT("fleet")?6:
            Kind==TEXT("contact")?5:Kind==TEXT("port")?4:Kind==TEXT("country")?3:Kind==TEXT("front")?2:1;
    };
    Runtime->MarkerDrawOrder.Sort([&](const FString& A,const FString& B)
    {const int32 AR=Rank(A),BR=Rank(B);return AR==BR?A<B:AR<BR;});
    Runtime->PortLabels.Reset();
    for(const auto& Key:Runtime->MarkerDrawOrder)if(auto* Actor=Runtime->Markers.FindRef(Key).Get())
    {
        const auto Pick=Runtime->Selections.FindRef(Actor);if(String(Pick,TEXT("kind"))!=TEXT("port"))continue;
        Runtime->PortLabels.Add({Actor,Key,String(Pick,TEXT("label")),Boolean(Pick,TEXT("major"),true),Number(Pick,TEXT("capacity"))});
    }
    Runtime->PortLabels.Sort([](const FWNTWorldRuntime::FPortLabel& A,const FWNTWorldRuntime::FPortLabel& B)
    {if(A.Major!=B.Major)return A.Major;return A.Capacity==B.Capacity?A.Key<B.Key:A.Capacity>B.Capacity;});
    for (auto It = Runtime->LoadedWorldModels.CreateIterator(); It; ++It) if (!KeepShips.Contains(It.Key())) It.RemoveCurrent();
    for (auto It = Runtime->PortPositions.CreateIterator(); It; ++It) if (!KeepPorts.Contains(It.Key())) It.RemoveCurrent();
    if (Terrain)
    {
        TMap<FString, FLinearColor> Controls;
        if (const auto Control = Object(Packet, TEXT("control"))) for (const auto& Pair : Control->Values)
            Controls.Add(FString(*Pair.Key), Runtime->Colours.Contains(Pair.Value->AsString()) ? Runtime->Colours[Pair.Value->AsString()] : FLinearColor(.2f, .24f, .27f));
        Terrain->SetControl(Controls);
        Terrain->ApplyCampaignFronts(Array(Packet,TEXT("fronts")));
        Terrain->ApplyCampaignOccupations(Array(Packet,TEXT("occupations")));
    }
    Runtime->LastMarkerCamera = FVector(TNumericLimits<double>::Max());
    RepositionPorts(); RebuildRoute(Runtime->RouteWidth); UpdateWorld(Runtime->Duration > 0 ? 0 : 1); UpdateVisibility();
}

void AWNTWorldActor::ApplyWorldSelection(const TSharedPtr<FJsonObject>& Packet)
{
    if(!Packet.IsValid()||!Runtime->Packet.IsValid()||String(Packet,TEXT("instanceId")).IsEmpty()
        ||String(Packet,TEXT("instanceId"))!=String(Runtime->Packet,TEXT("instanceId"))
        ||String(Packet,TEXT("campaign"))!=String(Runtime->Packet,TEXT("campaign"))
        ||String(Packet,TEXT("player"))!=String(Runtime->Packet,TEXT("player"))
        ||!Packet->HasTypedField<EJson::Number>(TEXT("revision"))
        ||Number(Packet,TEXT("revision"),-1)!=Number(Runtime->Packet,TEXT("revision"),-2)
        ||Number(Packet,TEXT("at"),-1)!=Number(Runtime->Packet,TEXT("at"),-2))return;
    TSet<FString> Known;
    for(const auto& Pair:Runtime->Markers)if(auto* Actor=Pair.Value.Get())
    {
        const auto Pick=Runtime->Selections.FindRef(Actor);const FString Kind=String(Pick,TEXT("kind"));
        if(Kind==TEXT("fleet")||Kind==TEXT("convoy"))Known.Add(Id(Pick,TEXT("forceId")));
    }
    Runtime->SelectedForceIds.Reset();TArray<TSharedPtr<FJsonValue>> Selected;
    for(const auto& Value:Array(Packet,TEXT("selectedForceIds")))
    {
        FString ForceId;if(!Value->TryGetString(ForceId)||!Known.Contains(ForceId)||Runtime->SelectedForceIds.Contains(ForceId))continue;
        Runtime->SelectedForceIds.Add(ForceId);Selected.Add(MakeShared<FJsonValueString>(ForceId));
    }
    // Mutate only presentation selection in the retained full packet. Fleet
    // navigation, ReceivedAt, Duration and interpolation fraction stay intact.
    Runtime->Packet->SetArrayField(TEXT("selectedForceIds"),Selected);
    const auto Route=Object(Packet,TEXT("route"));
    if(Route.IsValid()&&Runtime->SelectedForceIds.Contains(Id(Route,TEXT("forceId"))))Runtime->Packet->SetObjectField(TEXT("route"),Route);
    else Runtime->Packet->RemoveField(TEXT("route"));
    for(const auto& Pair:Runtime->Markers)if(auto* Actor=Pair.Value.Get())
    {
        const auto Pick=Runtime->Selections.FindRef(Actor);const FString Kind=String(Pick,TEXT("kind"));
        if(Kind==TEXT("fleet")||Kind==TEXT("convoy"))Pick->SetBoolField(TEXT("selected"),Runtime->SelectedForceIds.Contains(Id(Pick,TEXT("forceId"))));
    }
    auto Rank=[&](const FString& Key)
    {
        const auto Pick=Runtime->Selections.FindRef(Runtime->Markers.FindRef(Key));const FString Kind=String(Pick,TEXT("kind"));
        return Boolean(Pick,TEXT("selected"))?8:Kind==TEXT("battle")?7:Kind==TEXT("fleet")?6:
            Kind==TEXT("contact")?5:Kind==TEXT("port")?4:Kind==TEXT("country")?3:Kind==TEXT("front")?2:1;
    };
    Runtime->MarkerDrawOrder.Sort([&](const FString& A,const FString& B)
    {const int32 AR=Rank(A),BR=Rank(B);return AR==BR?A<B:AR<BR;});
    RebuildRoute(Runtime->RouteWidth);UpdateChartMarkers();
}

void AWNTWorldActor::UpdateWorld(double Fraction)
{
    Runtime->LastWorldFraction = Fraction;
    Runtime->LastMarkerCamera=FVector(TNumericLimits<double>::Max());
    if (!Runtime->Packet.IsValid()) return;
    for (const auto& Value : Array(Runtime->Packet, TEXT("forces")))
    {
        const auto Force = Value->AsObject(); const auto Current = Sample(Force, Fraction); if (!Current.bValid) continue;
        const FString ForceId = Id(Force, TEXT("id"));
        for(int32 Copy=-1;Copy<=1;++Copy)if(auto* Marker=Runtime->Markers.FindRef(MarkerKey(TEXT("force:")+ForceId,Copy)).Get())
            Marker->SetActorLocation(ChartPosition(Current.Position,CentralMeridian,Copy));
        const double Sin = FMath::Sin(Current.Heading * Radians), Cos = FMath::Cos(Current.Heading * Radians);
        for (const auto& HullValue : Array(Force, TEXT("hulls")))
        {
            const auto Hull = HullValue->AsObject(); auto* Ship = Runtime->Ships.FindRef(String(Hull, TEXT("key"))).Get(); if (!Ship) continue;
            FVector2D Station; if (!Point(Hull, TEXT("stationMeters"), Station)) continue;
            const FVector2D Geo = Offset(Current.Position, Station.X * Cos + Station.Y * Sin, Station.Y * Cos - Station.X * Sin);
            Ship->SetShipTransform(WNTProjection::Forward(Geo, CentralMeridian), ProjectedYaw(Geo, Current.Heading, CentralMeridian));
        }
    }
}

void AWNTWorldActor::RepositionPorts()
{
    Runtime->PortReliefScale=Terrain?Terrain->GetReliefScale():1.;
    for (const auto& Pair : Runtime->PortPositions)
    {
        const double Height=GroundHeight(Pair.Value);
        for(int32 Copy=-1;Copy<=1;++Copy)if(auto* Marker=Runtime->Markers.FindRef(MarkerKey(TEXT("port:")+Pair.Key,Copy)).Get())
            Marker->SetActorLocation(ChartPosition(Pair.Value,CentralMeridian,Copy,Height));
    }
    for (const auto& Value : Array(Runtime->Packet, TEXT("contacts")))
    {
        const auto Contact = Value->AsObject(); FVector2D Geo;
        if(Point(Contact,TEXT("position"),Geo))for(int32 Copy=-1;Copy<=1;++Copy)
            if(auto* Actor=Runtime->Markers.FindRef(MarkerKey(TEXT("contact:")+Id(Contact,TEXT("id")),Copy)).Get())Actor->SetActorLocation(ChartPosition(Geo,CentralMeridian,Copy));
    }
    for(const auto& Pair:Runtime->PublicPositions)
    {
        const double Height=GroundHeight(Pair.Value);
        for(int32 Copy=-1;Copy<=1;++Copy)if(auto* Actor=Runtime->Markers.FindRef(MarkerKey(Pair.Key,Copy)).Get())
            Actor->SetActorLocation(ChartPosition(Pair.Value,CentralMeridian,Copy,Height));
    }
}

void AWNTWorldActor::RebuildRoute(double WidthCentimetres)
{
    Runtime->RouteWidth = WidthCentimetres;
    const auto Route = Object(Runtime->Packet, TEXT("route")); const auto& Points = Array(Route, TEXT("points"));
    auto Clear=[&](){for(const auto& Tile:RouteTiles)if(Tile)Tile->ClearAllMeshSections();};
    if (Points.Num() < 2) { Clear(); return; }
    TArray<FVector2D> Geos;
    for (const auto& Value : Points)
    {
        const auto& Pair = Value->AsArray(); double X, Y;
        if (Pair.Num() != 2 || !Pair[0]->TryGetNumber(X) || !Pair[1]->TryGetNumber(Y) || !FMath::IsFinite(X) || !FMath::IsFinite(Y)) {Clear();return;}
        Geos.Add(FVector2D(X, Y));
    }
    // Route strips keep their original buffers; per-vertex projection metadata
    // moves them by the same Equal Earth longitude shear as land and markers.
    constexpr int32 Columns=24;constexpr double DegreesPerTile=15.0;
    struct FRouteStrip
    {
        FVector Origin;
        TArray<FVector> Vertices,Normals;
        TArray<int32> Indices;
        TArray<FVector2D> UVs,ProjectionUVs,ProjectionFineUVs;
        TArray<FLinearColor> Colors;
        TArray<FProcMeshTangent> Tangents;
        FVector HalfExtent=FVector::ZeroVector;
        double ShearExtent=0;
    };
    TArray<FRouteStrip> Strips;Strips.SetNum(Columns);
    for(int32 Column=0;Column<Columns;++Column)
        Strips[Column].Origin=WNTProjection::ForwardUnwrapped(FVector2D(-172.5+Column*DegreesPerTile,0));
    auto AddPiece = [&](FVector2D A, FVector2D B)
    {
        const int32 Steps = FMath::Max(1, FMath::CeilToInt(FMath::Max(FMath::Abs(B.X - A.X), FMath::Abs(B.Y - A.Y)) / 1.0));
        for (int32 Step = 0; Step < Steps; ++Step)
        {
            const FVector2D G0 = FMath::Lerp(A, B, static_cast<double>(Step) / Steps), G1 = FMath::Lerp(A, B, static_cast<double>(Step + 1) / Steps);
            const int32 Column=FMath::Clamp(FMath::FloorToInt(((G0.X+G1.X)*.5+180.0)/DegreesPerTile),0,Columns-1);
            FRouteStrip& Strip=Strips[Column];
            FVector P0 = WNTProjection::ForwardUnwrapped(G0, GroundHeight(G0) + 10.0);
            FVector P1 = WNTProjection::ForwardUnwrapped(G1, GroundHeight(G1) + 10.0);
            const FVector Direction = (P1 - P0).GetSafeNormal(), Side = FVector::CrossProduct(Direction, FVector::UpVector).GetSafeNormal() * WidthCentimetres * .5;
            const int32 Base=Strip.Vertices.Num();Strip.Vertices.Append({P0-Side-Strip.Origin,P0+Side-Strip.Origin,P1+Side-Strip.Origin,P1-Side-Strip.Origin});
            Strip.Indices.Append({Base,Base+2,Base+1,Base,Base+3,Base+2});
            for(int32 Corner=0;Corner<4;++Corner)
            {
                const FVector Vertex=Strip.Vertices[Base+Corner];
                const auto Geo=WNTProjection::Inverse(Vertex+Strip.Origin);
                const double Shear=WNTProjection::EastUnitsPerDegree(Geo.IsSet()?Geo->Y:(Corner<2?G0.Y:G1.Y))-WNTProjection::EastUnitsPerDegree(0);
                const auto Packed=WNTProjection::PackChartShear(Shear);Strip.ProjectionUVs.Add(Packed.UV1);Strip.ProjectionFineUVs.Add(Packed.UV2);
                Strip.HalfExtent=Strip.HalfExtent.ComponentMax(Vertex.GetAbs());Strip.ShearExtent=FMath::Max(Strip.ShearExtent,FMath::Abs(Shear));
                Strip.Normals.Add(FVector::UpVector);Strip.UVs.Add(FVector2D::ZeroVector);Strip.Colors.Add(FLinearColor(.9f,.7f,.32f));Strip.Tangents.Add(FProcMeshTangent(Direction,false));
            }
        }
    };
    for (int32 Index = 1; Index < Geos.Num(); ++Index)
    {
        FVector2D A(WNTProjection::WrapLongitude(Geos[Index - 1].X), Geos[Index - 1].Y);
        FVector2D B(A.X + WNTProjection::WrapLongitude(Geos[Index].X - Geos[Index - 1].X), Geos[Index].Y);
        if (B.X > 180.0 || B.X < -180.0)
        {
            const double Edge = B.X > 180.0 ? 180.0 : -180.0;
            const double Latitude = FMath::Lerp(A.Y, B.Y, (Edge - A.X) / (B.X - A.X));
            AddPiece(A, FVector2D(Edge, Latitude)); AddPiece(FVector2D(-Edge, Latitude), FVector2D(B.X - Edge * 2, B.Y));
        }
        else AddPiece(A, B);
    }
    RouteTiles.SetNum(Columns*3);RouteTileOrigins.SetNum(Columns*3);RouteTileHalfExtents.SetNum(Columns*3);RouteTileShearExtents.SetNum(Columns*3);
    for(int32 Copy=-1;Copy<=1;++Copy)for(int32 Column=0;Column<Columns;++Column)
    {
        const int32 Index=(Copy+1)*Columns+Column;FRouteStrip& Strip=Strips[Column];
        RouteTileOrigins[Index]=Strip.Origin;RouteTileHalfExtents[Index]=Strip.HalfExtent;RouteTileShearExtents[Index]=Strip.ShearExtent;auto* Tile=RouteTiles[Index].Get();
        if(!Tile&&!Strip.Vertices.IsEmpty())
        {
            Tile=NewObject<UWNTMapTileComponent>(this,*FString::Printf(TEXT("RouteTile_%d_%d"),Copy,Column));
            AddInstanceComponent(Tile);Tile->SetupAttachment(RouteMesh);Tile->SetMobility(EComponentMobility::Movable);
            Tile->SetCollisionEnabled(ECollisionEnabled::NoCollision);Tile->SetCastShadow(false);Tile->SetAffectDistanceFieldLighting(false);
            Tile->RegisterComponent();RouteTiles[Index]=Tile;
        }
        if(!Tile)continue;
        if(Strip.Vertices.IsEmpty()){Tile->ClearAllMeshSections();continue;}
        Tile->SetRelativeLocation(WNTTerrainGeometry::WrappedTileOrigin(Strip.Origin,CentralMeridian,Copy));
        const double Shift=WNTTerrainGeometry::TileLongitudeShift(Strip.Origin,CentralMeridian,Copy);
        Tile->SetCustomPrimitiveDataFloat(0,float(Shift));
        if(auto* MapTile=Cast<UWNTMapTileComponent>(Tile))MapTile->SetGeographicHalfExtent(Strip.HalfExtent+FVector(500,Strip.ShearExtent*FMath::Abs(Shift)+500,10000));
        Tile->CreateMeshSection_LinearColor(0,Strip.Vertices,Strip.Indices,Strip.Normals,Strip.UVs,Strip.ProjectionUVs,Strip.ProjectionFineUVs,{},Strip.Colors,Strip.Tangents,false,false);
        Tile->SetMaterial(0,RouteMesh->GetMaterial(0));Tile->SetVisibility(!bSceneHidden&&!bBattleMode);
    }
}

void AWNTWorldActor::RepositionWorldTiles()
{
    Ocean->SetRelativeLocation(FVector::ZeroVector);
    const int32 SeaCount=OceanTiles.Num()/3,RouteCount=RouteTiles.Num()/3;
    for(int32 I=0;I<OceanTiles.Num();++I)if(OceanTiles[I]&&OceanTileOrigins.IsValidIndex(I))
    {
        const double Shift=WNTTerrainGeometry::TileLongitudeShift(OceanTileOrigins[I],CentralMeridian,I/SeaCount-1);
        OceanTiles[I]->SetRelativeLocation(WNTTerrainGeometry::WrappedTileOrigin(OceanTileOrigins[I],CentralMeridian,I/SeaCount-1));
        OceanTiles[I]->SetCustomPrimitiveDataFloat(0,float(Shift));
        if(auto* Tile=Cast<UWNTMapTileComponent>(OceanTiles[I]))Tile->SetGeographicHalfExtent(OceanTileHalfExtents[I]+FVector(500,OceanTileShearExtents[I]*FMath::Abs(Shift)+500,10000));
    }
    for(int32 I=0;I<RouteTiles.Num();++I)if(RouteTiles[I]&&RouteTileOrigins.IsValidIndex(I))
    {
        const double Shift=WNTTerrainGeometry::TileLongitudeShift(RouteTileOrigins[I],CentralMeridian,I/RouteCount-1);
        RouteTiles[I]->SetRelativeLocation(WNTTerrainGeometry::WrappedTileOrigin(RouteTileOrigins[I],CentralMeridian,I/RouteCount-1));
        RouteTiles[I]->SetCustomPrimitiveDataFloat(0,float(Shift));
        if(auto* Tile=Cast<UWNTMapTileComponent>(RouteTiles[I]))Tile->SetGeographicHalfExtent(RouteTileHalfExtents[I]+FVector(500,RouteTileShearExtents[I]*FMath::Abs(Shift)+500,10000));
    }
}

void AWNTWorldActor::ApplyBattlePacket(const TSharedPtr<FJsonObject>& Packet)
{
    if (!Packet.IsValid()) return;
    const FString Report = Id(Packet, TEXT("id")); const bool SameBattle = Runtime->BattleId == Report;
    const double Now=FPlatformTime::Seconds(),At=Number(Packet,TEXT("at"));
    const bool NewFrame=Runtime->BattleEffects.SetPacket(Packet,Now);
    Runtime->BattleTimelineOriginSeconds=Number(Packet,TEXT("timelineOriginSeconds"));
    Runtime->BattleSecondsPerRealSecond=Number(Packet,TEXT("secondsPerRealSecond"));
    if(NewFrame)Runtime->BattleAircraft.SetPacket(Packet,DataDirectory);
    Runtime->bBattleMovie=Boolean(Packet,TEXT("movie"));
    const bool Forward=SameBattle&&At>Runtime->BattleAt;
    if(NewFrame)
    {
        Runtime->BattleReceivedAt=Now;
        Runtime->BattleDuration=(Runtime->bBattleMovie||Forward)&&Boolean(Packet,TEXT("animate"))?FMath::Clamp(Number(Packet,TEXT("durationSeconds"),15),.1,90.):0;
        Runtime->BattleAt=At;
    }
    Runtime->BattleId = Report;
    if(!Boolean(Packet,TEXT("animate"),true))Runtime->BattleDuration=0;
    TSet<FString> Keep;
    for (const auto& Value : Array(Packet, TEXT("units")))
    {
        const auto Unit = Value->AsObject();
        // Coastal defenses have their own chart representation. Never let a
        // logical installation request or inherit a ship mesh.
        if(!Unit||Boolean(Unit,TEXT("hiddenFromScene"))||String(Unit,TEXT("type"))==TEXT("FORT"))continue;
        const FString Key = String(Unit, TEXT("key"));if(Key.IsEmpty())continue;Keep.Add(Key);
        AWNTShipActor* Ship = Runtime->BattleShips.FindRef(Key).Get(); const bool Existing = Ship != nullptr;
        if (!Ship) { Ship = GetWorld()->SpawnActor<AWNTShipActor>(); if (!Ship) continue; Ship->SetOwner(this); Runtime->BattleShips.Add(Key, Ship); }
        // Custom engagements can deliberately mix catalog vintages. Preserve
        // each chosen class's explicit catalog identity; never search another
        // campaign for a conveniently available but different hull variant.
        const FString Path = ModelPath(String(Unit,TEXT("modelClassId"),String(Unit,TEXT("classId"))),String(Unit,TEXT("modelCampaign"),String(Unit,TEXT("campaign"),String(Packet,TEXT("campaign"),Campaign))),String(Unit,TEXT("type")));
        if (Path.IsEmpty()) { Ship->SetPendingModel(); Runtime->LoadedBattleModels.Remove(Key); }
        else
        {
            Runtime->LoadedBattleModels.Add(Key, Path);
            Ship->SetModelReference(Path);
        }
        Ship->SelectionKey = Key;
        const FVector Target = PositionMetres(Unit); const double Heading = Number(Unit, TEXT("headingDegrees"));
        if(NewFrame||!Runtime->BattlePoses.Contains(Key))
        {
            FWNTWorldRuntime::FBattlePose Pose{ Forward && Existing ? Ship->GetActorLocation() : Target, Target,
                Forward && Existing ? Ship->GetActorRotation().Yaw : Heading, Heading, Boolean(Unit, TEXT("sunk")) };
            if(Runtime->bBattleMovie)Pose.Track.Read(Unit,Number(Packet,TEXT("durationSeconds"),15));
            Runtime->BattlePoses.Add(Key,MoveTemp(Pose));
        }
        auto Pick = Selection(TEXT("battle-ship"), Id(Unit, TEXT("id")), String(Unit, TEXT("label")));
        Pick->SetStringField(TEXT("key"), Key); Pick->SetStringField(TEXT("side"), String(Unit, TEXT("side"))); Pick->SetStringField(TEXT("classId"), String(Unit, TEXT("classId")));
        Pick->SetBoolField(TEXT("representativeDesign"), !Path.IsEmpty() && String(Unit, TEXT("classId")).StartsWith(TEXT("draft-")));
        Pick->SetBoolField(TEXT("representativeModel"),Boolean(Unit,TEXT("representativeModel")));
        Pick->SetStringField(TEXT("modelClassId"),String(Unit,TEXT("modelClassId"),String(Unit,TEXT("classId"))));
        Pick->SetStringField(TEXT("modelCampaign"),String(Unit,TEXT("modelCampaign"),String(Unit,TEXT("campaign"),Campaign)));
        Pick->SetBoolField(TEXT("selected"),Boolean(Unit,TEXT("selected")));
        Pick->SetNumberField(TEXT("hullIndex"), Number(Unit, TEXT("hullIndex"))); Runtime->Selections.Add(Ship, Pick);
        if (Packet->HasField(TEXT("instanceId"))) Pick->SetField(TEXT("instanceId"), Packet->TryGetField(TEXT("instanceId")));
    }
    for (auto It = Runtime->BattleShips.CreateIterator(); It; ++It) if (!Keep.Contains(It.Key()))
    { if (auto* Actor = It.Value().Get()) { Runtime->Selections.Remove(Actor); Actor->Destroy(); } Runtime->BattlePoses.Remove(It.Key()); Runtime->LoadedBattleModels.Remove(It.Key()); It.RemoveCurrent(); }
    Runtime->BattleAirWings.Reset();
    for(const auto& Value:Array(Packet,TEXT("airstrikes")))
    {
        if(Runtime->BattleAirWings.Num()>=256)break;
        const auto Wing=Value->AsObject();if(!Wing)continue;
        FWNTWorldRuntime::FAirWing Entry;Entry.Key=String(Wing,TEXT("key"));Entry.Side=String(Wing,TEXT("side"));Entry.Phase=String(Wing,TEXT("phase"));
        Entry.Planes=int32(FMath::Clamp(Number(Wing,TEXT("planes")),0.,10000.));Entry.Fighters=int32(FMath::Clamp(Number(Wing,TEXT("fighters")),0.,10000.));
        if(Entry.Key.IsEmpty())continue;
        Entry.Position=PositionMetres(Wing);Entry.Yaw=Number(Wing,TEXT("headingDegrees"));Entry.Track.Read(Wing,Number(Packet,TEXT("durationSeconds"),15));
        for(const auto& CountValue:Array(Wing,TEXT("trajectory")))
        {
            if(Entry.Counts.Num()>=128)break;const auto Count=CountValue->AsObject();if(!Count||!Count->HasField(TEXT("planes")))continue;
            const double Time=Number(Count,TEXT("time"),-1);if(Time<0||(!Entry.Counts.IsEmpty()&&Time<=Entry.Counts.Last().At))continue;
            Entry.Counts.Add({Time,int32(FMath::Clamp(Number(Count,TEXT("planes")),0.,10000.)),int32(FMath::Clamp(Number(Count,TEXT("fighters")),0.,10000.))});
        }
        Runtime->BattleAirWings.Add(MoveTemp(Entry));
    }
    Runtime->ShoreBatteries.Reset();
    for(const auto& Value:Array(Packet,TEXT("shoreBatteries")))
    {
        if(Runtime->ShoreBatteries.Num()>=128)break;const auto Battery=Value->AsObject();if(!Battery)continue;
        FWNTWorldRuntime::FShoreBattery Entry;Entry.Key=String(Battery,TEXT("key"));if(Entry.Key.IsEmpty())continue;
        Entry.Side=String(Battery,TEXT("side"));Entry.Label=String(Battery,TEXT("label"));Entry.Position=PositionMetres(Battery);Entry.Health=FMath::Clamp(Number(Battery,TEXT("health"),1),0.,1.);
        Entry.Track.Read(Battery,Number(Packet,TEXT("durationSeconds"),15));
        for(const auto& HealthValue:Array(Battery,TEXT("trajectory")))
        {
            if(Entry.Conditions.Num()>=128)break;const auto Point=HealthValue->AsObject();if(!Point||!Point->HasField(TEXT("health")))continue;
            const double ConditionTime=Number(Point,TEXT("time"),-1);if(ConditionTime<0||(!Entry.Conditions.IsEmpty()&&ConditionTime<=Entry.Conditions.Last().At))continue;
            Entry.Conditions.Add({ConditionTime,FMath::Clamp(Number(Point,TEXT("health"),1),0.,1.)});
        }
        Runtime->ShoreBatteries.Add(MoveTemp(Entry));
    }
    // Viewport messages own scene activation. A delayed demo packet must not
    // reactivate a hidden/title scene after the user has entered the campaign.
    const double Fraction=Runtime->BattleDuration>0?FMath::Clamp(Runtime->BattleEffects.Elapsed(Now)/Runtime->BattleDuration,0.,1.):1.;
    // All campaign actors/terrain are already hidden by SetSceneMode. A live
    // ten-second slice must not sweep hundreds of unrelated world actors.
    UpdateBattle(Fraction);
    Runtime->BattlePacketApplyMilliseconds=(FPlatformTime::Seconds()-Now)*1000.;
    Runtime->BattlePacketApplyPeakMilliseconds=FMath::Max(Runtime->BattlePacketApplyPeakMilliseconds,Runtime->BattlePacketApplyMilliseconds);
}

void AWNTWorldActor::UpdateBattle(double Fraction)
{
    Runtime->LastBattleFraction = Fraction;
    const double Now=FPlatformTime::Seconds();
    Runtime->BattleSurfaceTransforms.Reset();
    for (const auto& Pair : Runtime->BattlePoses) if (auto* Ship = Runtime->BattleShips.FindRef(Pair.Key).Get())
    {
        const auto& Pose = Pair.Value;
        const FVector Position = FMath::Lerp(Pose.From, Pose.To, Fraction);
        const double Heading=Pose.FromYaw + FMath::FindDeltaAngleDegrees(Pose.FromYaw, Pose.ToYaw) * Fraction;
        const double Elapsed=Runtime->BattleEffects.Elapsed(Now);
        const bool Tracked=!Pose.Track.Points.IsEmpty();
        const FTransform Surface=Tracked?Pose.Track.Sample(Elapsed):FTransform(FRotator(0,Heading,0),Position);
        Runtime->BattleSurfaceTransforms.Add(Pair.Key,Surface);
        const bool Lost=Tracked?Pose.Track.IsLost(Elapsed):Pose.bSunk;
        const double Sinking=Lost?Runtime->BattleEffects.SinkProgress(Pair.Key,Now):0.;
        Ship->SetActorTransform(Lost?FWNTBattleEffects::SinkingTransform(Surface,Sinking):Surface);
        // Only recorded new losses get a transition. Historical wrecks and
        // reduced-motion losses are hidden immediately, without combat rolls.
        const bool Visible=!bSceneHidden&&bBattleMode&&(!Tracked||Pose.Track.HasAppeared(Elapsed))&&!Pose.Track.HasDeparted(Elapsed)&&(!Lost||Sinking<1.);
        Ship->SetActorHiddenInGame(!Visible);Ship->SetActorEnableCollision(Visible);
        if(((Lost&&Sinking>=1.)||Pose.Track.HasDeparted(Elapsed))&&Ship->HasRenderableModel())Ship->ReleaseResidentModel();
    }
    for(const auto& Battery:Runtime->ShoreBatteries)
    {
        const double Elapsed=Runtime->BattleEffects.Elapsed(Now);
        Runtime->BattleSurfaceTransforms.Add(Battery.Key,Battery.Track.Points.IsEmpty()?FTransform(Battery.Position):Battery.Track.Sample(Elapsed));
    }
}

void AWNTWorldActor::UpdateVisibility()
{
    const bool WorldVisible = !bSceneHidden && !bBattleMode;
    Ocean->SetVisibility(!bSceneHidden,true);
    SkyBackground->SetVisibility(!bSceneHidden);
    if(OceanDetail)OceanDetail->SetSceneVisible(!bSceneHidden);
    // Far-ocean WPO is visual only; the controller uses analytic water/land picking.
    for(UProceduralMeshComponent* Tile:OceanTiles)Tile->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    RouteMesh->SetVisibility(WorldVisible,true);
    if (Terrain) { Terrain->SetActorHiddenInGame(!WorldVisible); Terrain->SetActorEnableCollision(WorldVisible); }
    for (const auto& Pair : Runtime->Ships) if (auto* Actor = Pair.Value.Get()) { Actor->SetActorHiddenInGame(!WorldVisible); Actor->SetActorEnableCollision(WorldVisible); }
    const auto* Player = GetWorld()->GetFirstPlayerController();
    const APlayerCameraManager* Camera = Player ? Player->PlayerCameraManager.Get() : nullptr;
    if(Camera)
    {
        for(const auto& Pair:Runtime->Ships)if(auto* Ship=Pair.Value.Get())Ship->UpdateSymbolForCamera(Camera->GetCameraLocation(),Camera->GetCameraRotation());
        for(const auto& Pair:Runtime->BattleShips)if(auto* Ship=Pair.Value.Get())Ship->UpdateSymbolForCamera(Camera->GetCameraLocation(),Camera->GetCameraRotation());
    }
    UpdateChartMarkers();
    for (const auto& Pair : Runtime->BattleShips) if (auto* Actor = Pair.Value.Get())
    {
        const auto& Pose=Runtime->BattlePoses.FindChecked(Pair.Key);
        const double Now=FPlatformTime::Seconds(),Elapsed=Runtime->BattleEffects.Elapsed(Now);
        const bool Tracked=!Pose.Track.Points.IsEmpty(),Lost=Tracked?Pose.Track.IsLost(Elapsed):Pose.bSunk;
        const bool Visible = !bSceneHidden && bBattleMode && (!Tracked||Pose.Track.HasAppeared(Elapsed))&&!Pose.Track.HasDeparted(Elapsed)
            &&(!Lost||Runtime->BattleEffects.SinkProgress(Pair.Key,Now)<1.);
        Actor->SetActorHiddenInGame(!Visible); Actor->SetActorEnableCollision(Visible);
    }
    Runtime->BattleEffects.SetVisible(!bSceneHidden&&bBattleMode);
    Runtime->BattleAircraft.SetVisible(!bSceneHidden&&bBattleMode);
}

void AWNTWorldActor::UpdateChartMarkers()
{
    const bool WorldVisible=!bSceneHidden&&!bBattleMode;
    const auto* Player=GetWorld()->GetFirstPlayerController();
    const APlayerCameraManager* Camera=Player?Player->PlayerCameraManager.Get():nullptr;
    int32 PixelWidth=1800,PixelHeight=1000;if(Player)Player->GetViewportSize(PixelWidth,PixelHeight);
    for(const auto& Pair:Runtime->Markers)if(auto* Actor=Pair.Value.Get())
    {
        const auto Pick=Runtime->Selections.FindRef(Actor);const FString Kind=String(Pick,TEXT("kind"));
        const bool Selected=Boolean(Pick,TEXT("selected"));
        const FVector Ground=Actor->GetActorLocation();
        const double Distance=Camera?FVector::Distance(Camera->GetCameraLocation(),Ground):0;
        const bool Ahead=!Camera||FVector::DotProduct(Ground-Camera->GetCameraLocation(),Camera->GetCameraRotation().Vector())>1;
        const double MapZoom=Camera?WNTCameraMath::WorldViewDistance()/FMath::Max(1.,FMath::Abs(Camera->GetCameraLocation().Z)):1.;
        const bool PortVisible=Kind!=TEXT("port")||Boolean(Pick,TEXT("major"),true)
            ||MapZoom>=(String(Pick,TEXT("tier"))==TEXT("base")?4.:16.);
        const bool Glyph=WorldVisible&&Ahead&&PortVisible&&!Boolean(Pick,TEXT("docked"))&&(Kind==TEXT("port")||Kind==TEXT("battle")
            ||Distance>2000000.);
        const bool Highlight=WorldVisible&&Ahead&&Selected;
        Actor->SetActorHiddenInGame(!Glyph&&!Highlight);
        // At hull range only the non-intercepting selection brackets remain.
        Actor->SetActorEnableCollision(Glyph);
        if(auto* Mesh=Actor->FindComponentByClass<UProceduralMeshComponent>())
        {
            auto Show=[&](int32 Section,bool Visible)
            {if(Mesh->GetProcMeshSection(Section)&&Mesh->IsMeshSectionVisible(Section)!=Visible)Mesh->SetMeshSectionVisible(Section,Visible);};
            Show(0,Glyph);
            if(Kind==TEXT("battle")){Show(1,Glyph);Show(2,Glyph);}
            Show(3,Highlight);
        }
        if(Camera)PositionPortSymbol(Actor,Ground,Camera->GetCameraLocation(),Camera->GetCameraRotation(),
            Number(Object(Object(Runtime->ChartSymbols,TEXT("symbols")),*Kind),TEXT("pixels"),32)*FMath::Clamp(PixelHeight/1000.,1.,2.),PixelWidth,Camera->GetFOVAngle());
    }
}

void AWNTWorldActor::DrawChart(UCanvas* Canvas)
{
    const int32 PreviousVertices=Runtime->ChartVertices;
    Runtime->DrawnChartMarkers=Runtime->ChartVertices=Runtime->ChartTriangles=Runtime->DrawnPortLabels=0;
    Runtime->ChartDrawMilliseconds=Runtime->ChartProjectionMilliseconds=Runtime->ChartBatchMilliseconds=Runtime->ChartPortLabelsMilliseconds=0;
    Runtime->VisibleAirWings=Runtime->VisibleShoreBatteries=Runtime->VisibleBattleShipMarkers=0;
    if(!Canvas||!Canvas->Canvas||bSceneHidden)return;
    const double Started=FPlatformTime::Seconds();
    auto* Player=GetWorld()->GetFirstPlayerController();if(!Player)return;
    const FChartScreenProjection Projection(Player);
    Runtime->ChartProjectionMilliseconds=(FPlatformTime::Seconds()-Started)*1000.;
    const double UIScale=FMath::Clamp(Canvas->SizeY/1000.,1.,2.);
    if(bBattleMode)
    {
        // A real 200m hull becomes subpixel in a 220km carrier engagement.
        // Keep the exact models/positions and add crisp navigation ink only
        // while the hull itself is too small to recognize or select.
        TArray<FBox2D> Labels;
        for(const auto& Pair:Runtime->BattleShips)
        {
            auto* Ship=Pair.Value.Get();const double Pixels=GetChartPixelSize(Ship,Canvas->SizeY);
            if(Pixels<=0)continue;
            FVector2D At,Ahead;if(!Projection.Project(Ship->GetActorLocation(),At)||At.X< -Pixels||At.Y< -Pixels||At.X>Canvas->SizeX+Pixels||At.Y>Canvas->SizeY+Pixels)continue;
            const auto Pick=Runtime->Selections.FindRef(Ship);const bool Selected=Boolean(Pick,TEXT("selected"));
            const FString Side=String(Pick,TEXT("side"));
            const FLinearColor Colour=Side==TEXT("B")?FLinearColor(.98f,.55f,.36f):FLinearColor(.46f,.86f,1.f);
            const bool HasHeading=Projection.Project(Ship->GetActorLocation()+Ship->GetActorForwardVector()*10000.,Ahead);
            const double Angle=HasHeading?FMath::Atan2(Ahead.Y-At.Y,Ahead.X-At.X)+UE_DOUBLE_PI*.5:0.;
            At=FVector2D(FMath::RoundToDouble(At.X),FMath::RoundToDouble(At.Y));
            static const FVector2D Hull[]={{0,-.5},{.25,-.15},{.25,.4},{-.25,.4},{-.25,-.15}};
            auto DrawHull=[&](FCanvas* InCanvas)
            {
                auto* Batch=InCanvas->GetBatchedElements(FCanvas::ET_Triangle,nullptr,GWhiteTexture,SE_BLEND_Translucent);
                const auto Proxy=InCanvas->GetHitProxyId();
                for(int32 Layer=0;Layer<2;++Layer)
                {
                    const FLinearColor Ink=Layer==1?Colour:Selected?FLinearColor(1.f,.9f,.35f):FLinearColor(.01f,.025f,.04f);
                    const double Size=Pixels*(Layer==0?1.2:1.);
                    const int32 Centre=Batch->AddVertexf(FVector4f(float(At.X),float(At.Y),0,1),FVector2f::ZeroVector,Ink,Proxy);
                    for(const auto& Point:Hull)
                    {
                        const FVector2D P=At+FVector2D(Point.X*FMath::Cos(Angle)-Point.Y*FMath::Sin(Angle),Point.X*FMath::Sin(Angle)+Point.Y*FMath::Cos(Angle))*Size;
                        Batch->AddVertexf(FVector4f(float(P.X),float(P.Y),0,1),FVector2f::ZeroVector,Ink,Proxy);
                    }
                    for(int32 I=0;I<UE_ARRAY_COUNT(Hull);++I)Batch->AddTriangle(Centre,Centre+1+I,Centre+1+(I+1)%UE_ARRAY_COUNT(Hull),GWhiteTexture,SE_BLEND_Translucent);
                }
            };
            FChartCanvasItem HullInk(DrawHull);Canvas->DrawItem(HullInk);
            const FVector2D LabelAt=At+FVector2D(Pixels*.65,-7*UIScale);
            const FString Label=Side+TEXT(" ")+String(Pick,TEXT("label")).Left(24);
            const FBox2D LabelBounds(LabelAt,LabelAt+FVector2D(FMath::Max(40,Label.Len()*8),16)*UIScale);
            bool Overlap=false;for(const auto& Bounds:Labels)if(Bounds.Intersect(LabelBounds)){Overlap=true;break;}
            if((Selected||!Overlap)&&GEngine&&GEngine->GetSmallFont())
            {
                FCanvasTextItem Text(LabelAt,FText::FromString(Label),GEngine->GetSmallFont(),Colour);
                Text.Scale=FVector2D(UIScale,UIScale);Text.bOutlined=true;Text.OutlineColor=FLinearColor(.01f,.025f,.04f);Canvas->DrawItem(Text);Labels.Add(LabelBounds);
            }
            ++Runtime->VisibleBattleShipMarkers;Runtime->ChartVertices+=12;Runtime->ChartTriangles+=10;
        }
        // One clearly labelled aggregate wing per real air operation. These
        // are crisp chart symbols in the tactical view, not substitute 3D
        // aircraft models or one actor per aircraft.
        const double Elapsed=Runtime->BattleEffects.Elapsed(FPlatformTime::Seconds());
        static const FVector2D Outline[]={{0,-13},{2,-4},{13,2},{13,5},{2,2},{2,8},{6,10},{6,12},{0,10},{-6,12},{-6,10},{-2,8},{-2,2},{-13,5},{-13,2},{-2,-4}};
        for(const auto& Wing:Runtime->BattleAirWings)
        {
            if(!Wing.Track.HasAppeared(Elapsed)||Wing.Track.HasDeparted(Elapsed))continue;
            const FIntPoint Count=Wing.CountAt(Elapsed);if(Count.X+Count.Y<=0)continue;
            const FTransform Pose=Wing.Track.Points.IsEmpty()?FTransform(FRotator(0,Wing.Yaw,0),Wing.Position):Wing.Track.Sample(Elapsed);
            FVector2D At,Ahead;if(!Projection.Project(Pose.GetLocation(),At)||At.X< -32||At.Y< -32||At.X>Canvas->SizeX+32||At.Y>Canvas->SizeY+32)continue;
            const bool HasHeading=Projection.Project(Pose.TransformPosition(FVector(10000,0,0)),Ahead);
            const double Angle=HasHeading?FMath::Atan2(Ahead.Y-At.Y,Ahead.X-At.X)+UE_DOUBLE_PI*.5:0.;
            At=FVector2D(FMath::RoundToDouble(At.X),FMath::RoundToDouble(At.Y));
            const FLinearColor Colour=Wing.Side==TEXT("B")?FLinearColor(.98f,.55f,.36f):FLinearColor(.46f,.86f,1.f);
            TArray<FVector2D> Points;Points.Reserve(UE_ARRAY_COUNT(Outline));
            for(const auto& Point:Outline)Points.Add(At+FVector2D(Point.X*FMath::Cos(Angle)-Point.Y*FMath::Sin(Angle),Point.X*FMath::Sin(Angle)+Point.Y*FMath::Cos(Angle))*UIScale);
            auto DrawWing=[&](FCanvas* InCanvas)
            {
                auto* Batch=InCanvas->GetBatchedElements(FCanvas::ET_Triangle,nullptr,GWhiteTexture,SE_BLEND_Translucent);
                const auto Proxy=InCanvas->GetHitProxyId();const int32 Centre=Batch->AddVertexf(FVector4f(float(At.X),float(At.Y),0,1),FVector2f::ZeroVector,Colour,Proxy);
                const int32 Base=Centre+1;
                for(const auto& Point:Points)Batch->AddVertexf(FVector4f(float(Point.X),float(Point.Y),0,1),FVector2f::ZeroVector,Colour,Proxy);
                for(int32 I=0;I<Points.Num();++I)Batch->AddTriangle(Centre,Base+I,Base+(I+1)%Points.Num(),GWhiteTexture,SE_BLEND_Translucent);
            };
            FChartCanvasItem WingInk(DrawWing);Canvas->DrawItem(WingInk);
            for(int32 I=0;I<Points.Num();++I)
            {
                FCanvasLineItem Line(Points[I],Points[(I+1)%Points.Num()]);Line.SetColor(FLinearColor(.02f,.04f,.06f));Line.LineThickness=1.5f*UIScale;Canvas->DrawItem(Line);
            }
            if(GEngine&&GEngine->GetSmallFont())
            {
                const FString Label=Wing.Side+TEXT(" ")+FString::FromInt(Count.X+Count.Y);
                FCanvasTextItem Text(At+FVector2D(17,-7)*UIScale,FText::FromString(Label),GEngine->GetSmallFont(),Colour);
                Text.Scale=FVector2D(UIScale,UIScale);Text.bOutlined=true;Text.OutlineColor=FLinearColor(.015f,.025f,.04f,1);Canvas->DrawItem(Text);
            }
            ++Runtime->VisibleAirWings;Runtime->ChartVertices+=Points.Num()+1;Runtime->ChartTriangles+=Points.Num();
        }
        for(const auto& Battery:Runtime->ShoreBatteries)
        {
            if(!Battery.Track.HasAppeared(Elapsed)||Battery.Track.HasDeparted(Elapsed))continue;
            const FVector Position=Battery.Track.Points.IsEmpty()?Battery.Position:Battery.Track.Sample(Elapsed).GetLocation();
            FVector2D At;if(!Projection.Project(Position,At)||At.X< -32||At.Y< -32||At.X>Canvas->SizeX+32||At.Y>Canvas->SizeY+32)continue;
            At=FVector2D(FMath::RoundToDouble(At.X),FMath::RoundToDouble(At.Y));
            const double Health=Battery.HealthAt(Elapsed);
            const FLinearColor Colour=Health<=0?FLinearColor(.46f,.48f,.49f):Battery.Side==TEXT("B")?FLinearColor(.98f,.55f,.36f):FLinearColor(.46f,.86f,1.f);
            auto Box=[&](double X,double Y,double W,double H,const FLinearColor& Tint)
            {FCanvasTileItem Tile(At+FVector2D(X,Y)*UIScale,FVector2D(W,H)*UIScale,Tint);Tile.BlendMode=SE_BLEND_Translucent;Canvas->DrawItem(Tile);};
            Box(-15,-6,30,19,FLinearColor(.015f,.025f,.04f));Box(-13,-4,26,15,Colour);
            Box(-11,-10,7,7,Colour);Box(4,-10,7,7,Colour);
            for(double Side:{-1.,1.})
            {
                FCanvasLineItem Barrel(At+FVector2D(Side*7,-6)*UIScale,At+FVector2D(Side*12,-17)*UIScale);
                Barrel.LineThickness=3*UIScale;Barrel.SetColor(Colour);Canvas->DrawItem(Barrel);
            }
            if(GEngine&&GEngine->GetSmallFont())
            {
                const FString Label=Battery.Side+FString::Printf(TEXT(" BAT %d%%"),FMath::RoundToInt(Health*100));
                FCanvasTextItem Text(At+FVector2D(18,-7)*UIScale,FText::FromString(Label),GEngine->GetSmallFont(),Colour);
                Text.Scale=FVector2D(UIScale,UIScale);Text.bOutlined=true;Text.OutlineColor=FLinearColor(.015f,.025f,.04f);Canvas->DrawItem(Text);
            }
            ++Runtime->VisibleShoreBatteries;
        }
        Runtime->ChartDrawMilliseconds=(FPlatformTime::Seconds()-Started)*1000.;return;
    }
    // One stable, ordered Canvas batch. No depth fighting, distance sorting,
    // temporal history, material bloom or frame-dependent icon rotation.
    auto DrawIndexed=[&](FCanvas* InCanvas)
    {
        const double BatchStarted=FPlatformTime::Seconds();
        FBatchedElements* Batch=nullptr;
        const FHitProxyId HitProxy=InCanvas->GetHitProxyId();
        for(const auto& Key:Runtime->MarkerDrawOrder)
        {
            auto* Actor=Runtime->Markers.FindRef(Key).Get();if(!Actor||Actor->IsHidden())continue;
            FVector2D At;if(!Projection.Project(Actor->GetActorLocation(),At))continue;
            const auto Pick=Runtime->Selections.FindRef(Actor);const FString Kind=String(Pick,TEXT("kind"));
            const double Pixels=Number(Object(Object(Runtime->ChartSymbols,TEXT("symbols")),*Kind),TEXT("pixels"),32)*UIScale;
            if(At.X < -Pixels||At.X>Canvas->SizeX+Pixels||At.Y < -Pixels||At.Y>Canvas->SizeY+Pixels)continue;
            At.X=FMath::RoundToDouble(At.X);At.Y=FMath::RoundToDouble(At.Y);
            auto* Mesh=Actor->FindComponentByClass<UProceduralMeshComponent>();if(!Mesh)continue;
            ++Runtime->DrawnChartMarkers;
            for(int32 Index=0;Index<Mesh->GetNumSections();++Index)
            {
                const auto* Section=Mesh->GetProcMeshSection(Index);
                if(!Section||!Section->bSectionVisible||Section->ProcIndexBuffer.IsEmpty())continue;
                FLinearColor Tint=FLinearColor::White;
                if(Kind==TEXT("battle")&&(Index==1||Index==2))
                {
                    const double Stage=Number(Pick,TEXT("stage"));
                    Tint=BattleSymbolTint(Runtime->BattleSymbolTime,Index-1,Stage>=2&&Stage<=3);
                }
                if(!Batch)
                {
                    Batch=InCanvas->GetBatchedElements(FCanvas::ET_Triangle,nullptr,GWhiteTexture,SE_BLEND_Translucent);
                    Batch->AddReserveVertices(FMath::Max(PreviousVertices,Section->ProcVertexBuffer.Num()));
                }
                int32 Base=INDEX_NONE;
                for(const auto& Vertex:Section->ProcVertexBuffer)
                {
                    const FVector2D Pixel=At+FVector2D(-Vertex.Position.Y,-Vertex.Position.Z)*(Pixels/100000.);
                    const int32 Added=Batch->AddVertexf(FVector4f(float(Pixel.X),float(Pixel.Y),0,1),FVector2f::ZeroVector,
                        FLinearColor(Vertex.Color)*Tint,HitProxy);
                    if(Base==INDEX_NONE)Base=Added;
                }
                for(int32 I=0;I+2<Section->ProcIndexBuffer.Num();I+=3)
                    Batch->AddTriangle(Base+Section->ProcIndexBuffer[I],Base+Section->ProcIndexBuffer[I+1],
                        Base+Section->ProcIndexBuffer[I+2],GWhiteTexture,SE_BLEND_Translucent);
                Runtime->ChartVertices+=Section->ProcVertexBuffer.Num();Runtime->ChartTriangles+=Section->ProcIndexBuffer.Num()/3;
            }
        }
        Runtime->ChartBatchMilliseconds=(FPlatformTime::Seconds()-BatchStarted)*1000.;
    };
    FChartCanvasItem Ink(DrawIndexed);Canvas->DrawItem(Ink);
    Runtime->DrawnPortLabels=0;
    // Names are chart ink at the same exact anchor as the recognizable port
    // glyph. Major docks get first choice of label space, then regional bases.
    const double LabelsStarted=FPlatformTime::Seconds();
    TArray<FBox2D> LabelBounds;
    if(GEngine&&GEngine->GetSmallFont())for(const auto& Port:Runtime->PortLabels)
    {
        auto* Actor=Port.Actor.Get();if(!Actor||Actor->IsHidden())continue;
        FVector2D At;if(!Projection.Project(Actor->GetActorLocation(),At)||At.X<0||At.Y<0||At.X>Canvas->SizeX||At.Y>Canvas->SizeY)continue;
        const FString& Label=Port.Label;
        const double Pixels=GetChartPixelSize(Actor,Canvas->SizeY);
        At=FVector2D(FMath::RoundToDouble(At.X+Pixels*.65),FMath::RoundToDouble(At.Y-7.*UIScale));
        float TextWidth=0,TextHeight=0;Canvas->StrLen(GEngine->GetSmallFont(),Label,TextWidth,TextHeight);
        const FBox2D Bounds(At-FVector2D(2,2)*UIScale,At+FVector2D(TextWidth+3,TextHeight+2)*UIScale);
        bool Overlap=false;for(const auto& Other:LabelBounds)if(Other.Intersect(Bounds)){Overlap=true;break;}
        if(Overlap||Bounds.Max.X>Canvas->SizeX)continue;
        FCanvasTextItem Text(At,FText::FromString(Label),GEngine->GetSmallFont(),FLinearColor(.86f,.89f,.79f));
        Text.Scale=FVector2D(UIScale,UIScale);Text.bOutlined=true;Text.OutlineColor=FLinearColor(.015f,.025f,.035f);
        Canvas->DrawItem(Text);LabelBounds.Add(Bounds);++Runtime->DrawnPortLabels;
    }
    Runtime->ChartPortLabelsMilliseconds=(FPlatformTime::Seconds()-LabelsStarted)*1000.;
    Runtime->ChartDrawMilliseconds=(FPlatformTime::Seconds()-Started)*1000.;
}

double AWNTWorldActor::GetChartPixelSize(const AActor* Actor,double ViewportHeight) const
{
    if(!Actor||Actor->IsHidden())return 0;
    if(const auto* Ship=Cast<AWNTShipActor>(Actor))
    {
        if(!bBattleMode||!Runtime->Selections.Contains(const_cast<AActor*>(Actor)))return 0;
        const auto* Player=GetWorld()->GetFirstPlayerController();const auto* Camera=Player?Player->PlayerCameraManager.Get():nullptr;
        if(!Camera)return 0;
        int32 Width=0,Height=0;Player->GetViewportSize(Width,Height);
        const double Length=Ship->HasRenderableModel()?Ship->DetailedMesh->Bounds.BoxExtent.GetMax()*2:20000.;
        const double Depth=FVector::DotProduct(Actor->GetActorLocation()-Camera->GetCameraLocation(),Camera->GetCameraRotation().Vector());
        return WNTCameraMath::BattleMarkerPixels(Length,Depth,Camera->GetFOVAngle(),FIntPoint(Width,int32(ViewportHeight)));
    }
    const auto Pick=Runtime->Selections.FindRef(const_cast<AActor*>(Actor));
    const auto Symbol=Object(Object(Runtime->ChartSymbols,TEXT("symbols")),*String(Pick,TEXT("kind")));
    return Symbol.IsValid()?Number(Symbol,TEXT("pixels"),32)*FMath::Clamp(ViewportHeight/1000.,1.,2.):0;
}

AActor* AWNTWorldActor::HitChart(const FVector2D& NormalizedPointer,const FVector2D& NormalizedPadding) const
{
    if(bSceneHidden)return nullptr;
    auto* Player=GetWorld()->GetFirstPlayerController();if(!Player)return nullptr;
    int32 Width=0,Height=0;Player->GetViewportSize(Width,Height);if(Width<=0||Height<=0)return nullptr;
    const FChartScreenProjection Projection(Player);
    const FVector2D Pointer(NormalizedPointer.X*Width,NormalizedPointer.Y*Height);
    const FVector2D Padding(FMath::Clamp(NormalizedPadding.X*Width,0.,24.),FMath::Clamp(NormalizedPadding.Y*Height,0.,24.));
    if(bBattleMode)
    {
        AActor* Closest=nullptr;double Best=TNumericLimits<double>::Max();
        for(const auto& Pair:Runtime->BattleShips)
        {
            auto* Actor=Pair.Value.Get();const double Pixels=GetChartPixelSize(Actor,Height);
            if(Pixels<=0||!Actor->GetActorEnableCollision())continue;
            FVector2D At;if(!Projection.Project(Actor->GetActorLocation(),At))continue;
            const FVector2D Delta=Pointer-At;const double Half=Pixels*.6;
            if(FMath::Abs(Delta.X)<=Half+Padding.X&&FMath::Abs(Delta.Y)<=Half+Padding.Y&&Delta.SizeSquared()<Best)
            {Closest=Actor;Best=Delta.SizeSquared();}
        }
        return Closest;
    }
    for(int32 I=Runtime->MarkerDrawOrder.Num()-1;I>=0;--I)
    {
        auto* Actor=Runtime->Markers.FindRef(Runtime->MarkerDrawOrder[I]).Get();
        if(!Actor||Actor->IsHidden()||!Actor->GetActorEnableCollision())continue;
        auto* Mesh=Actor->FindComponentByClass<UProceduralMeshComponent>();
        if(!Mesh||!Mesh->IsMeshSectionVisible(0))continue;
        FVector2D At;if(!Projection.Project(Actor->GetActorLocation(),At))continue;
        const double Half=GetChartPixelSize(Actor,Height)*.55;
        if(FMath::Abs(Pointer.X-FMath::RoundToDouble(At.X))<=Half+Padding.X
            &&FMath::Abs(Pointer.Y-FMath::RoundToDouble(At.Y))<=Half+Padding.Y)return Actor;
    }
    return nullptr;
}

TSharedPtr<FJsonObject> AWNTWorldActor::GetChartDiagnostics() const
{
    auto Result=MakeShared<FJsonObject>();TArray<TSharedPtr<FJsonValue>> Ids,Markers,Styles;int32 VisibleSelected=0;
    for(const auto& ForceId:Runtime->SelectedForceIds)Ids.Add(MakeShared<FJsonValueString>(ForceId));
    for(const auto& Pair:Runtime->Markers)if(auto* Actor=Pair.Value.Get())
    {
        const auto Pick=Runtime->Selections.FindRef(Actor);
        if(Number(Pick,TEXT("worldCopy"))==0)
        {
            auto Style=MakeShared<FJsonObject>();
            for(const TCHAR* Field:{TEXT("kind"),TEXT("id"),TEXT("nation"),TEXT("color"),TEXT("symbolVariant")})Style->SetStringField(Field,String(Pick,Field));
            Styles.Add(MakeShared<FJsonValueObject>(Style));
        }
        if(!Boolean(Pick,TEXT("selected")))continue;
        auto Row=MakeShared<FJsonObject>();auto* Mesh=Actor->FindComponentByClass<UProceduralMeshComponent>();
        const bool Highlight=Mesh&&Mesh->IsMeshSectionVisible(3)&&!Actor->IsHidden();
        Row->SetStringField(TEXT("forceId"),Id(Pick,TEXT("forceId")));Row->SetNumberField(TEXT("worldCopy"),Number(Pick,TEXT("worldCopy")));
        Row->SetBoolField(TEXT("visible"),!Actor->IsHidden());Row->SetBoolField(TEXT("highlightVisible"),Highlight);
        Row->SetBoolField(TEXT("glyphVisible"),Mesh&&Mesh->IsMeshSectionVisible(0)&&!Actor->IsHidden());
        Row->SetBoolField(TEXT("collisionEnabled"),Actor->GetActorEnableCollision());
        Row->SetStringField(TEXT("material"),Mesh&&Mesh->GetMaterial(3)?Mesh->GetMaterial(3)->GetPathName():TEXT(""));
        Row->SetStringField(TEXT("color"),String(Object(Runtime->ChartSymbols,TEXT("selection")),TEXT("color")));
        const FVector P=Actor->GetActorLocation();Row->SetArrayField(TEXT("position"),{MakeShared<FJsonValueNumber>(P.X),MakeShared<FJsonValueNumber>(P.Y),MakeShared<FJsonValueNumber>(P.Z)});
        Row->SetNumberField(TEXT("pixels"),Number(Object(Object(Runtime->ChartSymbols,TEXT("symbols")),*String(Pick,TEXT("kind"))),TEXT("pixels"),32));
        Markers.Add(MakeShared<FJsonValueObject>(Row));if(Highlight)++VisibleSelected;
    }
    Result->SetArrayField(TEXT("selectedForceIds"),Ids);Result->SetArrayField(TEXT("selectedMarkers"),Markers);
    Result->SetArrayField(TEXT("markerStyles"),Styles);
    Result->SetNumberField(TEXT("visibleSelectedMarkerCount"),VisibleSelected);Result->SetNumberField(TEXT("markerCount"),Runtime->Markers.Num());
    Result->SetNumberField(TEXT("drawnPortLabels"),Runtime->DrawnPortLabels);
    Result->SetStringField(TEXT("renderer"),TEXT("screen-vector"));Result->SetNumberField(TEXT("drawnMarkers"),Runtime->DrawnChartMarkers);
    Result->SetNumberField(TEXT("drawMilliseconds"),Runtime->ChartDrawMilliseconds);
    Result->SetNumberField(TEXT("projectionSetupMilliseconds"),Runtime->ChartProjectionMilliseconds);
    Result->SetNumberField(TEXT("indexedBatchMilliseconds"),Runtime->ChartBatchMilliseconds);
    Result->SetNumberField(TEXT("portLabelsMilliseconds"),Runtime->ChartPortLabelsMilliseconds);
    Result->SetNumberField(TEXT("submittedVertices"),Runtime->ChartVertices);
    Result->SetNumberField(TEXT("submittedTriangles"),Runtime->ChartTriangles);
    Result->SetNumberField(TEXT("mapRepositionMilliseconds"),Runtime->MapRepositionMilliseconds);
    Result->SetNumberField(TEXT("mapShipUpdateMilliseconds"),Runtime->MapShipUpdateMilliseconds);
    Result->SetNumberField(TEXT("tacticalAirWingCount"),Runtime->BattleAirWings.Num());Result->SetNumberField(TEXT("visibleAirWingCount"),Runtime->VisibleAirWings);
    Result->SetNumberField(TEXT("visibleAircraftModelCount"),Runtime->BattleAircraft.VisibleCount());
    Result->SetNumberField(TEXT("aircraftModelPoolCount"),Runtime->BattleAircraft.LoadedPoolCount());
    Result->SetNumberField(TEXT("recordedAircraftAttackRuns"),Runtime->BattleAircraft.AttackRunCount());
    Result->SetNumberField(TEXT("battlePacketApplyMilliseconds"),Runtime->BattlePacketApplyMilliseconds);
    Result->SetNumberField(TEXT("battlePacketApplyPeakMilliseconds"),Runtime->BattlePacketApplyPeakMilliseconds);
    Result->SetNumberField(TEXT("battlePresentationSeconds"),FMath::Min(Runtime->BattleAt,Runtime->BattleTimelineOriginSeconds+Runtime->BattleEffects.Elapsed(FPlatformTime::Seconds())*Runtime->BattleSecondsPerRealSecond));
    TArray<TSharedPtr<FJsonValue>> Wings;const double AirElapsed=Runtime->BattleEffects.Elapsed(FPlatformTime::Seconds());
    for(const auto& Wing:Runtime->BattleAirWings)
    {
        auto Row=MakeShared<FJsonObject>();Row->SetStringField(TEXT("key"),Wing.Key);Row->SetStringField(TEXT("side"),Wing.Side);Row->SetStringField(TEXT("phase"),Wing.Phase);
        const FIntPoint Count=Wing.CountAt(AirElapsed);Row->SetNumberField(TEXT("planes"),Count.X);Row->SetNumberField(TEXT("fighters"),Count.Y);
        Row->SetBoolField(TEXT("present"),Wing.Track.HasAppeared(AirElapsed)&&!Wing.Track.HasDeparted(AirElapsed)&&Count.X+Count.Y>0);
        const FVector Position=Wing.Track.Points.IsEmpty()?Wing.Position:Wing.Track.Sample(AirElapsed).GetLocation();
        Row->SetArrayField(TEXT("position"),{MakeShared<FJsonValueNumber>(Position.X),MakeShared<FJsonValueNumber>(Position.Y),MakeShared<FJsonValueNumber>(Position.Z)});
        Wings.Add(MakeShared<FJsonValueObject>(Row));
    }
    Result->SetArrayField(TEXT("tacticalAirWings"),Wings);
    Result->SetNumberField(TEXT("shoreBatteryCount"),Runtime->ShoreBatteries.Num());Result->SetNumberField(TEXT("visibleShoreBatteryCount"),Runtime->VisibleShoreBatteries);
    Result->SetNumberField(TEXT("visibleBattleShipMarkers"),Runtime->VisibleBattleShipMarkers);
    if(Terrain)Result->SetObjectField(TEXT("mapStyle"),Terrain->GetMapStyleDiagnostics());return Result;
}

void AWNTWorldActor::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds); if (bSceneHidden) return; const double Now = FPlatformTime::Seconds();
    if(const auto* Player=GetWorld()->GetFirstPlayerController())if(const auto* Camera=Player->PlayerCameraManager.Get())
    {
        SkyBackground->SetWorldLocation(Camera->GetCameraLocation());
        if(OceanDetail)OceanDetail->UpdateView(Camera->GetCameraLocation(),Camera->GetCameraRotation().Vector(),DeltaSeconds,true);
    }
    const bool RefreshModels=Now>=Runtime->NextModelRefresh;
    if(RefreshModels)Runtime->NextModelRefresh=Now+2.0;
    if (bBattleMode)
    {
        const double Fraction = Runtime->BattleDuration > 0 ? FMath::Clamp(Runtime->BattleEffects.Elapsed(Now) / Runtime->BattleDuration, 0.0, 1.0) : 1.0;
        const bool Animating=Runtime->BattleEffects.IsAnimating(Now);
        if (Fraction != Runtime->LastBattleFraction||Animating||Runtime->bBattleEffectsWereAnimating) UpdateBattle(Fraction);
        Runtime->bBattleEffectsWereAnimating=Animating;
        Runtime->BattleEffects.Update(this,Runtime->BattleSurfaceTransforms,Now,true,&Runtime->BattleShips);
        Runtime->BattleAircraft.Update(this,Runtime->BattleEffects.Elapsed(Now),true);
        if(const auto* Player=GetWorld()->GetFirstPlayerController())if(const auto* Camera=Player->PlayerCameraManager.Get())
            for(const auto& Pair:Runtime->BattleShips)if(auto* Ship=Pair.Value.Get())
            {
                const auto& Pose=Runtime->BattlePoses.FindChecked(Pair.Key);const double Elapsed=Runtime->BattleEffects.Elapsed(Now);
                const bool Tracked=!Pose.Track.Points.IsEmpty(),Lost=Tracked?Pose.Track.IsLost(Elapsed):Pose.bSunk;
                if((Tracked&&!Pose.Track.HasAppeared(Elapsed))||Pose.Track.HasDeparted(Elapsed)||(Lost&&Runtime->BattleEffects.SinkProgress(Pair.Key,Now)>=1.))continue;
                // The watchable battle contains a bounded set of observed
                // combatants; keep them available throughout its fitted view.
                Ship->RefreshModelForCamera(Ship->GetActorLocation(),RefreshModels);
                Ship->UpdateSymbolForCamera(Camera->GetCameraLocation(),Camera->GetCameraRotation());
            }
    }
    else
    {
        const double Relief=Terrain?Terrain->GetReliefScale():1.;
        if(!FMath::IsNearlyEqual(Relief,Runtime->PortReliefScale,1e-9))
        {
            // The geographic surface samples are already known. Match shader
            // relief without repeating polygon/triangle queries during zoom.
            const double Ratio=Relief/Runtime->PortReliefScale;
            for(const auto& Pair:Runtime->Markers)if(auto* Actor=Pair.Value.Get())
            {
                const FString Kind=String(Runtime->Selections.FindRef(Actor),TEXT("kind"));
                if(Kind!=TEXT("port")&&Kind!=TEXT("country")&&Kind!=TEXT("front")&&Kind!=TEXT("battle"))continue;
                FVector Position=Actor->GetActorLocation();Position.Z*=Ratio;Actor->SetActorLocation(Position);
            }
            Runtime->PortReliefScale=Relief;Runtime->LastMarkerCamera=FVector(TNumericLimits<double>::Max());
        }
        if(!Boolean(Runtime->Packet,TEXT("paused"))&&Boolean(Runtime->Packet,TEXT("animate"),true))Runtime->BattleSymbolTime+=DeltaSeconds;
        const double Fraction = Runtime->Duration > 0 ? FMath::Clamp((Now - Runtime->ReceivedAt) / Runtime->Duration, 0.0, 1.0) : 1.0;
        if (Fraction != Runtime->LastWorldFraction) UpdateWorld(Fraction);
        // Fleet/contact symbols yield to individual ships on approach. Ports
        // remain explicit navigation symbols until real scenery exists.
        if (const auto* Player = GetWorld()->GetFirstPlayerController()) if (const APlayerCameraManager* Camera = Player->PlayerCameraManager)
        {
            int32 PixelWidth,PixelHeight;Player->GetViewportSize(PixelWidth,PixelHeight);
            const bool SameView=Camera->GetCameraLocation().Equals(Runtime->LastMarkerCamera, .01)
                && Camera->GetCameraRotation().Quaternion().Equals(Runtime->LastMarkerCameraRotation, .000001)
                &&Runtime->LastMarkerViewport==FIntPoint(PixelWidth,PixelHeight)
                &&FMath::IsNearlyEqual(Runtime->LastMarkerFOV,Camera->GetFOVAngle());
            // Every hull is outside the 60 km residency radius from this
            // altitude. Once a changed view has released them, a paused
            // strategic view has no streaming or symbol work to repeat.
            Runtime->MapShipUpdateMilliseconds=0;
            if(SameView&&FMath::Abs(Camera->GetCameraLocation().Z)>6000000.)return;
            const double ShipStarted=FPlatformTime::Seconds();
            for(const auto& Pair:Runtime->Ships)if(auto* Ship=Pair.Value.Get())
            {
                Ship->RefreshModelForCamera(Camera->GetCameraLocation(),RefreshModels);
                Ship->UpdateSymbolForCamera(Camera->GetCameraLocation(),Camera->GetCameraRotation());
            }
            Runtime->MapShipUpdateMilliseconds=(FPlatformTime::Seconds()-ShipStarted)*1000.;
            if(SameView)return;
            Runtime->LastMarkerCamera = Camera->GetCameraLocation();
            Runtime->LastMarkerCameraRotation = Camera->GetCameraRotation().Quaternion();
            Runtime->LastMarkerViewport=FIntPoint(PixelWidth,PixelHeight);
            Runtime->LastMarkerFOV=Camera->GetFOVAngle();
            const double DistanceToMap = FMath::Max(1.0, FMath::Abs(Camera->GetCameraLocation().Z));
            if(Terrain)
            {
                if(DistanceToMap<14000000.0)Runtime->bGridVisible=false;
                else if(DistanceToMap>16000000.0)Runtime->bGridVisible=true;
                const bool ShowGrid=Runtime->bGridVisible;
                Terrain->SetGraticuleVisible(ShowGrid);
                const double WorldUnitsPerPixel=2.0*DistanceToMap*FMath::Tan(FMath::DegreesToRadians(Camera->GetFOVAngle()*.5))/FMath::Max(1,PixelWidth);
                Terrain->SetGraticulePixelSize(WorldUnitsPerPixel);
            }
            const double RouteWidth = FMath::Clamp(DistanceToMap * .001, 200.0, 3000000.0);
            if (RouteWidth > Runtime->RouteWidth * 1.2 || RouteWidth < Runtime->RouteWidth * .8) RebuildRoute(RouteWidth);
            UpdateChartMarkers();
        }
    }
}

void AWNTWorldActor::SetCentralMeridian(double Degrees)
{
    const double Next=WNTProjection::WrapLongitude(Degrees);
    if(FMath::Abs(WNTProjection::WrapLongitude(Next-CentralMeridian))<1e-9)return;
    const double Started=FPlatformTime::Seconds();
    // Continuous Equal Earth longitude shear is normal camera motion. Cutting
    // temporal history on each pointer event makes stable chart lines shimmer.
    CentralMeridian=Next;if(Terrain)Terrain->SetCentralMeridian(CentralMeridian);
    RepositionWorldTiles();
    Runtime->LastMarkerCamera = FVector(TNumericLimits<double>::Max());
    RepositionPorts(); UpdateWorld(Runtime->Duration > 0 ? FMath::Clamp((FPlatformTime::Seconds() - Runtime->ReceivedAt) / Runtime->Duration, 0.0, 1.0) : 1.0);
    Runtime->MapRepositionMilliseconds=(FPlatformTime::Seconds()-Started)*1000.;
}
void AWNTWorldActor::SetSceneMode(const FString& Mode)
{
    if (Mode != TEXT("world") && Mode != TEXT("battle") && Mode != TEXT("hidden")) return;
    const bool NextHidden = Mode == TEXT("hidden");
    const bool NextBattle = NextHidden ? bBattleMode : Mode == TEXT("battle");
    if (NextHidden == bSceneHidden && NextBattle == bBattleMode) return;
    ResetTemporalHistory(GetWorld());
    bSceneHidden = NextHidden; bBattleMode = NextBattle;
    // Hidden collections do not run camera streaming in Tick. Release their
    // component references on transitions so the weak cache can be collected,
    // without destroying actors, selection records or their source paths.
    if (bSceneHidden || bBattleMode)
        for (const auto& Pair : Runtime->Ships) if (auto* Ship = Pair.Value.Get()) Ship->ReleaseResidentModel();
    if (bSceneHidden || !bBattleMode)
        for (const auto& Pair : Runtime->BattleShips) if (auto* Ship = Pair.Value.Get()) Ship->ReleaseResidentModel();
    Runtime->LastMarkerCamera = FVector(TNumericLimits<double>::Max()); UpdateVisibility();
}
double AWNTWorldActor::GroundHeight(const FVector2D& LongitudeLatitude) const { return Terrain ? Terrain->RenderHeightAt(LongitudeLatitude) : 0; }
FBox AWNTWorldActor::GetForceBounds(const FString& ForceId) const
{
    FBox Bounds(ForceInit);
    for(const auto& Pair:Runtime->Ships)if(auto* Ship=Pair.Value.Get())
    {
        const auto Pick=Runtime->Selections.FindRef(Ship);
        if(!Pick.IsValid()||String(Pick,TEXT("forceId"),String(Pick,TEXT("fleetId")))!=ForceId)continue;
        // Deferred models retain their observed formation positions. Include a
        // conservative hull envelope before the detailed GLBs stream in.
        const FVector Position=Ship->GetActorLocation();
        Bounds+=Position-FVector(18000,18000,0);Bounds+=Position+FVector(18000,18000,5000);
    }
    return Bounds;
}

FBox AWNTWorldActor::GetSceneBounds() const { return bBattleMode ? GetBattleBounds() : FBox(FVector(-850000000, -1750000000, 0), FVector(850000000, 1750000000, 1000000)); }
FBox AWNTWorldActor::GetBattleBounds() const
{
    FBox Bounds(ForceInit);const double Now=FPlatformTime::Seconds(),Elapsed=Runtime->BattleEffects.Elapsed(Now);
    // Current positions only: fitting retained future/history tracks can put
    // the camera many km away from every presently visible participant.
    for(const auto& Pair:Runtime->BattleShips)if(const auto* Ship=Pair.Value.Get())
    {
        const auto* Pose=Runtime->BattlePoses.Find(Pair.Key);if(!Pose)continue;
        const bool Tracked=Runtime->bBattleMovie&&!Pose->Track.Points.IsEmpty();
        if((Tracked&&!Pose->Track.HasAppeared(Elapsed))||Pose->Track.HasDeparted(Elapsed))continue;
        if((Tracked?Pose->Track.IsLost(Elapsed):Pose->bSunk)&&Runtime->BattleEffects.SinkProgress(Pair.Key,Now)>=1.)continue;
        const FVector Position=Tracked?Pose->Track.Sample(Elapsed).GetLocation():Ship->GetActorLocation();
        Bounds+=Position+FVector(40000);Bounds+=Position-FVector(40000);
    }
    for(const auto& Battery:Runtime->ShoreBatteries)
    {
        if(!Battery.Track.HasAppeared(Elapsed)||Battery.Track.HasDeparted(Elapsed))continue;
        const FVector Position=Battery.Track.Points.IsEmpty()?Battery.Position:Battery.Track.Sample(Elapsed).GetLocation();
        Bounds+=Position+FVector(40000);Bounds+=Position-FVector(40000);
    }
    return Bounds;
}

TSharedPtr<FJsonObject> AWNTWorldActor::GetSelection(AActor* Actor) const
{
    if (!IsValid(Actor)) return nullptr;
    const auto* Found = Runtime->Selections.Find(Actor);
    if(!Found)return nullptr;
    if(const auto* Ship=Cast<AWNTShipActor>(Actor))
    {
        // Read state now, so direct GLB reload success/failure is visible without
        // waiting for a new campaign tick or losing the original hull identity.
        (*Found)->SetStringField(TEXT("visualStatus"),Ship->GetVisualStatus());
        (*Found)->SetBoolField(TEXT("modelPending"),Ship->IsModelPending());
        (*Found)->SetBoolField(TEXT("modelLoadError"),Ship->HasModelLoadError());
        (*Found)->SetBoolField(TEXT("detailedModel"),Ship->HasRenderableModel());
        (*Found)->SetStringField(TEXT("modelId"),Ship->ModelId);
    }
    return *Found;
}
TSharedPtr<FJsonObject> AWNTWorldActor::GetSelection(const FHitResult& Hit) const
{
    if (auto Found = GetSelection(Hit.GetActor())) return Found;
    if ((Hit.GetActor() == Terrain || Hit.GetActor() == this) && Terrain && !bBattleMode)
    {
        FVector Surface = Hit.ImpactPoint;
        const FVector Direction = (Hit.TraceEnd - Hit.TraceStart).GetSafeNormal();
        // Terrain tiles omit cooked collision while the wrapped meridian moves.
        // Resolve their actual height field along this ray, instead of clicking
        // the sea-level point behind an elevated mountain at an oblique angle.
        if (Hit.GetActor() == this && Direction.Z < -1e-8)
        {
            const double End = FVector::DotProduct(Hit.ImpactPoint - Hit.TraceStart, Direction);
            const double MaxHeight = (Terrain->LandBaseMetres + 10000.0) * 100.0;
            const double Begin = FMath::Clamp((MaxHeight - Hit.TraceStart.Z) / Direction.Z, 0.0, End);
            auto AboveSurface = [&](double Distance)
            {
                const FVector PointOnRay = Hit.TraceStart + Direction * Distance;
                const auto GeoPoint = WNTProjection::Inverse(PointOnRay, CentralMeridian);
                return PointOnRay.Z - (GeoPoint.IsSet() ? GroundHeight(GeoPoint.GetValue()) * 100.0 : 0.0);
            };
            double Last = Begin;
            for (int32 Step = 1; Step <= 64; ++Step)
            {
                const double Next = FMath::Lerp(Begin, End, static_cast<double>(Step) / 64.0);
                if (AboveSurface(Next) <= 0)
                {
                    double Low = Last, High = Next;
                    for (int32 Iteration = 0; Iteration < 20; ++Iteration)
                    {
                        const double Middle = (Low + High) * .5;
                        if (AboveSurface(Middle) > 0) Low = Middle; else High = Middle;
                    }
                    Surface = Hit.TraceStart + Direction * ((Low + High) * .5); break;
                }
                Last = Next;
            }
        }
        const auto Geo = WNTProjection::Inverse(Surface, CentralMeridian);
        if (Geo.IsSet())
        {
            const FString Territory = Terrain->TerritoryAt(Geo.GetValue());
            if (!Territory.IsEmpty())
            {
                auto Pick = Selection(TEXT("territory"), Territory, Territory);
                if (Runtime->Packet.IsValid() && Runtime->Packet->HasField(TEXT("instanceId"))) Pick->SetField(TEXT("instanceId"), Runtime->Packet->TryGetField(TEXT("instanceId")));
                return Pick;
            }
        }
    }
    return nullptr;
}
TOptional<FVector> AWNTWorldActor::GetSelectedPosition(const FString& Kind, const FString& Identity, int32 HullIndex, const FString& Side) const
{
    for (const auto& Pair : Runtime->Selections)
    {
        if (!Pair.Key.IsValid() || String(Pair.Value, TEXT("kind")) != Kind || Id(Pair.Value, TEXT("id")) != Identity) continue;
        if(Number(Pair.Value,TEXT("worldCopy"))!=0)continue;
        if (HullIndex >= 0 && Number(Pair.Value, TEXT("hullIndex"), -1) != HullIndex) continue;
        if (!Side.IsEmpty() && String(Pair.Value, TEXT("side")) != Side) continue;
        return Pair.Key->GetActorLocation();
    }
    return {};
}
void AWNTWorldActor::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    auto Destroy = [](auto& Actors) { for (const auto& Pair : Actors) if (auto* Actor = Pair.Value.Get()) Actor->Destroy(); Actors.Reset(); };
    Destroy(Runtime->Ships); Destroy(Runtime->BattleShips); Destroy(Runtime->Markers);
    Runtime->Selections.Reset(); if (Terrain) Terrain->Destroy(); Terrain = nullptr;
    if(OceanDetail)OceanDetail->Destroy();OceanDetail=nullptr;
    Super::EndPlay(EndPlayReason);
}

#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "KismetProceduralMeshLibrary.h"
#include "EngineUtils.h"

namespace
{
    TSharedPtr<FJsonObject> ChartTestSpec()
    {
        FString Root;if(!FParse::Value(FCommandLine::Get(),TEXT("WNTDataRoot="),Root))Root=FPaths::Combine(FPaths::ProjectDir(),TEXT(".."));
        return ReadJson(FPaths::Combine(Root,TEXT("assets/ui/map-symbols.json")));
    }
    FVector RenderedTileVertex(const UProceduralMeshComponent* Tile,const FProcMeshVertex& Vertex)
    {
        FVector P=Tile->GetComponentTransform().TransformPosition(Vertex.Position);
        const auto& CPD=Tile->GetCustomPrimitiveData().Data;if(!CPD.IsEmpty())P.Y+=WNTProjection::DecodeChartShear(Vertex.UV1,Vertex.UV2)*CPD[0];return P;
    }
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWorldBootstrapTest, "WNT.World.CampaignAssetBootstrap",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FWNTWorldBootstrapTest::RunTest(const FString& Parameters)
{
    FString Root;
    if (!FParse::Value(FCommandLine::Get(), TEXT("WNTDataRoot="), Root))
        Root = FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(), TEXT("..")));
    const UWorld::InitializationValues Initialization = UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* TestWorld = UWorld::CreateWorld(EWorldType::Game, false, NAME_None, nullptr, true, ERHIFeatureLevel::Num, &Initialization);
    if (!TestNotNull(TEXT("Create native bootstrap world"), TestWorld)) return false;
    AWNTWorldActor* Scene = TestWorld->SpawnActor<AWNTWorldActor>();
    bool Loaded = TestNotNull(TEXT("Spawn native scene"), Scene);
    if (Loaded)
    {
        Loaded = Scene->Initialize(Root);
        TestTrue(FString::Printf(TEXT("Load real ship index, nation metadata, 1936 terrain and materials: %s"), *Scene->GetLoadError()), Loaded);
        if (Loaded)
        {
            TArray<UDirectionalLightComponent*> Lights; Scene->GetComponents(Lights);
            TestEqual(TEXT("Native map has one shadowed sun"), Lights.Num(), 1);
            for (const auto* Light : Lights)
            {
                TestTrue(TEXT("Directional lighting is registered, visible and dynamic"), Light->IsRegistered() && Light->IsVisible() && Light->Mobility == EComponentMobility::Movable && Light->bAffectsWorld);
                TestTrue(TEXT("Directional light shines down onto surfaces"), Light->GetForwardVector().Z < -.5 && Light->Intensity > 0);
            }
            TArray<USkyLightComponent*> SkyLights;Scene->GetComponents(SkyLights);
            TestEqual(TEXT("Native map has a photographic environment light"),SkyLights.Num(),1);
            for(const auto* Light:SkyLights)
                TestTrue(TEXT("HDR sky is loaded as a dynamic cubemap"),Light->IsRegistered()&&Light->Mobility==EComponentMobility::Movable&&Light->SourceType==SLS_SpecifiedCubemap&&Light->Cubemap&&Light->Cubemap->GetSizeX()>0);
            AWNTTerrainActor* Terrain = Scene->GetTerrain();
            TestNotNull(TEXT("Terrain uses the lit geometric palette material"),Terrain->TerrainMaterial.Get());
            TArray<FVector> ReferenceVertices,ReferenceNormals;TArray<int32> ReferenceIndices;TArray<FVector2D> ReferenceUVs;TArray<FProcMeshTangent> ReferenceTangents;
            UKismetProceduralMeshLibrary::GenerateBoxMesh(FVector(1),ReferenceVertices,ReferenceIndices,ReferenceNormals,ReferenceUVs,ReferenceTangents);
            const FVector ReferenceA=ReferenceVertices[ReferenceIndices[0]],ReferenceB=ReferenceVertices[ReferenceIndices[1]],ReferenceC=ReferenceVertices[ReferenceIndices[2]];
            const double ReferenceSign=FVector::DotProduct(FVector::CrossProduct(ReferenceB-ReferenceA,ReferenceC-ReferenceA),ReferenceNormals[ReferenceIndices[0]]);
            TestTrue(TEXT("Epic's generated outward faces use clockwise winding"),ReferenceSign<0);
            TArray<UProceduralMeshComponent*> SeaComponents;Scene->GetComponents(SeaComponents);
            int32 SeaTiles=0;bool SeaGeometryValid=true;
            for(auto* Tile:SeaComponents)if(Tile->GetName().StartsWith(TEXT("OceanTile_")))
            {
                ++SeaTiles;const auto* Section=Tile->GetProcMeshSection(0);
                if(!Section||Section->ProcIndexBuffer.IsEmpty()||!Tile->GetRelativeScale3D().Equals(FVector::OneVector)||!Tile->GetMaterial(0)){SeaGeometryValid=false;continue;}
                for(int32 I=0;I+2<Section->ProcIndexBuffer.Num();I+=3)
                {
                    const auto& A=Section->ProcVertexBuffer[Section->ProcIndexBuffer[I]];
                    const auto& B=Section->ProcVertexBuffer[Section->ProcIndexBuffer[I+1]];
                    const auto& C=Section->ProcVertexBuffer[Section->ProcIndexBuffer[I+2]];
                    if(FVector::CrossProduct(B.Position-A.Position,C.Position-A.Position).Z>=0||A.Normal.Z<.99||!FMath::IsNearlyZero(A.Position.Z))SeaGeometryValid=false;
                }
            }
            TestEqual(TEXT("Coalesced ocean covers the central world and both seamless copies"),SeaTiles,216);
            TestTrue(TEXT("Sea has unit-scale clockwise geometry, upward normals and a lit material"),SeaGeometryValid);
            bool TerrainFacesMatchEngine=true,ElevationMatchesMetres=true,PaletteValid=true;int64 CheckedFaces=0,CheckedHeights=0;
            TSet<uint32> LandColours;
            TArray<UProceduralMeshComponent*> Tiles;Terrain->GetComponents(Tiles);
            for(auto* Tile:Tiles)for(int32 SectionIndex=0;SectionIndex<Tile->GetNumSections();++SectionIndex)
            {
                const auto* Section=Tile->GetProcMeshSection(SectionIndex);if(!Section)continue;
                if(SectionIndex==0)for(int32 VertexIndex=0;VertexIndex<Section->ProcVertexBuffer.Num();VertexIndex+=97)
                {
                    const FVector P=RenderedTileVertex(Tile,Section->ProcVertexBuffer[VertexIndex]);
                    if(const auto Geo=WNTProjection::Inverse(P,Terrain->GetCentralMeridian()))
                    {
                        const double Expected=Terrain->LandBaseMetres+FMath::Max(0.,Terrain->HeightAt(Geo.GetValue()));
                        if(FMath::Abs(P.Z*.01-Expected)>.1)ElevationMatchesMetres=false;
                        const auto& Vertex=Section->ProcVertexBuffer[VertexIndex];
                        LandColours.Add(Vertex.Color.DWColor());
                        if(Vertex.Color.A!=255||Vertex.Color==FColor::Black||Vertex.Normal.ContainsNaN()||Vertex.Normal.IsNearlyZero())PaletteValid=false;
                        ++CheckedHeights;
                    }
                }
                for(int32 I=0;I+2<Section->ProcIndexBuffer.Num();I+=3)
                {
                    const auto& A=Section->ProcVertexBuffer[Section->ProcIndexBuffer[I]];
                    const auto& B=Section->ProcVertexBuffer[Section->ProcIndexBuffer[I+1]];
                    const auto& C=Section->ProcVertexBuffer[Section->ProcIndexBuffer[I+2]];
                    const double Facing=FVector::DotProduct(FVector::CrossProduct(B.Position-A.Position,C.Position-A.Position),A.Normal+B.Normal+C.Normal);
                    if(Facing>1e-6)TerrainFacesMatchEngine=false;
                    ++CheckedFaces;
                }
            }
            TestTrue(TEXT("Actual land, coast and grid faces follow Epic's clockwise convention"),CheckedFaces>0&&TerrainFacesMatchEngine);
            TestTrue(TEXT("Rendered terrain uses source metres without a raised plateau or height multiplier"),CheckedHeights>0&&ElevationMatchesMetres);
            TestTrue(TEXT("Real terrain carries varied opaque biome colors and valid relief normals"),CheckedHeights>0&&PaletteValid&&LandColours.Num()>8);
            UProceduralMeshComponent* GridSample=nullptr;
            for(auto* Tile:Tiles)if(const auto* Grid=Tile->GetProcMeshSection(2))if(Grid->ProcVertexBuffer.Num()>=6){GridSample=Tile;break;}
            if(TestNotNull(TEXT("A real geographic grid section exists"),GridSample))
            {
                const auto* Grid=GridSample->GetProcMeshSection(2);
                const auto* VertexAllocation=Grid->ProcVertexBuffer.GetData();
                const FVector BeforeP=(Grid->ProcVertexBuffer[0].Position+Grid->ProcVertexBuffer[1].Position)*.5;
                const FVector BeforeQ=(Grid->ProcVertexBuffer[2].Position+Grid->ProcVertexBuffer[5].Position)*.5;
                Terrain->SetGraticulePixelSize(3200000.0);
                Grid=GridSample->GetProcMeshSection(2);
                const FVector AfterP=(Grid->ProcVertexBuffer[0].Position+Grid->ProcVertexBuffer[1].Position)*.5;
                const FVector AfterQ=(Grid->ProcVertexBuffer[2].Position+Grid->ProcVertexBuffer[5].Position)*.5;
                TestTrue(TEXT("Grid width changes preserve geographic endpoints and vertex allocation"),
                    VertexAllocation==Grid->ProcVertexBuffer.GetData()&&BeforeP.Equals(AfterP,.001)&&BeforeQ.Equals(AfterQ,.001));
                const double CPUWidth=FVector::Distance(Grid->ProcVertexBuffer[0].Position,Grid->ProcVertexBuffer[1].Position);
                TestTrue(TEXT("CPU grid support remains immutable at100 metres"),FMath::Abs(CPUWidth-10000.)<.01);
                const auto& PrimitiveParameters=GridSample->GetCustomPrimitiveData().Data;
                const double RibbonWidth=PrimitiveParameters.IsValidIndex(1)?PrimitiveParameters[1]*FVector2D::Distance(Grid->ProcVertexBuffer[0].UV3,Grid->ProcVertexBuffer[1].UV3):0.;
                TestTrue(TEXT("Actual GPU extrusion spans four pixels for derivative antialiasing"),RibbonWidth>=3200000.0*4&&RibbonWidth<=3200000.0*4*FMath::Sqrt(2.0)+.01);
            }
            TArray<const FProcMeshSection*> Sections;
            TArray<FVector> BeforeLocations;
            for(auto* Tile:Tiles)
            {
                Sections.Add(Tile->GetProcMeshSection(0));BeforeLocations.Add(Tile->GetRelativeLocation());
                TestFalse(TEXT("Global terrain does not consume virtual-shadow marking jobs"),Tile->CastShadow!=0);
            }
            Terrain->SetCentralMeridian(147.0);
            TArray<UProceduralMeshComponent*> AfterTiles;Terrain->GetComponents(AfterTiles);
            TestEqual(TEXT("Scrolling does not create more terrain components"),AfterTiles.Num(),Tiles.Num());
            for(int32 I=0;I<Tiles.Num();++I)
            {
                TestTrue(TEXT("Scrolling retains the same mesh buffers"),Sections[I]==Tiles[I]->GetProcMeshSection(0));
                const FVector Delta=Tiles[I]->GetRelativeLocation()-BeforeLocations[I];
                const auto CentreGeo=WNTProjection::Inverse(BeforeLocations[I],0);
                TestTrue(TEXT("Each tile retains geography under its latitude-dependent longitude shear"),
                    CentreGeo.IsSet()&&FMath::Abs(Delta.X)<.001&&FMath::Abs(Delta.Z)<.001
                    &&FMath::Abs(WNTProjection::WrapLongitude(Delta.Y/WNTProjection::EastUnitsPerDegree(CentreGeo->Y)+147.0))<1e-5);
            }
            Terrain->SetCentralMeridian(0);
            TMap<UProceduralMeshComponent*,const FProcMeshVertex*> SeaBuffers;
            for(auto* Tile:SeaComponents)if(Tile->GetName().StartsWith(TEXT("OceanTile_")))
                if(const auto* Section=Tile->GetProcMeshSection(0))SeaBuffers.Add(Tile,Section->ProcVertexBuffer.GetData());
            for(double Meridian:{179.9,-179.9})
            {
                Scene->SetCentralMeridian(Meridian);
                double West=TNumericLimits<double>::Max(),East=-TNumericLimits<double>::Max();
                bool BuffersUnchanged=true;
                for(const auto& Pair:SeaBuffers)
                {
                    const auto* Section=Pair.Key->GetProcMeshSection(0);
                    BuffersUnchanged&=Section&&Section->ProcVertexBuffer.GetData()==Pair.Value;
                    if(Section)for(const auto& Vertex:Section->ProcVertexBuffer)
                    {
                        const FVector P=RenderedTileVertex(Pair.Key,Vertex);
                        if(FMath::Abs(P.X)<1.){West=FMath::Min(West,P.Y);East=FMath::Max(East,P.Y);}
                    }
                }
                TestTrue(TEXT("Ocean pan shears existing vertex buffers without reallocating"),BuffersUnchanged);
                TestTrue(TEXT("Ocean coverage stays centered on both sides of the dateline"),
                    West<=-WNTProjection::WorldWidth*1.47&&East>=WNTProjection::WorldWidth*1.47);
            }
            Scene->SetCentralMeridian(0);
            TestTrue(TEXT("1936 terrain identifies Paris as land"), Terrain->IsLandAt(FVector2D(2.35, 48.85)));
            TestFalse(TEXT("1936 terrain preserves Atlantic water"), Terrain->IsLandAt(FVector2D(-35, 25)));
            Terrain->CampaignId = TEXT("1922");
            Loaded = Terrain->Initialize(Root);
            TestTrue(FString::Printf(TEXT("Load real 1922 terrain: %s"), *Terrain->GetLoadError()), Loaded);
        }
        Scene->Destroy();
    }
    TestWorld->DestroyWorld(false);
    return Loaded;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTPortSymbolOrientationTest, "WNT.World.NavigationSymbolOrientation",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FWNTPortSymbolOrientationTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Port symbol orientation world"),World))return false;
    auto* Port=PlainActor(World,nullptr);
    if(TestNotNull(TEXT("Port symbol actor"),Port))
    {
        const FVector Camera(2000000,-5000000,7000000);
        // Match SceneComponent's near-pole quaternion-to-Euler conversion;
        // this tight angular cone still rejects the former radial anchor roll.
        const double AlignmentCosine=FMath::Cos(FMath::DegreesToRadians(.1));
        for(const FRotator View : {FRotator(-90,0,0),FRotator(-89.999,132,0),FRotator(-32,57,11)})
            for(const double Side : {-1.,1.})
            {
                const FVector Ground(Side*1000000,Side*2000000,0);
                PositionPortSymbol(Port,Ground,Camera,View);
                TestTrue(FString::Printf(TEXT("Port anchor stays screen-upright at %s, side %.0f"),*View.ToString(),Side),
                    FVector::DotProduct(Port->GetActorUpVector(),View.RotateVector(FVector::UpVector))>AlignmentCosine
                    &&FVector::DotProduct(Port->GetActorForwardVector(),-View.Vector())>AlignmentCosine);
                TestTrue(TEXT("Billboard rotation preserves the port's geographic station"),
                    FMath::IsNearlyEqual(Port->GetActorLocation().X,Ground.X,.001)
                    &&FMath::IsNearlyEqual(Port->GetActorLocation().Y,Ground.Y,.001));
            }
        Port->Destroy();
    }
    World->DestroyWorld(false);return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWrappedChartTest,"WNT.World.WraparoundChartCopies",
    EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWrappedChartTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Wrapped chart test world"),World))return false;
    AWNTWorldActor* Scene=World->SpawnActor<AWNTWorldActor>();
    if(!TestNotNull(TEXT("Wrapped chart test scene"),Scene)){World->DestroyWorld(false);return false;}
    TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"format":1,"campaign":"test","paused":true,"instanceId":"wrap-test","forces":[{"id":"fleet","name":"Test fleet","position":[179.8,25],"heading":90,"hulls":[]}],"contacts":[{"id":"report","position":[179.8,25],"nation":"USA","stage":"sighted"}],"ports":[{"id":"harbor","name":"Harbor","position":[179.8,25]}],"countries":[{"id":"country","name":"Country","position":[179.8,25]}],"fronts":[{"id":"front","name":"Front","position":[179.8,25]}],"route":{"points":[[178,25],[-178,25],[-160,26]]}})");
    const bool Parsed=FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet);
    TestTrue(TEXT("Wrapped chart fixture parses"),Parsed);
    if(!Parsed){World->DestroyWorld(false);return false;}
    Packet->SetObjectField(TEXT("chartSymbols"),ChartTestSpec());
    Scene->ApplyWorldPacket(Packet);
    TArray<UProceduralMeshComponent*> Components;Scene->GetComponents(Components);
    TMap<UProceduralMeshComponent*,const FProcMeshVertex*> RouteBuffers;
    for(auto* Mesh:Components)if(Mesh->GetName().StartsWith(TEXT("RouteTile_")))
        if(const auto* Section=Mesh->GetProcMeshSection(0))RouteBuffers.Add(Mesh,Section->ProcVertexBuffer.GetData());
    TestTrue(TEXT("Seam-crossing route has repeated geographic strips"),RouteBuffers.Num()>=6&&RouteBuffers.Num()%3==0);
    for(double Meridian:{0.,179.9,-179.9,147.,-147.})
    {
        Scene->SetCentralMeridian(Meridian);
        TMap<FString,int32> Counts;TSet<FString> Seen;
        for(TActorIterator<AActor> It(World);It;++It)if(const auto Pick=Scene->GetSelection(*It))
        {
            const FString Kind=String(Pick,TEXT("kind")),Identity=Id(Pick,TEXT("id"));
            const int32 Copy=static_cast<int32>(Number(Pick,TEXT("worldCopy")));
            ++Counts.FindOrAdd(Kind);Seen.Add(Kind+FString::FromInt(Copy));
            const FVector Expected=ChartPosition(FVector2D(179.8,25),Meridian,Copy);
            TestTrue(TEXT("Each selectable chart repeat uses the same geographic station"),It->GetActorLocation().Equals(Expected,.01));
            const auto Geo=WNTProjection::Inverse(It->GetActorLocation(),Meridian);
            TestTrue(TEXT("Picking each seam copy resolves identical geography"),Geo.IsSet()&&Geo->Equals(FVector2D(179.8,25),1e-7));
            TArray<UPrimitiveComponent*> Primitives;It->GetComponents(Primitives);
            if(!Primitives.IsEmpty())
            {
                const FHitResult Hit(*It,Primitives[0],It->GetActorLocation(),FVector::UpVector);
                const auto HitPick=Scene->GetSelection(Hit);
                TestTrue(TEXT("Hit selection from every repeat retains the original identity"),HitPick.IsValid()
                    &&Id(HitPick,TEXT("id"))==Identity&&String(HitPick,TEXT("instanceId"))==TEXT("wrap-test"));
            }
            if(Kind==TEXT("port"))TestTrue(TEXT("All repeated port hit targets remain enabled"),It->GetActorEnableCollision());
        }
        for(const TCHAR* Kind:{TEXT("fleet"),TEXT("contact"),TEXT("port"),TEXT("country"),TEXT("front")})
            TestEqual(FString::Printf(TEXT("Three independently selectable %s repeats"),Kind),Counts.FindRef(Kind),3);
        TestEqual(TEXT("Each category has distinct left, central and right copies"),Seen.Num(),15);
        const auto Focus=Scene->GetSelectedPosition(TEXT("port"),TEXT("harbor"));
        TestTrue(TEXT("Named focus chooses the nearest central copy deterministically"),Focus.IsSet()
            &&Focus->Equals(WNTProjection::Forward(FVector2D(179.8,25),Meridian),.01));
        for(const auto& Pair:RouteBuffers)
        {
            const auto* Section=Pair.Key->GetProcMeshSection(0);
            TestTrue(TEXT("Panning retains the exact route vertex allocation"),Section&&Section->ProcVertexBuffer.GetData()==Pair.Value);
            if(!Section)continue;
            for(const auto& Vertex:Section->ProcVertexBuffer)
            {
                const FVector P=RenderedTileVertex(Pair.Key,Vertex);
                const auto Geo=WNTProjection::Inverse(P,Meridian);
                TestTrue(TEXT("Repeated route stays on the short dateline-crossing corridor"),Geo.IsSet()&&FMath::Abs(Geo->X)>159&&Geo->Y>24.9&&Geo->Y<26.1);
            }
        }
    }
    World->DestroyWorld(false);return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTChartSelectionTest,"WNT.World.ChartSelectionAndPixelSizing",
    EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTChartSelectionTest::RunTest(const FString& Parameters)
{
    const auto Spec=ChartTestSpec();if(!TestNotNull(TEXT("Shared SVG/native chart specification"),Spec.Get()))return false;
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Chart selection test world"),World))return false;
    auto* Scene=World->SpawnActor<AWNTWorldActor>();TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"format":1,"campaign":"test","paused":true,"selectedForceIds":["fleet"],"forces":[{"id":"fleet","name":"Docked fleet","docked":true,"position":[1,50],"hulls":[]}]})");
    if(!TestNotNull(TEXT("Chart selection test scene"),Scene)||!FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet))
    {World->DestroyWorld(false);return false;}
    Packet->SetObjectField(TEXT("chartSymbols"),Spec);Scene->ApplyWorldPacket(Packet);
    auto Diagnostics=Scene->GetChartDiagnostics();
    TestEqual(TEXT("Single selection produces three geographic highlight copies"),Number(Diagnostics,TEXT("visibleSelectedMarkerCount")),3.);
    TestEqual(TEXT("Only one force is selected"),Array(Diagnostics,TEXT("selectedForceIds")).Num(),1);
    for(const auto& Row:Array(Diagnostics,TEXT("selectedMarkers")))
    {
        TestTrue(TEXT("Docked selected fleet has visible brackets"),Boolean(Row->AsObject(),TEXT("highlightVisible")));
        TestFalse(TEXT("Docked fleet does not obscure its port with a second filled badge"),Boolean(Row->AsObject(),TEXT("glyphVisible")));
        TestFalse(TEXT("Brackets cannot intercept clicks on actual hulls or ports"),Boolean(Row->AsObject(),TEXT("collisionEnabled")));
        TestTrue(TEXT("Selection uses the depth-safe chart material"),String(Row->AsObject(),TEXT("material")).Contains(TEXT("M_ChartSymbol")));
    }
    auto* Probe=PlainActor(World,nullptr);
    auto* Material=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_ChartSymbol.M_ChartSymbol"));
    for(const TCHAR* Kind:{TEXT("fleet"),TEXT("contact"),TEXT("convoy"),TEXT("port"),TEXT("country"),TEXT("front"),TEXT("battle")})
    {
        auto* Glyph=ChartSymbol(Probe,Spec,Kind,Material);
        if(TestNotNull(TEXT("Every role creates a procedural glyph"),Glyph))
        {
            const auto* Section=Glyph->GetProcMeshSection(0);
            TestTrue(TEXT("Glyph has real colored geometry"),Section&&Section->ProcIndexBuffer.Num()>0);
            TestFalse(TEXT("Chart glyph bypasses scene temporal AA and depth sorting"),Glyph->IsVisible());
            if(Section)for(const auto& Vertex:Section->ProcVertexBuffer)
                TestTrue(TEXT("Glyph stays within its stable physical-pixel bounds"),FMath::Abs(Vertex.Position.Y)<=60000&&FMath::Abs(Vertex.Position.Z)<=60000);
            for(int32 SectionIndex=0;SectionIndex<Glyph->GetNumSections();++SectionIndex)
                if(const auto* Indexed=Glyph->GetProcMeshSection(SectionIndex);Indexed&&!Indexed->ProcIndexBuffer.IsEmpty())
                {
                    TestTrue(TEXT("Indexed chart submission reuses shared vertices"),Indexed->ProcVertexBuffer.Num()<Indexed->ProcIndexBuffer.Num());
                    TestTrue(TEXT("A symbol section fits the Canvas 16-bit vertex span"),Indexed->ProcVertexBuffer.Num()<65535);
                    bool Valid=true,Ordered=true;uint32 PreviousMaximum=0;
                    for(int32 I=0;I+2<Indexed->ProcIndexBuffer.Num();I+=3)
                    {
                        const uint32 A=Indexed->ProcIndexBuffer[I],B=Indexed->ProcIndexBuffer[I+1],C=Indexed->ProcIndexBuffer[I+2];
                        const uint32 Maximum=FMath::Max3(A,B,C);
                        Valid&=Maximum<uint32(Indexed->ProcVertexBuffer.Num());
                        // Canvas scans existing 16-bit batches; monotonic maximum
                        // indices prevent a later face re-entering an older batch
                        // and changing translucent shape/casing draw order.
                        Ordered&=Maximum>=PreviousMaximum;PreviousMaximum=Maximum;
                    }
                    TestTrue(TEXT("Actual glyph indices are valid and preserve Canvas translucent batch order"),Valid&&Ordered);
                }
            Glyph->DestroyComponent();
        }
    }
    for(double Width:{1800.,2560.,3440.})for(double Depth:{200000.,20000000.,2000000000.})for(double FOV:{45.,70.,100.})
    {
        PositionPortSymbol(Probe,FVector::ZeroVector,FVector(0,0,Depth),FRotator(-90,0,0),32,Width,FOV);
        const double ScreenPixels=Probe->GetActorScale3D().Y*100000.*Width/(2.*Depth*FMath::Tan(FMath::DegreesToRadians(FOV*.5)));
        TestTrue(TEXT("Marker sizing stays 32 pixels across zoom, aspect ratio and FOV"),FMath::IsNearlyEqual(ScreenPixels,32.,1e-6));
        TestTrue(TEXT("Chart centre remains exactly at its geographic position"),Probe->GetActorLocation().IsNearlyZero());
    }
    const double MarkerCount=Number(Diagnostics,TEXT("markerCount"));
    Packet->SetArrayField(TEXT("selectedForceIds"),{});Scene->ApplyWorldPacket(Packet);Diagnostics=Scene->GetChartDiagnostics();
    TestEqual(TEXT("Deselect removes every selection highlight immediately"),Number(Diagnostics,TEXT("visibleSelectedMarkerCount")),0.);
    TestEqual(TEXT("Selection changes reuse the same marker actors"),Number(Diagnostics,TEXT("markerCount")),MarkerCount);
    World->DestroyWorld(false);return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTChartNationalStylesTest,"WNT.World.NationalInkAndFleetRoles",
    EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTChartNationalStylesTest::RunTest(const FString& Parameters)
{
    const auto Spec=ChartTestSpec();if(!TestNotNull(TEXT("Shared native/legend specification"),Spec.Get()))return false;
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("National chart test world"),World))return false;
    auto* Probe=PlainActor(World,nullptr);TSet<uint32> Shapes;
    const FString Ink=TEXT("#42a58d");const FColor Expected=FColor::FromHex(Ink),Backing=FColor::FromHex(String(Spec,TEXT("backingColor")));
    for(const TCHAR* Variant:{TEXT("carrier"),TEXT("capital"),TEXT("cruiser"),TEXT("escort"),TEXT("submarine"),TEXT("support")})
    {
        auto* Glyph=ChartSymbol(Probe,Spec,TEXT("fleet"),nullptr,Variant,Ink);
        const auto* Section=Glyph?Glyph->GetProcMeshSection(0):nullptr;
        if(!TestNotNull(TEXT("Every fleet role has actual geometry"),Section))continue;
        bool HasInk=false,HasBacking=false,OnlySpecifiedColors=true;
        for(const auto& Vertex:Section->ProcVertexBuffer)
        {
            HasInk|=Vertex.Color==Expected;HasBacking|=Vertex.Color==Backing;
            OnlySpecifiedColors&=Vertex.Color==Expected||Vertex.Color==Backing;
        }
        TestTrue(TEXT("Country ink matches exact SVG sRGB bytes without recoloring the silhouette/casing"),HasInk&&HasBacking&&OnlySpecifiedColors);
        TestEqual(TEXT("Canvas linear decoding round-trips to the original national palette"),FLinearColor(Expected).ToFColor(true),Expected);
        Shapes.Add(FCrc::MemCrc32(Section->ProcVertexBuffer.GetData(),Section->ProcVertexBuffer.Num()*sizeof(FProcMeshVertex)));
    }
    TestEqual(TEXT("Six fleet classes have distinct vertex geometry"),Shapes.Num(),6);
    auto* Scene=World->SpawnActor<AWNTWorldActor>();TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"format":1,"campaign":"test","player":"USA","paused":true,"forces":[{"id":"navy","symbolVariant":"carrier","nation":"USA","color":"#42a58d","position":[0,0],"hulls":[{"key":"war","groupId":"war","hullIndex":0,"stationMeters":[0,0]}]},{"id":"trade","merchant":true,"nation":"USA","color":"#42a58d","position":[20,10],"hulls":[{"key":"cargo0","hullIndex":0,"stationMeters":[-600,0]},{"key":"cargo1","hullIndex":1,"stationMeters":[600,0]}]}],"ports":[{"id":"harbor","name":"Harbor","position":[5,20],"owner":"USA","color":"#42a58d"}]})");
    if(Scene&&FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet))
    {
        Packet->SetObjectField(TEXT("chartSymbols"),Spec);Scene->ApplyWorldPacket(Packet);
        auto FindPort=[&]()->AActor*{for(TActorIterator<AActor> It(World);It;++It){const auto Pick=Scene->GetSelection(*It);
            if(String(Pick,TEXT("kind"))==TEXT("port")&&Number(Pick,TEXT("worldCopy"))==0)return *It;}return nullptr;};
        auto* Before=FindPort();Scene->ApplyWorldPacket(Packet);
        TestTrue(TEXT("Unchanged campaign packets retain existing icon geometry and actor"),Before&&FindPort()==Before);
        const FBox MerchantBounds=Scene->GetForceBounds(TEXT("trade")),WarshipBounds=Scene->GetForceBounds(TEXT("navy"));
        TestTrue(TEXT("Merchant formation fit includes both actual hull stations"),MerchantBounds.IsValid&&MerchantBounds.GetSize().GetMax()>100000);
        TestTrue(TEXT("Merchant fit never incorporates a distant navy"),WarshipBounds.IsValid&&FVector::Distance(MerchantBounds.GetCenter(),WarshipBounds.GetCenter())>10000000);
        FBox ExpectedMerchantBounds(ForceInit);
        for(int32 HullIndex=0;HullIndex<2;++HullIndex)
        {
            const auto Hull=Scene->GetSelectedPosition(TEXT("merchant"),TEXT("trade"),HullIndex);
            const FVector ExpectedPosition=WNTProjection::Forward(Offset(FVector2D(20,10),HullIndex?600.:-600.,0),0);
            TestTrue(TEXT("Each merchant occupies its real projected station rather than the spawn origin"),Hull.IsSet()&&Hull.GetValue().Equals(ExpectedPosition,.01));
            ExpectedMerchantBounds+=ExpectedPosition-FVector(18000,18000,0);
            ExpectedMerchantBounds+=ExpectedPosition+FVector(18000,18000,5000);
            TestTrue(TEXT("Exact merchant hull index resolves inside its fitted formation"),Hull.IsSet()&&MerchantBounds.IsInsideOrOn(Hull.GetValue()));
        }
        TestTrue(TEXT("Merchant fit is exactly the two hull envelopes without fleet or marker pollution"),
            MerchantBounds.Min.Equals(ExpectedMerchantBounds.Min,.01)&&MerchantBounds.Max.Equals(ExpectedMerchantBounds.Max,.01));
        const auto Port=Array(Packet,TEXT("ports"))[0]->AsObject();Port->SetStringField(TEXT("owner"),TEXT("JPN"));Port->SetStringField(TEXT("color"),TEXT("#bd5b51"));
        Scene->ApplyWorldPacket(Packet);auto* After=FindPort();
        TestTrue(TEXT("An ownership change replaces only stale icon ink"),After&&After!=Before);
        const auto Pick=Scene->GetSelection(After);
        TestTrue(TEXT("Captured port selection reports its new national style"),String(Pick,TEXT("nation"))==TEXT("JPN")&&String(Pick,TEXT("color"))==TEXT("#bd5b51"));
        TestEqual(TEXT("Style updates do not grow the nine world-copy markers"),Number(Scene->GetChartDiagnostics(),TEXT("markerCount")),9.);
    }
    else AddError(TEXT("National chart packet fixture could not initialize"));
    World->DestroyWorld(false);return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBattleChartTest,"WNT.World.LiveBattleChartMarkers",
    EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBattleChartTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Battle chart test world"),World))return false;
    AWNTWorldActor* Scene=World->SpawnActor<AWNTWorldActor>();
    if(!TestNotNull(TEXT("Battle chart scene"),Scene)){World->DestroyWorld(false);return false;}
    TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"format":1,"campaign":"test","paused":false,"instanceId":"battle-map-test","battles":[{"id":"71","position":[179.8,25],"label":"Decisive battle","stage":3}]})");
    if(!TestTrue(TEXT("Battle chart packet parses"),FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet)))
    {World->DestroyWorld(false);return false;}
    Packet->SetObjectField(TEXT("chartSymbols"),ChartTestSpec());
    Scene->ApplyWorldPacket(Packet);
    TArray<TWeakObjectPtr<AActor>> Markers;
    for(TActorIterator<AActor> It(World);It;++It)if(const auto Pick=Scene->GetSelection(*It))
        if(String(Pick,TEXT("kind"))==TEXT("battle"))Markers.Add(*It);
    TestEqual(TEXT("Battle has selectable markers at every world copy"),Markers.Num(),3);
    for(double Meridian:{0.,179.9,-179.9,147.})
    {
        Scene->SetCentralMeridian(Meridian);
        for(const auto& Pointer:Markers)if(auto* Marker=Pointer.Get())
        {
            const auto Pick=Scene->GetSelection(Marker);
            TestTrue(TEXT("Battle selection preserves report and viewport identity"),Id(Pick,TEXT("id"))==TEXT("71")
                &&String(Pick,TEXT("instanceId"))==TEXT("battle-map-test"));
            const int32 Copy=static_cast<int32>(Number(Pick,TEXT("worldCopy")));
            TestTrue(TEXT("Battle remains at its actual wrapped geography"),Marker->GetActorLocation().Equals(ChartPosition(FVector2D(179.8,25),Meridian,Copy),.01));
            auto* Mesh=Marker->FindComponentByClass<UProceduralMeshComponent>();
            if(!TestNotNull(TEXT("Battle has one persistent mesh"),Mesh))continue;
            TestEqual(TEXT("Base badge and two muzzle highlights"),Mesh->GetNumSections(),3);
            const auto* Buffer=Mesh->GetProcMeshSection(0)->ProcVertexBuffer.GetData();
            TestFalse(TEXT("Battle ink is composited after the 3D scene"),Mesh->IsVisible());
            const FLinearColor First=BattleSymbolTint(UE_DOUBLE_PI/6.,0,true),Second=BattleSymbolTint(UE_DOUBLE_PI/6.,1,true);
            TestTrue(TEXT("Muzzle highlights alternate"),First.R>Second.R);
            TestTrue(TEXT("Animation changes highlight colour"),!First.Equals(BattleSymbolTint(UE_DOUBLE_PI/2.,0,true),.01f));
            TestEqual(TEXT("Contact approach has no firing animation"),BattleSymbolTint(0.,0,false),BattleSymbolTint(10.,0,false));
            TestTrue(TEXT("Animation preserves mesh allocation"),Buffer==Mesh->GetProcMeshSection(0)->ProcVertexBuffer.GetData());
            TestTrue(TEXT("Battle badge remains clickable"),Marker->GetActorEnableCollision());
        }
    }
    Packet->SetArrayField(TEXT("battles"),{});Scene->ApplyWorldPacket(Packet);
    for(const auto& Pointer:Markers)if(auto* Marker=Pointer.Get())
        TestFalse(TEXT("Completed battle cannot retain a selectable marker"),Scene->GetSelection(Marker).IsValid());
    World->DestroyWorld(false);return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTObservedRouteTest, "WNT.World.ObservedRouteContract",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FWNTObservedRouteTest::RunTest(const FString& Parameters)
{
    TSharedPtr<FJsonObject> Force;
    const FString Json = TEXT("{\"position\":[-179,67],\"heading\":0,\"navigation\":{\"fromAt\":0,\"toAt\":20,\"segments\":[")
        TEXT("{\"fromAt\":0,\"toAt\":10,\"from\":[179,65],\"to\":[-179,65],\"courseDelta\":[2,0],\"heading\":90,\"headingKnown\":true},")
        TEXT("{\"fromAt\":10,\"toAt\":20,\"from\":[-179,65],\"to\":[-179,67],\"courseDelta\":[0,2],\"heading\":0,\"headingKnown\":true}]}}");
    if (!TestTrue(TEXT("Contract JSON parses"), FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json), Force))) return false;
    const auto AcrossSeam = Sample(Force, .25), AfterTurn = Sample(Force, .75), Finished = Sample(Force, 10);
    TestTrue(TEXT("Seam route takes wrapped short leg"), AcrossSeam.Position.Equals(FVector2D(-180, 65), 1e-9));
    TestTrue(TEXT("Seam leg faces east"), FMath::IsNearlyEqual(AcrossSeam.Heading, 90.0, 1e-9));
    TestTrue(TEXT("Second leg retains the real turn"), AfterTurn.Position.Equals(FVector2D(-179, 66), 1e-9));
    TestTrue(TEXT("Second leg faces north"), FMath::IsNearlyZero(AfterTurn.Heading, 1e-9));
    TestTrue(TEXT("Never extrapolate beyond received state"), Finished.Position.Equals(FVector2D(-179, 67), 1e-9));
    const auto Shift = Offset(FVector2D(179.999, 0), 600, 0);
    TestTrue(TEXT("Metre formation crosses dateline correctly"), Shift.X < -179.9 && FMath::Abs(Shift.Y) < 1e-9);
    TestTrue(TEXT("North stays north on central meridian"), FMath::Abs(ProjectedYaw(FVector2D(40, 65), 0, 40)) < 1e-8);
    Force->SetField(TEXT("position"), MakeShared<FJsonValueNull>());
    TestFalse(TEXT("Unlocated hull is never moved to null island"), Sample(Force, .5).bValid);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWorldSelectionUpdateTest,"WNT.World.SelectionPreservesNavigation",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWorldSelectionUpdateTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Selection test world"),World))return false;
    auto* Scene=World->SpawnActor<AWNTWorldActor>();
    if(!TestNotNull(TEXT("Selection test scene"),Scene)){World->DestroyWorld(false);return false;}
    TSharedPtr<FJsonObject> Full;
    const FString Json=TEXT(R"({"format":1,"campaign":"test","player":"USA","at":15,"revision":7,"instanceId":"selection-test","paused":false,"forces":[{"id":"own","name":"Own fleet","position":[1,0],"heading":90,"hulls":[],"navigation":{"fromAt":0,"toAt":15,"segments":[{"fromAt":0,"toAt":15,"from":[0,0],"to":[1,0],"heading":90}]}}]})");
    if(!FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Full)){World->DestroyWorld(false);return false;}
    Full->SetObjectField(TEXT("chartSymbols"),ChartTestSpec());Scene->ApplyWorldPacket(Full);
    Scene->Runtime->ReceivedAt=100;Scene->Runtime->Duration=15;Scene->UpdateWorld(.37);
    const auto Original=Scene->Runtime->Packet;
    const auto Force=Array(Original,TEXT("forces"))[0];const auto Navigation=Object(Force->AsObject(),TEXT("navigation"));
    const FVector Before=Scene->GetSelectedPosition(TEXT("fleet"),TEXT("own")).GetValue();
    auto Patch=MakeShared<FJsonObject>();Patch->SetNumberField(TEXT("format"),1);Patch->SetBoolField(TEXT("selectionOnly"),true);
    Patch->SetStringField(TEXT("campaign"),TEXT("test"));Patch->SetStringField(TEXT("player"),TEXT("USA"));Patch->SetNumberField(TEXT("at"),15);
    Patch->SetNumberField(TEXT("revision"),7);Patch->SetStringField(TEXT("instanceId"),TEXT("selection-test"));
    Patch->SetArrayField(TEXT("selectedForceIds"),{MakeShared<FJsonValueString>(TEXT("own")),MakeShared<FJsonValueString>(TEXT("foreign"))});
    Patch->SetBoolField(TEXT("paused"),true); // Non-selection fields must be ignored.
    Scene->ApplyWorldPacket(Patch);
    TestTrue(TEXT("Selection retains the authoritative full packet object"),Scene->Runtime->Packet==Original);
    TestTrue(TEXT("Selection retains exact force and navigation objects"),Array(Original,TEXT("forces"))[0]==Force&&Object(Force->AsObject(),TEXT("navigation"))==Navigation);
    TestEqual(TEXT("Selection preserves interpolation origin time"),Scene->Runtime->ReceivedAt,100.0);
    TestEqual(TEXT("Selection preserves interpolation duration"),Scene->Runtime->Duration,15.0);
    TestEqual(TEXT("Selection does not restart interpolation"),Scene->Runtime->LastWorldFraction,.37);
    TestTrue(TEXT("Selection cannot snap moving fleets to the next tick"),Scene->GetSelectedPosition(TEXT("fleet"),TEXT("own")).GetValue().Equals(Before,.001));
    TestFalse(TEXT("Selection cannot change pause state"),Boolean(Original,TEXT("paused")));
    TestTrue(TEXT("Only known own fleet IDs are retained"),Scene->Runtime->SelectedForceIds.Num()==1&&Scene->Runtime->SelectedForceIds.Contains(TEXT("own")));
    for(const FString Field:{TEXT("instanceId"),TEXT("campaign"),TEXT("player"),TEXT("revision"),TEXT("at")})
    {
        auto Stale=MakeShared<FJsonObject>(*Patch);Stale->SetArrayField(TEXT("selectedForceIds"),{});
        if(Field==TEXT("revision")||Field==TEXT("at"))Stale->SetNumberField(Field,-1);else Stale->SetStringField(Field,TEXT("other"));
        Scene->ApplyWorldPacket(Stale);TestTrue(TEXT("Stale scene, campaign, player, revision and tick patches cannot change selection"),Scene->Runtime->SelectedForceIds.Contains(TEXT("own")));
    }
    Patch->SetArrayField(TEXT("selectedForceIds"),{});Scene->ApplyWorldPacket(Patch);
    TestTrue(TEXT("A current empty selection clears brackets"),Scene->Runtime->SelectedForceIds.IsEmpty());
    TestEqual(TEXT("Clearing selection also leaves navigation time untouched"),Scene->Runtime->ReceivedAt,100.0);
    World->DestroyWorld(false);return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTTacticalPresentationTest,"WNT.World.TacticalWingAndDepartureTracks",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTTacticalPresentationTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false).CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Tactical presentation world"),World))return false;
    auto* Scene=World->SpawnActor<AWNTWorldActor>();Scene->SetSceneMode(TEXT("battle"));
    TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"id":"tactical-tracks","eventKey":"slice-1","tactical":true,"movie":true,"animate":true,"durationSeconds":20,"elapsedSeconds":4,"playbackPaused":true,
      "units":[{"key":"hull","id":"hull","side":"A","type":"DD","positionMetres":[100,0,0],"disappearsAt":5,
        "trajectory":[{"time":0,"positionMetres":[0,0,0]},{"time":10,"positionMetres":[100,0,0]}]}],
      "airstrikes":[{"key":"wing","side":"A","planes":0,"fighters":0,"phase":"returning","appearsAt":2,"disappearsAt":12,"positionMetres":[1000,0,800],
        "trajectory":[{"time":0,"positionMetres":[0,0,800],"planes":30,"fighters":10},{"time":6,"positionMetres":[600,0,800],"planes":20,"fighters":5},{"time":12,"positionMetres":[1200,0,800],"planes":0,"fighters":0}]}],
      "shoreBatteries":[{"key":"fort","side":"B","health":0,"positionMetres":[2000,0,0],"lostAtSeconds":10,
        "trajectory":[{"time":0,"positionMetres":[2000,0,0],"health":1},{"time":6,"positionMetres":[2000,0,0],"health":0.5},{"time":10,"positionMetres":[2000,0,0],"health":0}]}]})");
    if(!TestTrue(TEXT("Tactical tracked packet parses"),FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet))){World->DestroyWorld(false);return false;}
    Scene->ApplyBattlePacket(Packet);
    auto* Hull=Scene->Runtime->BattleShips.FindRef(TEXT("hull")).Get();
    if(!TestNotNull(TEXT("Actual tracked hull exists"),Hull)){World->DestroyWorld(false);return false;}
    TestFalse(TEXT("Escaping hull remains visible before its recorded departure"),Hull->IsHidden());
    TestTrue(TEXT("Fit follows the hull's current40m position, not the start/end of its retained history"),FMath::IsNearlyEqual(Scene->GetBattleBounds().Min.X,-36000.,.01));
    Scene->SetSceneMode(TEXT("hidden"));
    TestTrue(TEXT("A first battle packet can be fitted even before its viewport activates"),FMath::IsNearlyEqual(Scene->GetBattleBounds().Min.X,-36000.,.01));
    Scene->SetSceneMode(TEXT("battle"));
    TestEqual(TEXT("A historical wing remains available even if its final aircraft count is zero"),Scene->Runtime->BattleAirWings.Num(),1);
    const auto& Wing=Scene->Runtime->BattleAirWings[0];
    TestEqual(TEXT("Early flight displays the observed strike and escort complement"),Wing.CountAt(4),FIntPoint(30,10));
    TestEqual(TEXT("Recorded losses change the aggregate count only at their observation"),Wing.CountAt(8),FIntPoint(20,5));
    TestTrue(TEXT("Aggregate aircraft follow their actual route and altitude"),Wing.Track.Sample(4).GetLocation().Equals(FVector(40000,0,80000),.01));
    TestFalse(TEXT("A wing cannot appear before launch"),Wing.Track.HasAppeared(1));
    TestTrue(TEXT("The wing leaves the map at its recorded recovery/loss time"),Wing.Track.HasDeparted(12));
    TestEqual(TEXT("Coastal batteries use separate chart records"),Scene->Runtime->ShoreBatteries.Num(),1);
    const auto& Battery=Scene->Runtime->ShoreBatteries[0];
    TestEqual(TEXT("Early battery health is not replaced by its final result"),Battery.HealthAt(4),1.);
    TestEqual(TEXT("Battery damage follows its actual observed timeline"),Battery.HealthAt(8),.5);
    TestEqual(TEXT("Destroyed battery health reaches zero at the recorded loss time"),Battery.HealthAt(10),0.);
    Packet->SetStringField(TEXT("eventKey"),TEXT("slice-2"));Packet->SetNumberField(TEXT("elapsedSeconds"),6);Scene->ApplyBattlePacket(Packet);
    TestTrue(TEXT("An escaped hull is no longer drawn or selectable"),Hull->IsHidden()&&!Hull->GetActorEnableCollision());
    TestTrue(TEXT("Fit no longer includes a departed hull's retained track"),FMath::IsNearlyEqual(Scene->GetBattleBounds().Min.X,160000.,.01));
    TestFalse(TEXT("Escaping is distinct from sinking"),Scene->Runtime->BattlePoses.FindChecked(TEXT("hull")).Track.IsLost(6));
    TestEqual(TEXT("An escaping hull has no fabricated sinking depth"),Hull->GetActorLocation().Z,0.);
    int32 HullActors=0;for(TActorIterator<AWNTShipActor> It(World);It;++It)++HullActors;
    TestEqual(TEXT("Aircraft and shore batteries add no pretend ship/model actors"),HullActors,1);
    TestEqual(TEXT("The wing renderer adds no effects components"),Scene->Runtime->BattleEffects.ComponentCount(),0);
    // Resolve an explicitly mixed-vintage fleet through the same live packet
    // path. The fixture registers two exact choices; neither may be replaced
    // by an implicit search of another campaign when a choice is unavailable.
    Scene->Runtime->ModelFiles.Add(TEXT("fixture-1922"),TEXT("fixture-1922.glb"));
    Scene->Runtime->ModelFiles.Add(TEXT("fixture-1936"),TEXT("fixture-1936.glb"));
    Scene->Runtime->PlatformModels.Add(TEXT("campaign_1922:vintage-class"),TEXT("fixture-1922"));
    Scene->Runtime->PlatformModels.Add(TEXT("in_good_faith_1936:vintage-class"),TEXT("fixture-1936"));
    Packet->SetStringField(TEXT("campaign"),TEXT("campaign_1922"));
    const auto Unit=Packet->GetArrayField(TEXT("units"))[0]->AsObject();Unit->SetStringField(TEXT("classId"),TEXT("vintage-class"));Unit->SetStringField(TEXT("campaign"),TEXT("in_good_faith_1936"));
    Scene->ApplyBattlePacket(Packet);
    TestEqual(TEXT("An explicit per-hull catalog campaign wins over the enclosing battle campaign"),Scene->Runtime->LoadedBattleModels.FindRef(TEXT("hull")),FString(TEXT("fixture-1936.glb")));
    Unit->RemoveField(TEXT("campaign"));Scene->ApplyBattlePacket(Packet);
    TestEqual(TEXT("Legacy packets without a per-hull override retain their enclosing campaign"),Scene->Runtime->LoadedBattleModels.FindRef(TEXT("hull")),FString(TEXT("fixture-1922.glb")));
    Unit->SetStringField(TEXT("campaign"),TEXT("unavailable-campaign"));Scene->ApplyBattlePacket(Packet);
    TestTrue(TEXT("A missing explicit catalog variant stays pending rather than substituting another campaign's hull"),Hull->IsModelPending()&&!Scene->Runtime->LoadedBattleModels.Contains(TEXT("hull")));
    World->DestroyWorld(false);return true;
}
#endif
