#include "WNTBattleCameraDirector.h"
#include "Dom/JsonObject.h"

namespace
{
FString Text(const TSharedPtr<FJsonObject>& Object,const TCHAR* Field)
{FString Result;if(Object)Object->TryGetStringField(Field,Result);return Result;}
double Number(const TSharedPtr<FJsonObject>& Object,const TCHAR* Field,double Fallback)
{double Value;return Object&&Object->TryGetNumberField(Field,Value)&&FMath::IsFinite(Value)?Value:Fallback;}
bool Flag(const TSharedPtr<FJsonObject>& Object,const TCHAR* Field,bool Fallback=false)
{bool Value=Fallback;if(Object)Object->TryGetBoolField(Field,Value);return Value;}
}

void FWNTBattleCameraDirector::SetPacket(const TSharedPtr<FJsonObject>& Packet,double Now)
{
    if(!Packet||!FMath::IsFinite(Now))return;
    const FString NextBattle=Text(Packet,TEXT("id")),NextKey=Text(Packet,TEXT("eventKey"));
    const bool NewBattle=NextBattle!=BattleId;
    const FString NextSession=Text(Packet,TEXT("tacticalSessionId"));
    if(NewBattle||TacticalSession!=NextSession)
    {
        TacticalSession=NextSession;NextLiveShotAt=Now+2.5;
        LiveShot={0,TEXT("establish"),TEXT(""),TEXT("")};
    }
    const bool WasAvailable=bAvailable;
    bAvailable=Flag(Packet,TEXT("cameraDirector"))&&Flag(Packet,TEXT("animate"),true);
    if(NewBattle||(!WasAvailable&&bAvailable))bEnabled=bAvailable;
    if(!bAvailable)bEnabled=false;
    const bool Paused=Flag(Packet,TEXT("playbackPaused"));
    if(!NewBattle&&NextKey==FrameKey&&bAvailable==WasAvailable)
    {
        if(Paused!=bPaused)
        {
            PausedElapsed=FMath::Clamp(Number(Packet,TEXT("elapsedSeconds"),Elapsed(Now)),0.,Duration);
            StartedAt=Now-PausedElapsed;bPaused=Paused;
        }
        return; // A selected hull or UI refresh cannot restart a camera shot.
    }
    BattleId=NextBattle;FrameKey=NextKey;Units.Reset();Shots.Reset();
    Duration=FMath::Clamp(Number(Packet,TEXT("durationSeconds"),15),.1,90.);
    PausedElapsed=FMath::Clamp(Number(Packet,TEXT("elapsedSeconds"),0),0.,Duration);
    StartedAt=Now-PausedElapsed;bPaused=Paused;
    if(!bAvailable)return;
    const TArray<TSharedPtr<FJsonValue>>* Values=nullptr;
    TArray<TSharedPtr<FJsonValue>> CameraUnits;TSet<FString> ShoreKeys;
    if(Packet->TryGetArrayField(TEXT("units"),Values))CameraUnits.Append(*Values);
    if(Packet->TryGetArrayField(TEXT("shoreBatteries"),Values))for(const auto& Value:*Values)
    {CameraUnits.Add(Value);if(const auto Battery=Value->AsObject())ShoreKeys.Add(Text(Battery,TEXT("key")));}
    for(const auto& Value:CameraUnits)
    {
        if(Units.Num()>=2048)break;
        const auto Object=Value->AsObject();if(!Object)continue;
        FUnit Unit;Unit.Key=Text(Object,TEXT("key"));Unit.Side=Text(Object,TEXT("side"));
        if(Unit.Key.IsEmpty())continue;
        Unit.Track.Read(Object,Duration);Unit.Yaw=Number(Object,TEXT("headingDegrees"),0);
        Unit.DisplayUntil=Number(Object,TEXT("disappearsAt"),TNumericLimits<double>::Max());
        if(Unit.Track.LostAt>=0&&!ShoreKeys.Contains(Unit.Key))Unit.DisplayUntil=FMath::Min(Unit.DisplayUntil,Unit.Track.LostAt);
        const TArray<TSharedPtr<FJsonValue>>* Position=nullptr;
        if(Object->TryGetArrayField(TEXT("positionMetres"),Position)&&Position->Num()==3)
        {
            bool Valid=true;
            for(int32 Axis=0;Axis<3;++Axis){double Coordinate;if(!(*Position)[Axis]->TryGetNumber(Coordinate)||!FMath::IsFinite(Coordinate)||FMath::Abs(Coordinate)>1e7){Valid=false;break;}Unit.Position[Axis]=Coordinate*100.;}
            if(!Valid)continue;
        }
        else if(Unit.Track.Points.IsEmpty())continue;
        Units.Add(Unit.Key,MoveTemp(Unit));
    }
    Shots.Add({0,TEXT("establish"),TEXT(""),TEXT("")});
    struct FEvent { double At; int32 Priority; FString Key,Type,Source,Target; };
    TArray<FEvent> Events;
    if(Packet->TryGetArrayField(TEXT("events"),Values))for(const auto& Value:*Values)
    {
        if(Events.Num()>=4096)break;
        const auto Event=Value->AsObject();if(!Event)continue;
        const FString Type=Text(Event,TEXT("type")),Target=Text(Event,TEXT("targetKey")),Source=Text(Event,TEXT("sourceKey"));
        const double At=Number(Event,TEXT("time"),-1);
        const int32 Priority=Type==TEXT("sink")?3:Type==TEXT("hit")?2:Type==TEXT("salvo")?1:0;
        if(!Priority||At<0||At>Duration||!Units.Contains(Target))continue;
        if(Type==TEXT("sink"))Units.FindChecked(Target).DisplayUntil=FMath::Min(Duration,At+FMath::Max(0.,Number(Event,TEXT("duration"),8.)));
        Events.Add({At,Priority,Text(Event,TEXT("key")),Type,Source,Target});
    }
    Events.Sort([](const FEvent& A,const FEvent& B){return A.At!=B.At?A.At<B.At:A.Key<B.Key;});
    if(!TacticalSession.IsEmpty())
    {
        // Live simulation sends a new10-second slice frequently. Replacing its
        // tracks must not reset camera holds or start an establishing shot on
        // every eventKey. Use real watch time for editing, simulation time only
        // for positioning the selected ship inside the latest slice.
        if(!bPaused&&Now>=NextLiveShotAt&&!Events.IsEmpty())
        {
            int32 Best=INDEX_NONE;const double CurrentElapsed=Elapsed(Now);
            for(int32 I=0;I<Events.Num();++I)
                if(Events[I].At>=CurrentElapsed-.2&&(Best==INDEX_NONE||Events[I].Priority>Events[Best].Priority||
                    (Events[I].Priority==Events[Best].Priority&&Events[I].At>Events[Best].At)))Best=I;
            if(Best!=INDEX_NONE)
            {
                const auto& Event=Events[Best];
                const bool Firing=Event.Type==TEXT("salvo")&&Units.Contains(Event.Source);
                LiveShot={0,Firing?TEXT("firing"):Event.Type,Firing?Event.Source:Event.Target,Firing?Event.Target:Event.Source};
                NextLiveShotAt=Now+(Event.Type==TEXT("sink")?6.:4.5);
            }
        }
        return;
    }
    double NextAt=FMath::Min(3.5,Duration*.12);
    for(int32 Index=0;Index<Events.Num()&&Shots.Num()<24;++Index)
    {
        if(Events[Index].At<NextAt)continue;
        // Within one shot window prefer an actual loss, then an impact, then
        // firing. Minimum holds prevent rapid switching between simultaneous
        // salvos in a large fleet action.
        int32 Best=Index;
        for(int32 J=Index+1;J<Events.Num()&&Events[J].At<=Events[Index].At+2.;++J)
            if(Events[J].Priority>Events[Best].Priority)Best=J;
        const auto& Event=Events[Best];
        const bool Firing=Event.Type==TEXT("salvo")&&Units.Contains(Event.Source);
        const double At=FMath::Max(NextAt,Event.At-.9);
        Shots.Add({At,Firing?TEXT("firing"):Event.Type,Firing?Event.Source:Event.Target,Firing?Event.Target:Event.Source});
        NextAt=At+(Event.Type==TEXT("sink")?6.:4.5);Index=Best;
    }
}

double FWNTBattleCameraDirector::Elapsed(double Now) const
{return FMath::Clamp(bPaused?PausedElapsed:Now-StartedAt,0.,Duration);}

FWNTBattleCameraDirector::FView FWNTBattleCameraDirector::Establish(double At,double Aspect) const
{
    FBox Bounds(ForceInit);
    for(const auto& Pair:Units)
    {
        const auto& Unit=Pair.Value;
        if(!Unit.Track.HasAppeared(At)||At>=Unit.DisplayUntil)continue;
        const FVector Position=Unit.Track.Points.IsEmpty()?Unit.Position:Unit.Track.Sample(At).GetLocation();
        Bounds+=Position+FVector(25000);Bounds+=Position-FVector(25000);
    }
    if(!Bounds.IsValid)for(const auto& Pair:Units)Bounds+=Pair.Value.Position;
    FView View;if(!Bounds.IsValid)return View;
    View.Target=Bounds.GetCenter();View.Target.Z=FMath::Max(500.,View.Target.Z);
    const double HalfAngle=FMath::Atan(FMath::Tan(FMath::DegreesToRadians(22.5))*FMath::Clamp(Aspect,.15,1.));
    View.Distance=FMath::Max(60000.,Bounds.GetExtent().Size()/FMath::Sin(HalfAngle)*1.18);
    // Continental-scale carrier overviews use the clear navigation pose.
    // Oblique cinematic angles are useful once individual hulls are readable.
    if(View.Distance>2000000.){View.Tilt=25.;View.Yaw=0.;}
    return View;
}

FString FWNTBattleCameraDirector::ActiveShot(double Now) const
{
    if(!TacticalSession.IsEmpty())return LiveShot.Type;
    FString Result=TEXT("establish");const double At=Elapsed(Now);
    for(const auto& Shot:Shots){if(Shot.At>At)break;Result=Shot.Type;}
    return Result;
}

TOptional<FWNTBattleCameraDirector::FView> FWNTBattleCameraDirector::Evaluate(double Now,double Aspect) const
{
    if(!IsEnabled()||Units.IsEmpty()||!FMath::IsFinite(Now))return {};
    const double At=Elapsed(Now);const FShot* Selected=nullptr;
    if(!TacticalSession.IsEmpty())Selected=&LiveShot;
    else for(const auto& Shot:Shots){if(Shot.At>At)break;Selected=&Shot;}
    if(!Selected||Selected->Subject.IsEmpty())return Establish(At,Aspect);
    const FUnit* Subject=Units.Find(Selected->Subject);
    if(!Subject||!Subject->Track.HasAppeared(At)||At>=Subject->DisplayUntil)return Establish(At,Aspect);
    const FTransform Pose=Subject->Track.Points.IsEmpty()?FTransform(FRotator(0,Subject->Yaw,0),Subject->Position):Subject->Track.Sample(At);
    FView View;View.Shot=Selected->Type;View.Target=Pose.GetLocation()+FVector(0,0,1200);
    double Heading=Pose.Rotator().Yaw;
    if(const auto* Other=Units.Find(Selected->Other))
    {
        const FVector Position=Other->Track.Points.IsEmpty()?Other->Position:Other->Track.Sample(At).GetLocation();
        if((Position-Pose.GetLocation()).SizeSquared2D()>1.)Heading=(Position-Pose.GetLocation()).Rotation().Yaw;
    }
    // Keep the same side of the action for a given fleet. The camera follows
    // actual hull positions; it never fabricates a projectile or a hit.
    View.Yaw=FRotator::NormalizeAxis(Heading+(Subject->Side==TEXT("B")?55.:-55.));
    View.Tilt=View.Shot==TEXT("sink")?65.:58.;
    View.Distance=(View.Shot==TEXT("sink")?80000.:105000.)/FMath::Min(1.,FMath::Max(.35,Aspect));
    return View;
}

bool FWNTBattleCameraDirector::NeedsCut(const FView& Current,const FView& Desired)
{
    // Carrier groups can be hundreds of km apart. Descending to an impact
    // close-up while easing across that distance shows only intervening sea.
    // Edit directly to remote action; nearby tracking and wide reveals ease.
    return Desired.Shot!=TEXT("establish")&&FVector::DistSquared(Current.Target,Desired.Target)>
        FMath::Square(FMath::Max(500000.,Desired.Distance*8.));
}

FWNTBattleCameraDirector::FView FWNTBattleCameraDirector::Ease(const FView& Current,const FView& Desired,double DeltaSeconds)
{
    FView View=Current;if(!FMath::IsFinite(DeltaSeconds)||DeltaSeconds<=0)return View;
    const double Alpha=1.-FMath::Exp(-3.2*FMath::Min(DeltaSeconds,.1));
    View.Target=FMath::Lerp(Current.Target,Desired.Target,Alpha);
    View.Distance=FMath::Exp(FMath::Lerp(FMath::Loge(FMath::Max(1.,Current.Distance)),FMath::Loge(FMath::Max(1.,Desired.Distance)),Alpha));
    View.Tilt=FMath::Lerp(Current.Tilt,Desired.Tilt,Alpha);
    View.Yaw=FRotator::NormalizeAxis(Current.Yaw+FMath::FindDeltaAngleDegrees(Current.Yaw,Desired.Yaw)*Alpha);
    View.Shot=Desired.Shot;return View;
}
