#pragma once
#include "CoreMinimal.h"
#include "WNTBattleTimeline.h"
class FJsonObject;

/** Presentation-only camera planning from the same recorded tracks and events
 * as the ship/effect renderer. It never advances or changes combat state. */
struct WNT1922_API FWNTBattleCameraDirector
{
    struct FView
    {
        FVector Target=FVector::ZeroVector;
        double Distance=600000, Tilt=48, Yaw=-25;
        FString Shot=TEXT("establish");
    };
    void SetPacket(const TSharedPtr<FJsonObject>& Packet,double Now);
    void SetEnabled(bool Value) { bEnabled=Value&&bAvailable; }
    bool IsAvailable() const { return bAvailable; }
    bool IsEnabled() const { return bEnabled&&bAvailable; }
    bool IsPaused() const { return bPaused; }
    double Elapsed(double Now) const;
    TOptional<FView> Evaluate(double Now,double Aspect) const;
    int32 ShotCount() const { return Shots.Num(); }
    FString ActiveShot(double Now) const;
    static bool NeedsCut(const FView& Current,const FView& Desired);
    static FView Ease(const FView& Current,const FView& Desired,double DeltaSeconds);
private:
    struct FUnit { FString Key,Side; FWNTBattleTrack Track; FVector Position=FVector::ZeroVector; double Yaw=0,DisplayUntil=TNumericLimits<double>::Max(); };
    struct FShot { double At=0; FString Type,Subject,Other; };
    TMap<FString,FUnit> Units;
    TArray<FShot> Shots;
    FShot LiveShot{0,TEXT("establish"),TEXT(""),TEXT("")};
    FString BattleId,FrameKey;
    FString TacticalSession;
    double StartedAt=0,PausedElapsed=0,Duration=0;
    double NextLiveShotAt=0;
    double LiveShotStartedAt=0;
    FString LiveEventKey;
    bool bAvailable=false,bEnabled=false,bPaused=false;
    FWNTRollingBattleClock RollingClock;
    FView Establish(double At,double Aspect) const;
};
