#pragma once
#include "CoreMinimal.h"
#include "WNTBattleTimeline.h"
class AActor;
class FJsonObject;
class UInstancedStaticMeshComponent;

/** Bounded representative aircraft geometry following recorded aggregate wing tracks. */
class WNT1922_API FWNTBattleAircraft
{
public:
    static constexpr int32 MaxAircraft=96;
    static constexpr int32 SlotsPerPool=32;
    void SetPacket(const TSharedPtr<FJsonObject>& Packet,const FString& DataRoot);
    void Update(AActor* Owner,double Elapsed,bool bVisible);
    void SetVisible(bool bVisible);
    int32 VisibleCount() const { return Drawn; }
    int32 AttackRunCount() const { return Runs.Num(); }
    int32 LoadedPoolCount() const;
    static FVector FormationOffset(int32 Index,bool bEscort);
    static int32 RepresentativeCount(int32 Actual,bool bEscort) { return FMath::Clamp(Actual,0,bEscort?6:18); }
private:
    struct FCount { double At=0; int32 Planes=0,Fighters=0; };
    struct FWing { FString Key,Side,Role; FWNTBattleTrack Track; TArray<FCount> Counts; int32 Planes=0,Fighters=0; };
    struct FRun { FString Wing,Side,Role; double At=0,Yaw=0; FVector Target=FVector::ZeroVector; int32 Planes=0,Lost=0; };
    TArray<FWing> Wings;
    TArray<FRun> Runs;
    TWeakObjectPtr<UInstancedStaticMeshComponent> Pools[6];
    TArray<FTransform> Transforms[6];
    int32 PreviousCount[6]={0,0,0,0,0,0};
    int32 Drawn=0,NextPool=0;
    FString DataDirectory;
    void WarmOnePool(AActor* Owner);
};
