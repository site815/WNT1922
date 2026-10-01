#pragma once

#include "CoreMinimal.h"

class AActor;
class AWNTShipActor;
class FJsonObject;
class UInstancedStaticMeshComponent;

/** Observed battle presentation only. No combat decisions or campaign RNG. */
class WNT1922_API FWNTBattleEffects
{
public:
    static constexpr int32 MaxEvents = 256;
    static constexpr int32 PoolSize = 48;
    /** Same frame/selection packets never restart the presentation clock. */
    bool SetPacket(const TSharedPtr<FJsonObject>& Packet, double Now);
    void Update(AActor* Owner, const TMap<FString,FTransform>& Ships, double Now, bool bVisible,
        const TMap<FString,TWeakObjectPtr<AWNTShipActor>>* Actors = nullptr);
    void SetVisible(bool bVisible);
    double SinkProgress(const FString& Key, double Now) const;
    bool IsAnimating(double Now) const;
    static FTransform SinkingTransform(const FTransform& Surface, double Progress);
    static double ReadableDiameter(double BaseCentimetres, double MinimumPixels, double MaximumCentimetres,
        double CameraDepth, double HorizontalFOV, int32 ViewportWidth);
    int32 EventCount() const { return Events.Num(); }
    int32 ComponentCount() const;
    const FString& GetFrameKey() const { return FrameKey; }

private:
    struct FEvent { FString Key, Type, Source, Target, Weapon; double At=0, Duration=1; };
    TArray<FEvent> Events;
    TMap<FString,FVector2D> SinkTimes;
    TWeakObjectPtr<UInstancedStaticMeshComponent> Pools[4];
    TArray<FTransform> Transforms[4];
    int32 LastCount[4] = {0,0,0,0};
    FString FrameKey;
    double StartedAt = 0, Duration = 15;
    bool bAnimate = false;
    void EnsurePools(AActor* Owner);
};
