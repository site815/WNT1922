#pragma once
#include "CoreMinimal.h"
class FJsonObject;

/** Bounded presentation tracks from retained battle observations, never combat decisions. */
struct WNT1922_API FWNTBattleTrack
{
    struct FPoint { double At=0; FVector Position=FVector::ZeroVector; double Yaw=0; bool bCut=false; };
    TArray<FPoint> Points;
    double AppearsAt=0, LostAt=-1, DisappearsAt=-1;
    void Read(const TSharedPtr<FJsonObject>& Unit, double Duration);
    FTransform Sample(double Elapsed) const;
    bool HasAppeared(double Elapsed) const { return Elapsed>=AppearsAt; }
    bool HasDeparted(double Elapsed) const { return DisappearsAt>=0&&Elapsed>=DisappearsAt; }
    bool IsLost(double Elapsed) const { return LostAt>=0&&Elapsed>=LostAt; }
};
