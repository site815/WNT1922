#include "WNTBattleEffects.h"
#include "WNTBattleTimeline.h"
#include "WNTCameraActor.h"
#include "WNTShipActor.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"
#include "GameFramework/PlayerController.h"
#include "Materials/Material.h"
#include "Materials/MaterialInstanceDynamic.h"

namespace
{
    FString Text(const TSharedPtr<FJsonObject>& Object,const TCHAR* Field)
    { FString Result; if(Object)Object->TryGetStringField(Field,Result);return Result; }
    double Number(const TSharedPtr<FJsonObject>& Object,const TCHAR* Field,double Fallback)
    { double Result;return Object&&Object->TryGetNumberField(Field,Result)&&FMath::IsFinite(Result)?Result:Fallback; }
    TOptional<FVector> RecordedPosition(const TSharedPtr<FJsonObject>& Object,const TCHAR* Field)
    {
        const TArray<TSharedPtr<FJsonValue>>* Values=nullptr;
        if(!Object||!Object->TryGetArrayField(Field,Values)||Values->Num()!=3)return {};
        FVector Position;
        for(int32 I=0;I<3;++I){double Coordinate;if(!(*Values)[I]->TryGetNumber(Coordinate)||!FMath::IsFinite(Coordinate)||FMath::Abs(Coordinate)>1e7)return {};Position[I]=Coordinate*100.;}
        return Position;
    }
    constexpr int32 Flash=0,Tracer=1,Smoke=2,Splash=3;
}

bool FWNTBattleEffects::SetPacket(const TSharedPtr<FJsonObject>& Packet,double Now)
{
    if(!Packet)return false;
    bool Animate=true;Packet->TryGetBoolField(TEXT("animate"),Animate);
    bool Paused=false;Packet->TryGetBoolField(TEXT("playbackPaused"),Paused);
    bAnimate=Animate;
    FString NextKey=Text(Packet,TEXT("eventKey"));
    if(NextKey.IsEmpty())NextKey=Text(Packet,TEXT("id"))+FString::Printf(TEXT(":%.0f:%.0f"),Number(Packet,TEXT("at"),0),Number(Packet,TEXT("index"),0));
    if(NextKey==FrameKey)
    {
        if(Paused!=bPlaybackPaused)
        {
            PausedElapsed=FMath::Clamp(Number(Packet,TEXT("elapsedSeconds"),Elapsed(Now)),0.,Duration);
            StartedAt=Now-PausedElapsed;bPlaybackPaused=Paused;
        }
        // Paused/reduced-motion demos settle this frame. Resuming the same
        // key cannot revive a wreck or replay already dismissed effects.
        if(!bAnimate){StartedAt=Now-Duration;PausedElapsed=Duration;}
        return false;
    }
    const double PreviousElapsed=Elapsed(Now);
    FrameKey=NextKey;Duration=FMath::Clamp(Number(Packet,TEXT("durationSeconds"),15),.1,90.);
    PausedElapsed=RollingClock.Rebase(Packet,PreviousElapsed,Number(Packet,TEXT("elapsedSeconds"),0),Duration);bPlaybackPaused=Paused;
    StartedAt=Now-PausedElapsed;
    if(!bAnimate){StartedAt=Now-Duration;PausedElapsed=Duration;}
    Events.Reset();SinkTimes.Reset();TSet<FString> Identities;
    bool Tactical=false;Packet->TryGetBoolField(TEXT("tactical"),Tactical);
    TSet<FString> ShoreKeys;const TArray<TSharedPtr<FJsonValue>>* Batteries=nullptr;
    if(Packet->TryGetArrayField(TEXT("shoreBatteries"),Batteries))for(const auto& Value:*Batteries)if(const auto Battery=Value->AsObject())ShoreKeys.Add(Text(Battery,TEXT("key")));
    const TArray<TSharedPtr<FJsonValue>>* Values=nullptr;
    if(Packet->TryGetArrayField(TEXT("events"),Values))for(const auto& Value:*Values)
    {
        if(Events.Num()>=MaxEvents)break;
        const auto Object=Value->AsObject();if(!Object)continue;
        FEvent Event{Text(Object,TEXT("key")),Text(Object,TEXT("type")),Text(Object,TEXT("sourceKey")),Text(Object,TEXT("targetKey")),Text(Object,TEXT("weapon")),
            Number(Object,TEXT("time"),-1),Number(Object,TEXT("duration"),-1)};
        const bool ContinuingProjectile=Tactical&&Event.Type==TEXT("salvo")&&Event.Duration<=21600&&Event.At>=-21600&&Event.At+Event.Duration>=0;
        if(Event.Key.IsEmpty()||Event.Target.IsEmpty()||Identities.Contains(Event.Key)||(!ContinuingProjectile&&Event.At<0)||Event.At>Duration||Event.Duration<=0
            ||(!ContinuingProjectile&&Event.At+Event.Duration>Duration+.001)||(Event.Type!=TEXT("salvo")&&Event.Type!=TEXT("hit")&&Event.Type!=TEXT("sink")))continue;
        // A tactical miss is a salvo arriving in the sea, never a fabricated
        // damage flash. The simulation alone supplies positive impact damage.
        if(Tactical&&Event.Type==TEXT("hit")&&Number(Object,TEXT("damage"),0)<=0)continue;
        if(Event.Type==TEXT("sink")&&ShoreKeys.Contains(Event.Target))continue;
        Event.SourcePosition=RecordedPosition(Object,TEXT("sourcePositionMetres"));
        Event.TargetPosition=RecordedPosition(Object,TEXT("targetPositionMetres"));
        Event.Planes=FMath::Clamp(int32(Number(Object,TEXT("planes"),0)),0,10000);
        Event.PlanesLost=FMath::Clamp(int32(Number(Object,TEXT("planesLost"),0)),0,10000);
        Identities.Add(Event.Key);Events.Add(Event);
        if(Event.Type==TEXT("sink"))SinkTimes.Add(Event.Target,FVector2D(Event.At,Event.Duration));
    }
    return true;
}

double FWNTBattleEffects::SinkProgress(const FString& Key,double Now) const
{
    const auto* Time=SinkTimes.Find(Key);
    return bAnimate&&Time?FMath::Clamp((Elapsed(Now)-Time->X)/Time->Y,0.,1.):1.;
}
double FWNTBattleEffects::Elapsed(double Now) const {return FMath::Clamp(bPlaybackPaused?PausedElapsed:Now-StartedAt,0.,Duration);}
bool FWNTBattleEffects::IsAnimating(double Now) const {return bAnimate&&!bPlaybackPaused&&Events.Num()>0&&Elapsed(Now)<Duration;}
FTransform FWNTBattleEffects::SinkingTransform(const FTransform& Surface,double Progress)
{
    const double Amount=FMath::Clamp(Progress,0.,1.);
    FTransform Result=Surface;
    // First establish the recorded loss through a readable list/capsize. The
    // earlier quadratic descent put the hull under water before its roll could
    // be seen. Finish at the same deadline; no combat outcome is changed.
    const double Descent=FMath::Clamp((Amount-.6)/.4,0.,1.);
    const double Depth=100.*FMath::Min(1.,Amount/.6)+9900.*Descent*Descent;
    Result.AddToTranslation(FVector(0,0,-Depth));
    Result.SetRotation(Surface.GetRotation()*FRotator(-8.*Amount,0,75.*Amount).Quaternion());
    return Result;
}
double FWNTBattleEffects::ReadableDiameter(double Base,double Pixels,double Maximum,double Depth,double FOV,int32 Width)
{
    if(!FMath::IsFinite(Depth)||!FMath::IsFinite(FOV)||Depth<=0||Width<=0)return Base;
    const double PerPixel=2.*Depth*FMath::Tan(FMath::DegreesToRadians(FMath::Clamp(FOV,1.,170.)*.5))/Width;
    return FMath::Clamp(FMath::Max(Base,Pixels*PerPixel),Base,FMath::Max(Base,Maximum));
}
int32 FWNTBattleEffects::ComponentCount() const
{int32 Count=0;for(const auto& Pool:Pools)if(Pool.IsValid())++Count;return Count;}
void FWNTBattleEffects::SetVisible(bool bVisible)
{if(!bVisible||!bAnimate)for(const auto& Pool:Pools)if(auto* Component=Pool.Get())Component->SetVisibility(false);}

void FWNTBattleEffects::EnsurePools(AActor* Owner)
{
    if(!Owner||!Owner->GetRootComponent()||ComponentCount()==4)return;
    auto* Mesh=LoadObject<UStaticMesh>(nullptr,TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    auto* Material=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_Marker.M_Marker"));
    if(!Material)Material=UMaterial::GetDefaultMaterial(MD_Surface);
    if(!Mesh)return;
    const FLinearColor Colours[4]={{3.f,1.1f,.10f},{2.f,1.4f,.40f},{.065f,.07f,.08f},{.66f,.79f,.82f}};
    for(int32 Kind=0;Kind<4;++Kind)if(!Pools[Kind].IsValid())
    {
        auto* Pool=NewObject<UInstancedStaticMeshComponent>(Owner,*FString::Printf(TEXT("RecordedBattleEffects%d"),Kind));
        Owner->AddInstanceComponent(Pool);Pool->SetupAttachment(Owner->GetRootComponent());Pool->SetMobility(EComponentMobility::Movable);
        Pool->SetStaticMesh(Mesh);Pool->SetMaterial(0,Material);Pool->SetCastShadow(false);Pool->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Pool->SetGenerateOverlapEvents(false);Pool->SetCanEverAffectNavigation(false);Pool->SetAffectDistanceFieldLighting(false);
        Pool->RegisterComponent();
        if(auto* Dynamic=Pool->CreateDynamicMaterialInstance(0))Dynamic->SetVectorParameterValue(TEXT("Tint"),Colours[Kind]);
        for(int32 Slot=0;Slot<PoolSize;++Slot)Pool->AddInstance(FTransform(FQuat::Identity,FVector::ZeroVector,FVector::ZeroVector));
        Pool->SetVisibility(false);Pools[Kind]=Pool;
    }
}

void FWNTBattleEffects::Update(AActor* Owner,const TMap<FString,FTransform>& Ships,double Now,bool bVisible,
    const TMap<FString,TWeakObjectPtr<AWNTShipActor>>* Actors)
{
    if(!bVisible||!bAnimate||Events.IsEmpty()||Elapsed(Now)>=Duration){SetVisible(false);return;}
    EnsurePools(Owner);
    const APlayerController* Player=Owner&&Owner->GetWorld()?Owner->GetWorld()->GetFirstPlayerController():nullptr;
    const AWNTCameraActor* Camera=Player?Cast<AWNTCameraActor>(Player->GetViewTarget()):nullptr;
    int32 Width=0,Height=0;if(Player)Player->GetViewportSize(Width,Height);
    for(auto& Buffer:Transforms)Buffer.Reset();
    auto Draw=[&](int32 Kind,const FVector& Position,const FVector& Scale,const FQuat& Rotation=FQuat::Identity)
    {
        if(Transforms[Kind].Num()>=PoolSize)return;
        FVector Readable=Scale;
        if(Camera)
        {
            const double Depth=FVector::DotProduct(Position-Camera->View.Location,Camera->View.Rotation.Vector());
            auto Size=[&](double Base,double Pixels,double Maximum){return ReadableDiameter(Base*100.,Pixels,Maximum,Depth,Camera->View.FOV,Width)/100.;};
            if(Kind==Tracer)Readable=FVector(Size(Scale.X,12,9000),Size(Scale.Y,2.5,1200),Size(Scale.Z,2.5,1200));
            else if(Kind==Flash)Readable=FVector(Size(Scale.X,10,4000),Size(Scale.Y,10,4000),Size(Scale.Z,10,4000));
            else if(Kind==Smoke)Readable=FVector(Size(Scale.X,9,5500),Size(Scale.Y,9,5500),Size(Scale.Z,12,7000));
            else Readable=FVector(Size(Scale.X,8,18000),Size(Scale.Y,6,9000),Scale.Z);
        }
        Transforms[Kind].Add(FTransform(Rotation,Position,Readable));
    };
    auto Anchor=[&](const FString& Key,bool bMuzzle)
    {
        // Derived from the real loaded model bounds, so a flash is not buried
        // inside an opaque hull. Positions still illustrate an aggregate
        // exchange; they are not claimed historical gun or hit locations.
        FVector Local(bMuzzle?2500:0,0,1800);
        if(Actors)if(auto* Ship=Actors->FindRef(Key).Get())if(Ship->HasRenderableModel())
        {
            FVector Low,High;Ship->DetailedMesh->GetLocalBounds(Low,High);
            if(!Low.ContainsNaN()&&!High.ContainsNaN())
            {
                const FVector Extent=High-Low;
                Local.X=bMuzzle?(Low.X+High.X)*.5+Extent.X*.27:0;
                Local.Y=bMuzzle?0:Extent.Y*.20;
                Local.Z=FMath::Clamp(Low.Z+Extent.Z*.45+400.,1200.,3500.);
            }
        }
        return Local;
    };
    const double Elapsed=this->Elapsed(Now);
    for(const auto& Event:Events)
    {
        const double Age=Elapsed-Event.At;if(Age<0||Age>Event.Duration)continue;
        const auto* Target=Ships.Find(Event.Target);if(!Target&&!Event.TargetPosition.IsSet())continue;
        const double Alpha=FMath::Clamp(Age/Event.Duration,0.,1.);
        const FVector Impact=Event.TargetPosition.IsSet()?Event.TargetPosition.GetValue():Target->TransformPosition(Anchor(Event.Target,false));
        if(Event.Type==TEXT("salvo"))
        {
            if(Event.Weapon==TEXT("air"))
            {
                // Individual runs are a bounded illustration of this one
                // aggregate event. Only the separate confirmed hit emits damage.
                for(int32 I=0;I<FMath::Min(3,Event.Planes);++I)
                {
                    const double Fall=FMath::Clamp((Age-I*.06)/.45,0.,1.);
                    if(Fall<1)Draw(Tracer,Impact+FVector(-1800.*(1-Fall),I*450.,26000.*(1-Fall)),FVector(.5,.35,2.5));
                }
                if(Event.PlanesLost>0)for(int32 I=0;I<3;++I)
                    Draw(Smoke,Impact+FVector(-5000.+I*4300.,(I-1)*5200.,17000.+I*4500.),FVector(9.+Age*3.)*(1.-Alpha*.65));
                continue;
            }
            const auto* Source=Ships.Find(Event.Source);
            const FVector Start=Event.SourcePosition.IsSet()?Event.SourcePosition.GetValue():Source?Source->TransformPosition(Anchor(Event.Source,true)):Impact+FVector(-18000,0,Event.Weapon==TEXT("air")?24000:1000);
            const double Arc=Event.Weapon==TEXT("submarine")?0.:FMath::Min(12000.,FVector::Distance(Start,Impact)*.12);
            const FVector Projectile=FMath::Lerp(Start,Impact,Alpha)+FVector(0,0,4.*Arc*Alpha*(1.-Alpha));
            const FVector Direction=(Impact-Start+FVector(0,0,4.*Arc*(1.-2.*Alpha))).GetSafeNormal();
            Draw(Tracer,Projectile,FVector(5,.32,.32),FRotationMatrix::MakeFromX(Direction).ToQuat());
            if(Source&&Age<.24&&Event.Weapon==TEXT("surface"))Draw(Flash,Start,FVector(6.*(1.-Age/.24)));
            // A broad water burst marks aggregate salvo arrival. It is not a
            // claim that a particular shell hit a particular simulated hull.
            if(Alpha>.72)Draw(Splash,FVector(Impact.X,Impact.Y,900*(Alpha-.72)/.28),FVector(4,4,18)*(1.-Alpha));
        }
        else if(Event.Type==TEXT("hit"))
        {
            if(Age<.65)Draw(Flash,Impact,FVector(8.*(1.-Age/.65),6,5));
            for(int32 Puff=0;Puff<3;++Puff)
            {
                const double Size=(7.+Puff*3.+Age*3.)*(1.-Alpha*.6);
                Draw(Smoke,Impact+FVector(Age*120+Puff*300,Puff*160,Age*650+Puff*400),FVector(Size,Size,Size*1.25));
            }
        }
        else if(Event.Type==TEXT("sink"))
        {
            const FVector Water(Impact.X,Impact.Y,60);
            Draw(Splash,Water,FVector(25.+Alpha*90,10.+Alpha*32,.3)*(1.-Alpha*.6));
        }
    }
    for(int32 Kind=0;Kind<4;++Kind)if(auto* Pool=Pools[Kind].Get())
    {
        const int32 Active=Transforms[Kind].Num();
        while(Transforms[Kind].Num()<LastCount[Kind])Transforms[Kind].Add(FTransform(FQuat::Identity,FVector::ZeroVector,FVector::ZeroVector));
        if(!Transforms[Kind].IsEmpty())Pool->BatchUpdateInstancesTransforms(0,Transforms[Kind],true,true,true);
        Pool->SetVisibility(Active>0);LastCount[Kind]=Active;
    }
}

#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Engine/World.h"
#include "Components/SceneComponent.h"
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTRecordedBattleEffectsTest,"WNT.World.RecordedBattleEffects",
    EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTRecordedBattleEffectsTest::RunTest(const FString& Parameters)
{
    auto* Marker=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Marker.M_Marker"));
    if(!TestNotNull(TEXT("Actual recorded-effects master material exists"),Marker))return false;
    // A usage check that mutates the asset in the editor would hide a missing
    // cooked permutation. Query only; Shipping cannot generate it on demand.
    TestTrue(TEXT("Recorded-effects master cooks the instanced-static-mesh permutation"),Marker->GetUsageByFlag(MATUSAGE_InstancedStaticMeshes));
    TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"id":"71","eventKey":"71:115:1","animate":true,"durationSeconds":15,"events":[{"key":"salvo","type":"salvo","sourceKey":"A:a:0","targetKey":"B:b:0","weapon":"surface","time":0,"duration":1.5},{"key":"hit","type":"hit","targetKey":"B:b:0","time":2,"duration":4},{"key":"sink","type":"sink","targetKey":"B:b:0","time":4,"duration":8}]})");
    if(!TestTrue(TEXT("Recorded effect packet parses"),FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet)))return false;
    FWNTBattleEffects Effects;TestTrue(TEXT("First frame accepted"),Effects.SetPacket(Packet,100));
    TestEqual(TEXT("Recorded events accepted"),Effects.EventCount(),3);
    TestEqual(TEXT("Not sunk before its recorded presentation"),Effects.SinkProgress(TEXT("B:b:0"),103),0.);
    TestEqual(TEXT("Sinking progresses over eight seconds"),Effects.SinkProgress(TEXT("B:b:0"),108),.5);
    TestFalse(TEXT("Selection packet does not restart the frame"),Effects.SetPacket(Packet,108));
    TestEqual(TEXT("Duplicate packet preserves progress"),Effects.SinkProgress(TEXT("B:b:0"),110),.75);
    TestEqual(TEXT("Completed sink is final"),Effects.SinkProgress(TEXT("B:b:0"),112),1.);
    TestEqual(TEXT("Unrecorded sink has no fabricated animation"),Effects.SinkProgress(TEXT("other"),102),1.);
    const FTransform Surface(FRotator(0,45,0),FVector(10000,20000,0));
    const auto Half=FWNTBattleEffects::SinkingTransform(Surface,.5);
    TestTrue(TEXT("Sink lowers and rolls original surface pose"),Half.GetLocation().Z<0&&!Half.GetRotation().Equals(Surface.GetRotation()));
    TestTrue(TEXT("Halfway sinking retains a visible rolled hull above a one-metre descent"),Half.GetLocation().Z>-100.&&FMath::Abs(Half.Rotator().Roll)>30.);
    TestTrue(TEXT("Early list lowers by only half a metre"),FMath::IsNearlyEqual(FWNTBattleEffects::SinkingTransform(Surface,.3).GetLocation().Z,-50.,1e-8));
    TestEqual(TEXT("Final wreck reaches final depth"),FWNTBattleEffects::SinkingTransform(Surface,1.).GetLocation().Z,-10000.);
    for(int32 Pixels:{1800,2560,3440})for(double FOV:{45.,75.,110.})
    {
        const double Depth=300000.,PerPixel=2.*Depth*FMath::Tan(FMath::DegreesToRadians(FOV*.5))/Pixels;
        const double Diameter=FWNTBattleEffects::ReadableDiameter(32,2.5,1200,Depth,FOV,Pixels);
        TestTrue(TEXT("Tracer thickness reaches 2.5 physical pixels at fitted-fleet distances"),Diameter/PerPixel>=2.5-1e-8);
        TestTrue(TEXT("Tracer thickness retains a finite physical bound"),Diameter<=1200&&Diameter>=32);
        const double Near=FWNTBattleEffects::ReadableDiameter(32,2.5,1200,1000,FOV,Pixels);
        TestEqual(TEXT("Close inspection retains physical tracer thickness"),Near,32.);
    }
    TestEqual(TEXT("An extreme distant view cannot grow fleet-size effects without bound"),FWNTBattleEffects::ReadableDiameter(32,2.5,1200,1e9,90,1800),1200.);
    TestTrue(TEXT("Repeated sampling is not cumulative"),Half.Equals(FWNTBattleEffects::SinkingTransform(Surface,.5)));
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false).CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Effects test world"),World))return false;
    AActor* Owner=World->SpawnActor<AActor>();auto* Root=NewObject<USceneComponent>(Owner);Owner->AddInstanceComponent(Root);Owner->SetRootComponent(Root);Root->RegisterComponent();
    const TMap<FString,FTransform> Ships{{TEXT("A:a:0"),FTransform(FVector(-50000,0,0))},{TEXT("B:b:0"),Surface}};
    for(double Now=100;Now<115;Now+=.1)Effects.Update(Owner,Ships,Now,true);
    TestEqual(TEXT("Four pooled components across complete animation"),Effects.ComponentCount(),4);
    TArray<UInstancedStaticMeshComponent*> Pools;Owner->GetComponents(Pools);
    for(auto* Pool:Pools){TestEqual(TEXT("Fixed instance allocation"),Pool->GetInstanceCount(),FWNTBattleEffects::PoolSize);TestEqual(TEXT("Effects cannot intercept clicks"),Pool->GetCollisionEnabled(),ECollisionEnabled::NoCollision);}
    Effects.Update(Owner,Ships,116,true);for(auto* Pool:Pools)TestFalse(TEXT("Expired effects hidden"),Pool->IsVisible());
    Packet->SetBoolField(TEXT("animate"),false);Effects.SetPacket(Packet,109);
    TestEqual(TEXT("Reduced motion applies recorded loss immediately"),Effects.SinkProgress(TEXT("B:b:0"),109),1.);
    Effects.Update(Owner,Ships,109,true);for(auto* Pool:Pools)TestFalse(TEXT("Reduced motion has no transient effects"),Pool->IsVisible());
    Packet->SetBoolField(TEXT("animate"),true);Effects.SetPacket(Packet,109.1);
    TestFalse(TEXT("Resuming a settled frame never replays its effects"),Effects.IsAnimating(109.1));
    TestEqual(TEXT("Resuming does not resurrect a settled wreck"),Effects.SinkProgress(TEXT("B:b:0"),109.1),1.);
    // The same observed loss must freeze in place when its recorded movie is
    // paused, survive selection packets and resume without repeating a salvo.
    Packet->SetStringField(TEXT("eventKey"),TEXT("movie:71:1"));Packet->SetNumberField(TEXT("durationSeconds"),60);
    Packet->SetBoolField(TEXT("playbackPaused"),false);Packet->SetNumberField(TEXT("elapsedSeconds"),0);
    Effects.SetPacket(Packet,200);
    TestEqual(TEXT("Long movie clock is independent of campaign time"),Effects.Elapsed(208),8.);
    Packet->SetBoolField(TEXT("playbackPaused"),true);Packet->SetNumberField(TEXT("elapsedSeconds"),8);
    TestFalse(TEXT("Pause keeps the timeline identity"),Effects.SetPacket(Packet,208));
    TestEqual(TEXT("Paused sink freezes half-way even after a long pause"),Effects.SinkProgress(TEXT("B:b:0"),500),.5);
    TestFalse(TEXT("Paused effects do not require continuous animation ticks"),Effects.IsAnimating(500));
    Effects.SetPacket(Packet,500);TestEqual(TEXT("Selection while paused preserves elapsed time"),Effects.Elapsed(501),8.);
    Packet->SetBoolField(TEXT("playbackPaused"),false);Effects.SetPacket(Packet,502);
    TestEqual(TEXT("Resume continues at its existing sink progress"),Effects.SinkProgress(TEXT("B:b:0"),504),.75);
    Packet->SetNumberField(TEXT("elapsedSeconds"),0);Effects.SetPacket(Packet,505);
    TestEqual(TEXT("Duplicate playing packet cannot rewind the movie"),Effects.Elapsed(505),11.);
    TSharedPtr<FJsonObject> Unit;
    FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(FString(TEXT(R"({"appearsAt":0,"lostAtSeconds":15,"trajectory":[{"time":0,"positionMetres":[0,0,0],"headingDegrees":170},{"time":20,"positionMetres":[200,400,0],"headingDegrees":-170}]})"))),Unit);
    FWNTBattleTrack Track;Track.Read(Unit,60);
    TestEqual(TEXT("Halfway track interpolates metres to Unreal centimetres"),Track.Sample(10).GetLocation(),FVector(10000,20000,0));
    TestTrue(TEXT("Heading follows the short angular arc"),FMath::IsNearlyEqual(FMath::Abs(Track.Sample(10).Rotator().Yaw),180.,1e-6));
    TestFalse(TEXT("Future observed loss stays afloat"),Track.IsLost(14.));
    TestTrue(TEXT("Only the recorded loss time marks the hull lost"),Track.IsLost(15.));
    TestTrue(TEXT("A sinking hull stops its course at the loss position"),Track.Sample(40).Equals(Track.Sample(15)));
    Unit->RemoveField(TEXT("lostAtSeconds"));
    Unit->GetArrayField(TEXT("trajectory"))[1]->AsObject()->SetBoolField(TEXT("cut"),true);Track.Read(Unit,60);
    TestEqual(TEXT("An archive gap does not invent travel through missing observations"),Track.Sample(19).GetLocation(),FVector::ZeroVector);
    TestEqual(TEXT("The next retained observation is reached exactly at the cut"),Track.Sample(20).GetLocation(),FVector(20000,40000,0));
    World->DestroyWorld(false);return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTTacticalEndpointsTest,"WNT.World.TacticalProjectileEndpoints",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTTacticalEndpointsTest::RunTest(const FString& Parameters)
{
    TSharedPtr<FJsonObject> Packet;
    const FString Json=TEXT(R"({"id":"tactical","eventKey":"slice-1","tactical":true,"animate":true,"durationSeconds":15,"events":[
      {"key":"torpedo","type":"salvo","weapon":"submarine","sourceKey":"a","targetKey":"b","time":0,"duration":30,"hits":0,"sourcePositionMetres":[100,200,0],"targetPositionMetres":[1100,200,0]},
      {"key":"false-hit","type":"hit","targetKey":"b","time":2,"duration":2,"damage":0},
      {"key":"hit","type":"hit","targetKey":"b","time":6,"duration":2,"damage":0.1,"targetPositionMetres":[1200,300,15]}]})");
    if(!TestTrue(TEXT("Tactical effects packet parses"),FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Packet)))return false;
    auto Battery=MakeShared<FJsonObject>();Battery->SetStringField(TEXT("key"),TEXT("fort"));Packet->SetArrayField(TEXT("shoreBatteries"),{MakeShared<FJsonValueObject>(Battery)});
    auto Loss=MakeShared<FJsonObject>();Loss->SetStringField(TEXT("key"),TEXT("fort-loss"));Loss->SetStringField(TEXT("type"),TEXT("sink"));Loss->SetStringField(TEXT("targetKey"),TEXT("fort"));Loss->SetNumberField(TEXT("time"),1);Loss->SetNumberField(TEXT("duration"),5);
    auto Events=Packet->GetArrayField(TEXT("events"));Events.Add(MakeShared<FJsonValueObject>(Loss));Packet->SetArrayField(TEXT("events"),Events);
    FWNTBattleEffects Effects;Effects.SetPacket(Packet,100);
    TestEqual(TEXT("Only the positive hit and in-flight torpedo are accepted; zero-damage flashes and shore-battery watersinking are rejected"),Effects.EventCount(),2);
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false).CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Tactical effects world"),World))return false;
    AActor* Owner=World->SpawnActor<AActor>();auto* Root=NewObject<USceneComponent>(Owner);Owner->AddInstanceComponent(Root);Owner->SetRootComponent(Root);Root->RegisterComponent();
    TMap<FString,FTransform> Ships{{TEXT("a"),FTransform(FVector(-9000000,0,0))},{TEXT("b"),FTransform(FVector(9000000,0,0))}};
    Effects.Update(Owner,Ships,105,true);
    TArray<UInstancedStaticMeshComponent*> Pools;Owner->GetComponents(Pools);
    UInstancedStaticMeshComponent* TracerPool=nullptr;UInstancedStaticMeshComponent* FlashPool=nullptr;
    for(auto* Pool:Pools){if(Pool->GetName()==TEXT("RecordedBattleEffects1"))TracerPool=Pool;if(Pool->GetName()==TEXT("RecordedBattleEffects0"))FlashPool=Pool;}
    if(!TestTrue(TEXT("Fixed tactical effects pools exist"),TracerPool&&FlashPool)){World->DestroyWorld(false);return false;}
    FTransform Before;TracerPool->GetInstanceTransform(0,Before,true);
    TestTrue(TEXT("A long torpedo is only one sixth through its actual30-second visual flight, not forced to arrive at the packet deadline"),Before.GetLocation().Equals(FVector(10000+100000/6.,20000,0),.01));
    TestFalse(TEXT("A torpedo miss creates no invented hull-impact flash"),FlashPool->IsVisible());
    Ships[TEXT("b")]=FTransform(FVector(-8000000,1000000,0));Effects.Update(Owner,Ships,105,true);
    FTransform After;TracerPool->GetInstanceTransform(0,After,true);
    TestTrue(TEXT("Recorded launch and aim points do not home onto the target's later position"),Before.Equals(After,.001));
    Effects.Update(Owner,Ships,106.1,true);FTransform Hit;FlashPool->GetInstanceTransform(0,Hit,true);
    TestTrue(TEXT("The damage flash uses the actual recorded impact coordinate"),Hit.GetLocation().Equals(FVector(120000,30000,1500),.01));
    TestEqual(TEXT("Tactical effects retain the same four bounded pools"),Effects.ComponentCount(),4);
    Packet->SetStringField(TEXT("eventKey"),TEXT("slice-2"));Packet->SetNumberField(TEXT("elapsedSeconds"),6);
    Packet->GetArrayField(TEXT("events"))[0]->AsObject()->SetNumberField(TEXT("time"),-10);
    Effects.SetPacket(Packet,200);Effects.Update(Owner,Ships,200,true);FTransform Continuing;TracerPool->GetInstanceTransform(0,Continuing,true);
    TestTrue(TEXT("A long torpedo remains at its true sixteen-second flight age after its launch leaves the rolling history window"),Continuing.GetLocation().Equals(FVector(10000+100000*16./30.,20000,0),.01));
    World->DestroyWorld(false);return true;
}
#endif
