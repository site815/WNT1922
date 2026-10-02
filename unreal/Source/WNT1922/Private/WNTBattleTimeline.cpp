#include "WNTBattleTimeline.h"
#include "Dom/JsonObject.h"

void FWNTBattleTrack::Read(const TSharedPtr<FJsonObject>& Unit,double Duration)
{
    Points.Reset();AppearsAt=0;LostAt=-1;if(!Unit)return;
    double Number;
    if(Unit->TryGetNumberField(TEXT("appearsAt"),Number)&&FMath::IsFinite(Number))AppearsAt=FMath::Clamp(Number,0.,Duration);
    if(Unit->TryGetNumberField(TEXT("lostAtSeconds"),Number)&&FMath::IsFinite(Number)&&Number>=0)LostAt=FMath::Clamp(Number,AppearsAt,Duration);
    const TArray<TSharedPtr<FJsonValue>>* Values=nullptr;
    if(!Unit->TryGetArrayField(TEXT("trajectory"),Values))return;
    for(const auto& Value:*Values)
    {
        if(Points.Num()>=128)break;
        const auto Point=Value->AsObject();if(!Point)continue;
        FPoint P;const TArray<TSharedPtr<FJsonValue>>* XYZ=nullptr;
        if(!Point->TryGetNumberField(TEXT("time"),P.At)||!FMath::IsFinite(P.At)||P.At<0||P.At>Duration
            ||(!Points.IsEmpty()&&P.At<=Points.Last().At)||!Point->TryGetArrayField(TEXT("positionMetres"),XYZ)||XYZ->Num()!=3)continue;
        bool Valid=true;for(int32 Axis=0;Axis<3;++Axis){double Coordinate;if(!(*XYZ)[Axis]->TryGetNumber(Coordinate)||!FMath::IsFinite(Coordinate)||FMath::Abs(Coordinate)>1e7){Valid=false;break;}P.Position[Axis]=Coordinate*100.;}
        if(!Valid)continue;
        if(!Point->TryGetNumberField(TEXT("headingDegrees"),P.Yaw)||!FMath::IsFinite(P.Yaw))P.Yaw=0;
        Point->TryGetBoolField(TEXT("cut"),P.bCut);Points.Add(P);
    }
}

FTransform FWNTBattleTrack::Sample(double Elapsed) const
{
    if(Points.IsEmpty())return FTransform::Identity;
    // Once the recorded loss begins its hull lists in place; it cannot sail on
    // under the water or inherit a later formation's motion.
    if(LostAt>=0)Elapsed=FMath::Min(Elapsed,LostAt);
    const FPoint* A=&Points[0];const FPoint* B=A;
    for(int32 Index=1;Index<Points.Num();++Index){B=&Points[Index];if(Elapsed<B->At)break;A=B;}
    const double Alpha=A==B||B->bCut||B->At<=A->At?0.:FMath::Clamp((Elapsed-A->At)/(B->At-A->At),0.,1.);
    return FTransform(FRotator(0,A->Yaw+FMath::FindDeltaAngleDegrees(A->Yaw,B->Yaw)*Alpha,0),FMath::Lerp(A->Position,B->Position,Alpha));
}
