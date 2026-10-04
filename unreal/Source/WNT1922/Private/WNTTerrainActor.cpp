#include "WNTTerrainActor.h"
#include "WNTMapTileComponent.h"
#include "WNTProjection.h"
#include "WNTVisualAssets.h"
#include "ProceduralMeshComponent.h"
#include "Components/SceneComponent.h"
#include "Materials/Material.h"
#include "Dom/JsonObject.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "ConstrainedDelaunay2.h"
#include "Polygon2.h"
#include <cmath>

namespace
{
    constexpr double TileDegrees = 30.0;
    constexpr int32 TileColumns = 12, TileRows = 6;
    using FRing = TArray<FVector2D>;
    double Cross2(const FVector2D& A, const FVector2D& B) { return A.X * B.Y - A.Y * B.X; }
    FVector BarycentricXY(const FVector& P,const FVector& A,const FVector& B,const FVector& C);
    double RingCentre(const FRing& Ring)
    {
        double Sum = 0; for (const FVector2D& P : Ring) Sum += P.X;
        return Ring.IsEmpty() ? 0.0 : Sum / Ring.Num();
    }
    bool InRing(const FVector2D& Point, const FRing& Ring)
    {
        bool Inside = false;
        for (int32 I = 0, J = Ring.Num() - 1; I < Ring.Num(); J = I++)
        {
            const FVector2D& A = Ring[J]; const FVector2D& B = Ring[I];
            const double Cross = Cross2(Point - A, B - A);
            if (FMath::Abs(Cross) < 1e-10 && Point.X >= FMath::Min(A.X,B.X)-1e-10 && Point.X <= FMath::Max(A.X,B.X)+1e-10 &&
                Point.Y >= FMath::Min(A.Y,B.Y)-1e-10 && Point.Y <= FMath::Max(A.Y,B.Y)+1e-10) return true;
            if ((A.Y > Point.Y) != (B.Y > Point.Y) && Point.X < (B.X-A.X)*(Point.Y-A.Y)/(B.Y-A.Y)+A.X) Inside = !Inside;
        }
        return Inside;
    }
    FRing Clip(const FRing& Ring, int32 Axis, double Edge, bool Greater)
    {
        FRing Out; if (Ring.IsEmpty()) return Out;
        FVector2D A = Ring.Last(); bool AInside = Greater ? A[Axis] >= Edge : A[Axis] <= Edge;
        for (const FVector2D& B : Ring)
        {
            const bool BInside = Greater ? B[Axis] >= Edge : B[Axis] <= Edge;
            if (AInside != BInside)
            {
                FVector2D P = FMath::Lerp(A, B, (Edge-A[Axis])/(B[Axis]-A[Axis])); P[Axis] = Edge;
                Out.Add(P);
            }
            if (BInside) Out.Add(B);
            A = B; AInside = BInside;
        }
        return Out;
    }
    void AddFan(const FRing& Points, TArray<FWNTGeographicTriangle>& Out)
    {
        for (int32 I=1; I+1<Points.Num(); ++I)
            if (FMath::Abs(Cross2(Points[I]-Points[0],Points[I+1]-Points[0])) > 1e-13)
                Out.Add({Points[0],Points[I],Points[I+1]});
    }
    TArray<FRing> AlignRings(const TArray<FRing>& Input)
    {
        TArray<FRing> Rings;
        for (const FRing& Source : Input)
        {
            FRing Ring = WNTTerrainGeometry::UnwrapRing(Source);
            if (Ring.Num()<3) continue;
            if (!Rings.IsEmpty())
            {
                const double Shift = std::round((RingCentre(Rings[0])-RingCentre(Ring))/360.0)*360.0;
                for (FVector2D& P : Ring) P.X += Shift;
            }
            Rings.Add(MoveTemp(Ring));
        }
        return Rings;
    }
    void Tessellate(const FWNTGeographicTriangle& T, double Step, TArray<FWNTGeographicTriangle>& Out)
    {
        const FRing Triangle{T.A,T.B,T.C};
        const int32 FirstY=FMath::FloorToInt(FMath::Min3(T.A.Y,T.B.Y,T.C.Y)/Step), LastY=FMath::FloorToInt(FMath::Max3(T.A.Y,T.B.Y,T.C.Y)/Step);
        for(int32 Y=FirstY;Y<=LastY;++Y)
        {
            const FRing Strip=Clip(Clip(Triangle,1,Y*Step,true),1,(Y+1)*Step,false);
            if(Strip.Num()<3)continue;
            double MinX=Strip[0].X,MaxX=MinX;for(const FVector2D& P:Strip){MinX=FMath::Min(MinX,P.X);MaxX=FMath::Max(MaxX,P.X);}
            for(int32 X=FMath::FloorToInt(MinX/Step);X<=FMath::FloorToInt(MaxX/Step);++X)
                AddFan(Clip(Clip(Strip,0,X*Step,true),0,(X+1)*Step,false),Out);
        }
    }
    bool ReadJson(const FString& Path,TSharedPtr<FJsonObject>& Out,bool Markdown=false)
    {
        FString Text;if(!FFileHelper::LoadFileToString(Text,*Path))return false;
        if(Markdown)
        {
            const FString Fence=TEXT("```json game-data");const int32 Start=Text.Find(Fence);
            if(Start==INDEX_NONE)return false;
            const int32 Content=Start+Fence.Len(),End=Text.Find(TEXT("```"),ESearchCase::CaseSensitive,ESearchDir::FromStart,Content);
            if(End==INDEX_NONE)return false;Text=Text.Mid(Content,End-Content);
        }
        return FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text),Out)&&Out.IsValid();
    }
    FLinearColor OwnerColour(const FString& Owner)
    {
        static const FLinearColor Palette[]={FLinearColor(.37f,.52f,.41f),FLinearColor(.48f,.49f,.32f),FLinearColor(.35f,.46f,.49f),FLinearColor(.53f,.42f,.36f),FLinearColor(.46f,.44f,.53f),FLinearColor(.41f,.53f,.49f)};
        return Palette[GetTypeHash(Owner)%UE_ARRAY_COUNT(Palette)];
    }
    FString BoundaryKey(const FVector2D& A,const FVector2D& B)
    {
        auto Key=[](const FVector2D& P){return FIntPoint(FMath::RoundToInt(WNTProjection::WrapLongitude(P.X)*1e6),FMath::RoundToInt(P.Y*1e6));};
        FIntPoint First=Key(A),Last=Key(B);
        if(First.X>Last.X||(First.X==Last.X&&First.Y>Last.Y))Swap(First,Last);
        return FString::Printf(TEXT("%d,%d:%d,%d"),First.X,First.Y,Last.X,Last.Y);
    }
}

TArray<FVector2D> WNTTerrainGeometry::SplitSurfaceEdge(const FVector2D& A,const FVector2D& B,double Step)
{
    Step=FMath::Clamp(Step,.25,2.0);
    TArray<double> Cuts{0.0,1.0};
    for(int32 Axis=0;Axis<2;++Axis)
    {
        const double Delta=B[Axis]-A[Axis];if(FMath::Abs(Delta)<1e-12)continue;
        const int32 First=FMath::FloorToInt(FMath::Min(A[Axis],B[Axis])/Step)+1;
        const int32 Last=FMath::CeilToInt(FMath::Max(A[Axis],B[Axis])/Step)-1;
        for(int32 Grid=First;Grid<=Last;++Grid)
        {
            const double T=(Grid*Step-A[Axis])/Delta;
            if(T>1e-10&&T<1-1e-10)Cuts.Add(T);
        }
    }
    Cuts.Sort();TArray<FVector2D> Points;
    double Previous=-1;
    for(double T:Cuts)if(T-Previous>1e-10){Points.Add(FMath::Lerp(A,B,T));Previous=T;}
    return Points;
}

TArray<FWNTGeographicTriangle> WNTTerrainGeometry::SubdivideSurface(const FWNTGeographicTriangle& Triangle,double Step)
{
    TArray<FWNTGeographicTriangle> Out;Tessellate(Triangle,Step,Out);return Out;
}

TArray<TPair<FVector2D,FVector2D>> WNTTerrainGeometry::CampaignFrontSegments(const TArray<TArray<FVector2D>>& Source,
    const FVector2D& From,const FVector2D& To,double Progress)
{
    TArray<TPair<FVector2D,FVector2D>> Result;
    if(!FMath::IsFinite(Progress)||Progress<=0||Progress>=1||!FMath::IsFinite(From.X)||!FMath::IsFinite(From.Y)
        ||!FMath::IsFinite(To.X)||!FMath::IsFinite(To.Y))return Result;
    const auto Rings=AlignRings(Source);if(Rings.IsEmpty())return Result;
    const FVector2D Delta(WNTProjection::WrapLongitude(To.X-From.X),To.Y-From.Y);
    if(Delta.IsNearlyZero())return Result;
    const FVector2D Normal=Delta.GetSafeNormal(),Along(-Normal.Y,Normal.X);
    FVector2D Centre=From+Delta*Progress;
    Centre.X+=360.*std::round((RingCentre(Rings[0])-Centre.X)/360.);
    TArray<double> Cuts;
    for(const auto& Ring:Rings)for(int32 I=0;I<Ring.Num();++I)
    {
        const FVector2D A=Ring[I],B=Ring[(I+1)%Ring.Num()];
        const double DA=FVector2D::DotProduct(A-Centre,Normal),DB=FVector2D::DotProduct(B-Centre,Normal);
        if(FMath::Abs(DA)<1e-9)Cuts.Add(FVector2D::DotProduct(A-Centre,Along));
        if((DA<0)!=(DB<0)&&FMath::Abs(DA-DB)>1e-12)
            Cuts.Add(FVector2D::DotProduct(FMath::Lerp(A,B,DA/(DA-DB))-Centre,Along));
    }
    Cuts.Sort();TArray<double> Unique;
    for(double Cut:Cuts)if(Unique.IsEmpty()||Cut-Unique.Last()>1e-8)Unique.Add(Cut);
    for(int32 I=0;I+1<Unique.Num();++I)
    {
        const FVector2D Mid=Centre+Along*((Unique[I]+Unique[I+1])*.5);
        bool Land=InRing(Mid,Rings[0]);
        for(int32 H=1;H<Rings.Num()&&Land;++H)if(InRing(Mid,Rings[H]))Land=false;
        if(Land)Result.Emplace(Centre+Along*Unique[I],Centre+Along*Unique[I+1]);
    }
    return Result;
}

TArray<FVector2D> WNTTerrainGeometry::UnwrapRing(const TArray<FVector2D>& Source)
{
    FRing Finite; int32 PoleCount=0; double PoleMin=180,PoleMax=-180;
    for(const FVector2D& P:Source)if(FMath::IsFinite(P.X)&&FMath::IsFinite(P.Y))
    {
        Finite.Add(FVector2D(P.X,FMath::Clamp(P.Y,-90.0,90.0)));
        if(FMath::Abs(P.Y)>89.9){++PoleCount;PoleMin=FMath::Min(PoleMin,P.X);PoleMax=FMath::Max(PoleMax,P.X);}
    }
    const bool ArtificialPole=PoleCount>1&&PoleMax-PoleMin>359.0;
    if(ArtificialPole)
    {
        // Preserve the source's explicit dateline-to-pole closure. Starting a
        // new cap at an arbitrary coastline vertex (Antarctica starts at the
        // peninsula) creates an artificial cut through the mainland and can
        // lose its interior south of South America. +/-180 are distinct edges
        // here; do not fold them together through longitude normalization.
        FRing Polar;
        for(FVector2D P:Finite)
        {
            if(FMath::Abs(P.Y)>89.9)P.Y=P.Y>0?90.0:-90.0;
            if(Polar.IsEmpty()||!P.Equals(Polar.Last(),1e-10))Polar.Add(P);
        }
        if(Polar.Num()>1&&Polar[0].Equals(Polar.Last(),1e-10))Polar.Pop();
        return Polar.Num()>=3?Polar:FRing();
    }
    FRing Out;
    for(const FVector2D& P:Finite)
    {
        FVector2D Q(WNTProjection::WrapLongitude(P.X),P.Y);
        if(!Out.IsEmpty())
        {
            while(Q.X-Out.Last().X>180)Q.X-=360;while(Q.X-Out.Last().X< -180)Q.X+=360;
            if(Q.Equals(Out.Last(),1e-10))continue;
        }
        Out.Add(Q);
    }
    if(Out.Num()>1&&Out[0].Equals(Out.Last(),1e-10))Out.Pop();
    if(Out.Num()<3)return {};
    if(FMath::Abs(Out.Last().X-Out[0].X)>180)
    {
        const double EndLongitude=Out[0].X+(Out.Last().X>Out[0].X?360.0:-360.0);
        if(FMath::Abs(Out.Last().X-EndLongitude)>1e-9)Out.Add(FVector2D(EndLongitude,Out[0].Y));
        double LatitudeSum=0;for(const FVector2D& P:Out)LatitudeSum+=P.Y;
        const double Pole=LatitudeSum>=0?90.0:-90.0;
        Out.Add(FVector2D(EndLongitude,Pole));Out.Add(FVector2D(Out[0].X,Pole));
    }
    return Out;
}

bool WNTTerrainGeometry::TriangulatePolygon(const TArray<TArray<FVector2D>>& Input,TArray<FWNTGeographicTriangle>& Out,FString& Error)
{
    const TArray<FRing> Rings=AlignRings(Input);if(Rings.IsEmpty()){Error=TEXT("Empty geographic polygon");return false;}
    UE::Geometry::TConstrainedDelaunay2<double> Triangulator;
    Triangulator.bOutputCCW=true;Triangulator.bSplitBowties=false;Triangulator.bOrientedEdges=false;
    for(int32 I=0;I<Rings.Num();++I)
    {
        UE::Geometry::TPolygon2<double> Polygon;
        for(const FVector2D& P:Rings[I])Polygon.AppendVertex(P);
        Triangulator.Add(Polygon,I>0);
    }
    auto KeepTriangle=[&](const TArray<FVector2d>& Vertices,const UE::Geometry::FIndex3i& T)
    {
        const FVector2D P=(Vertices[T.A]+Vertices[T.B]+Vertices[T.C])/3.0;
        if(!InRing(P,Rings[0]))return false;
        for(int32 I=1;I<Rings.Num();++I)if(InRing(P,Rings[I]))return false;
        return true;
    };
    bool Success=Triangulator.Triangulate(KeepTriangle);
    if(!Success)
    {
        // Historical overlays can cross themselves where an authored border meets
        // the base coastline. Split intersections before imposing the constraints;
        // never accept a partial triangulation or silently drop that territory.
        UE::Geometry::TGeneralPolygon2<double> Polygon;
        for(int32 I=0;I<Rings.Num();++I)
        {
            UE::Geometry::TPolygon2<double> Ring;
            for(const FVector2D& P:Rings[I])Ring.AppendVertex(P);
            if(I==0)Polygon.SetOuter(Ring);
            else
            {
                if(Ring.IsClockwise()==Polygon.GetOuter().IsClockwise())Ring.Reverse();
                Polygon.AddHole(Ring,false,false);
            }
        }
        Triangulator=UE::Geometry::TConstrainedDelaunay2<double>();
        Triangulator.bOutputCCW=true;Triangulator.bOrientedEdges=false;
        Success=Triangulator.AddWithIntersectionResolution(Polygon)&&Triangulator.Triangulate(KeepTriangle);
    }
    if(!Success){Error=TEXT("Constrained geographic polygon triangulation failed");return false;}
    for(const UE::Geometry::FIndex3i& T:Triangulator.Triangles)Out.Add({Triangulator.Vertices[T.A],Triangulator.Vertices[T.B],Triangulator.Vertices[T.C]});
    Error.Reset();return true;
}

TArray<FWNTGeographicTriangle> WNTTerrainGeometry::ClipAtMeridian(const FWNTGeographicTriangle& T,double Meridian)
{
    TArray<FWNTGeographicTriangle> Out;
    const double Centre=(T.A.X+T.B.X+T.C.X)/3.0-Meridian;
    const double Shift=-360.0*std::floor((Centre+180.0)/360.0);
    const double Offset=-Meridian+Shift;
    const double Min=FMath::Min3(T.A.X,T.B.X,T.C.X)+Offset,Max=FMath::Max3(T.A.X,T.B.X,T.C.X)+Offset;
    if(Min>=-180&&Max<=180)
    {
        Out.Add({FVector2D(T.A.X+Offset,T.A.Y),FVector2D(T.B.X+Offset,T.B.Y),FVector2D(T.C.X+Offset,T.C.Y)});
        return Out;
    }
    for(int32 Copy=-1;Copy<=1;++Copy)
    {
        const double CopyOffset=Offset+Copy*360.0;
        FRing Points{FVector2D(T.A.X+CopyOffset,T.A.Y),FVector2D(T.B.X+CopyOffset,T.B.Y),FVector2D(T.C.X+CopyOffset,T.C.Y)};
        if(FMath::Max3(Points[0].X,Points[1].X,Points[2].X)<-180||FMath::Min3(Points[0].X,Points[1].X,Points[2].X)>180)continue;
        AddFan(Clip(Clip(Points,0,-180,true),0,180,false),Out);
    }
    return Out;
}

struct FWNTTerrainData
{
    struct FPolygon{FString Id,Owner;FLinearColor Colour;TArray<FRing> Rings;FBox2D Bounds{ForceInit};};
    struct FTriangle{FWNTGeographicTriangle Geo;int32 Polygon=0;};
    struct FEdge{FVector2D A,B;int32 Polygon=0;bool bCoast=true;int32 OtherPolygon=INDEX_NONE;bool bFirstShared=true;};
    struct FHeightFace{FWNTGeographicTriangle Geo;FVector A,B,C;};
    struct FOccupation{FVector2D From,To;double Progress=0;FLinearColor Attacker,Restored;bool HasRestored=false;};
    TArray<FHeightFace> HeightFaces;
    uint64 HeightQueries=0,HeightCacheHits=0;
    FWNTElevationGrid Elevation;
    TArray<FPolygon> Polygons;
    TArray<FTriangle> Triangles;
    TArray<FEdge> Edges;
    TArray<TArray<int32>> Bins;
    TArray<TArray<int32>> TriangleBins;
    TMap<FString,FLinearColor> Control,OwnerColours;
    TMap<FString,FOccupation> Occupations;
    FString OccupationSignature;
    uint64 OccupationUpdates=0;
    TArray<TSharedPtr<FJsonValue>> Fronts;
    FString FrontSignature;
    TArray<TArray<int32>> TileLandPolygons;
    TArray<TSet<FString>> TileTerritories;
    int32 CountryBorderSegments=0,CoastlineSegments=0,CampaignFrontSegments=0;
    const TArray<int32>& TrianglesAt(FVector2D P)const
    {
        static const TArray<int32> Empty;
        if(TriangleBins.Num()!=64800)return Empty;
        const int32 X=FMath::Clamp(FMath::FloorToInt(WNTProjection::WrapLongitude(P.X)+180),0,359);
        const int32 Y=FMath::Clamp(FMath::FloorToInt(P.Y+90),0,179);
        return TriangleBins[Y*360+X];
    }
    int32 PolygonAt(FVector2D P)const
    {
        if(!FMath::IsFinite(P.X)||!FMath::IsFinite(P.Y)||P.Y< -90||P.Y>90||Bins.Num()!=648)return INDEX_NONE;
        P.X=WNTProjection::WrapLongitude(P.X);
        const int32 X=FMath::Clamp(FMath::FloorToInt((P.X+180)/10),0,35),Y=FMath::Clamp(FMath::FloorToInt((P.Y+90)/10),0,17);
        for(const int32 I:Bins[Y*36+X])
        {
            const FPolygon& Poly=Polygons[I];FVector2D Q=P;
            Q.X+=std::round((Poly.Bounds.GetCenter().X-Q.X)/360.0)*360.0;
            if(!Poly.Bounds.IsInsideOrOn(Q)||!InRing(Q,Poly.Rings[0]))continue;
            bool Hole=false;for(int32 H=1;H<Poly.Rings.Num();++H)if(InRing(Q,Poly.Rings[H])){Hole=true;break;}
            if(!Hole)return I;
        }
        return INDEX_NONE;
    }
};

void FWNTTerrainDataDeleter::operator()(FWNTTerrainData* Pointer) const { delete Pointer; }

AWNTTerrainActor::AWNTTerrainActor()
{
    PrimaryActorTick.bCanEverTick=false;
    RootComponent=CreateDefaultSubobject<USceneComponent>(TEXT("TerrainRoot"));
    Data.Reset(new FWNTTerrainData());
}
AWNTTerrainActor::~AWNTTerrainActor()=default;

bool AWNTTerrainActor::Initialize(const FString& DataRoot)
{
    for(UProceduralMeshComponent* Tile:TerrainTiles)if(Tile)Tile->ClearAllMeshSections();
    Data.Reset(new FWNTTerrainData());LoadError.Reset();
    if(CampaignId!=TEXT("1922")&&CampaignId!=TEXT("1936hindsight")){LoadError=TEXT("Unknown terrain campaign");return false;}
    if(!Data->Elevation.Load(FPaths::Combine(DataRoot,TEXT("assets/terrain/elevation.bin")),FPaths::Combine(DataRoot,TEXT("assets/terrain/elevation.json")),LoadError))return false;
    TSharedPtr<FJsonObject> Geography,Campaign;
    if(!ReadJson(FPaths::Combine(DataRoot,TEXT("assets/maps/geometry.json")),Geography)||
       !ReadJson(FPaths::Combine(DataRoot,TEXT("catalog"),CampaignId,TEXT("map.md")),Campaign,true))
    {LoadError=TEXT("Cannot read geographic geometry or campaign map");return false;}
    const TSharedPtr<FJsonObject>* Geometries=nullptr;const TArray<TSharedPtr<FJsonValue>>* Features=nullptr;
    if(!Geography->TryGetObjectField(TEXT("geometry"),Geometries)||!Campaign->TryGetArrayField(TEXT("features"),Features))
    {LoadError=TEXT("Invalid geographic catalog schema");return false;}
    TSharedPtr<FJsonObject> Nations;
    if(ReadJson(FPaths::Combine(DataRoot,TEXT("catalog/common/nations.md")),Nations,true))for(const auto& Pair:Nations->Values)
    {
        const TSharedPtr<FJsonObject>* Profile=nullptr;FString Hex;
        // The document also contains the designs array, not a national profile.
        if(Pair.Value.IsValid()&&Pair.Value->TryGetObject(Profile)&&Profile&&(*Profile)->TryGetStringField(TEXT("color"),Hex))
            Data->OwnerColours.Add(FString(*Pair.Key),FLinearColor(FColor::FromHex(Hex)));
    }
    const double Step=FMath::Clamp(SurfaceSampleDegrees,0.25,2.0);
    for(const TSharedPtr<FJsonValue>& FeatureValue:*Features)
    {
        const TSharedPtr<FJsonObject> Feature=FeatureValue->AsObject();if(!Feature.IsValid())continue;
        FString Id,GeometryId,TerritoryOwner;
        if(!Feature->TryGetStringField(TEXT("id"),Id)||!Feature->TryGetStringField(TEXT("geometry"),GeometryId))continue;
        Feature->TryGetStringField(TEXT("owner"),TerritoryOwner);
        const TSharedPtr<FJsonObject>* Geometry=nullptr;
        if(!(*Geometries)->TryGetObjectField(GeometryId,Geometry)){LoadError=TEXT("Missing geographic feature: ")+GeometryId;return false;}
        FString Type;const TArray<TSharedPtr<FJsonValue>>* Coordinates=nullptr;
        if(!(*Geometry)->TryGetStringField(TEXT("type"),Type)||!(*Geometry)->TryGetArrayField(TEXT("coordinates"),Coordinates))continue;
        TArray<TArray<TSharedPtr<FJsonValue>>> SourcePolygons;
        if(Type==TEXT("Polygon"))SourcePolygons.Add(*Coordinates);
        else if(Type==TEXT("MultiPolygon"))for(const auto& P:*Coordinates)SourcePolygons.Add(P->AsArray());
        for(const auto& SourceRings:SourcePolygons)
        {
            TArray<FRing> Rings;
            for(const auto& RingValue:SourceRings)
            {
                FRing Ring;for(const auto& PointValue:RingValue->AsArray())
                {const auto& Pair=PointValue->AsArray();if(Pair.Num()>=2)Ring.Add(FVector2D(Pair[0]->AsNumber(),Pair[1]->AsNumber()));}
                Rings.Add(MoveTemp(Ring));
            }
            TArray<FWNTGeographicTriangle> Coarse;
            if(!WNTTerrainGeometry::TriangulatePolygon(Rings,Coarse,LoadError)){LoadError+=TEXT(" in ")+Id;return false;}
            FWNTTerrainData::FPolygon Polygon;Polygon.Id=Id;Polygon.Owner=TerritoryOwner;Polygon.Colour=Data->OwnerColours.Contains(TerritoryOwner)?Data->OwnerColours[TerritoryOwner]:OwnerColour(TerritoryOwner);Polygon.Rings=AlignRings(Rings);
            if(Polygon.Rings.IsEmpty())continue;for(const FVector2D& P:Polygon.Rings[0])Polygon.Bounds+=P;
            const int32 PolygonIndex=Data->Polygons.Add(MoveTemp(Polygon));
            TArray<FWNTGeographicTriangle> Fine;for(const auto& T:Coarse)Tessellate(T,Step,Fine);
            for(const auto& T:Fine)Data->Triangles.Add({T,PolygonIndex});
            for(const FRing& Ring:Data->Polygons[PolygonIndex].Rings)for(int32 I=0;I<Ring.Num();++I)
            {
                const FVector2D A=Ring[I],B=Ring[(I+1)%Ring.Num()];
                const TArray<FVector2D> Points=WNTTerrainGeometry::SplitSurfaceEdge(A,B,Step);
                for(int32 J=0;J+1<Points.Num();++J)Data->Edges.Add({Points[J],Points[J+1],PolygonIndex});
            }
        }
    }
    // Political borders are internal terrain edges, not cliffs to sea level.
    // Once both units use the same source chain, suppress both copies of its
    // skirt. Real coast skirts use the land grid above, so their top boundary
    // cannot interpolate above/below the adjacent tessellated land face.
    TMap<FString,int32> FirstBoundary;
    for(int32 I=0;I<Data->Edges.Num();++I)
    {
        auto& Edge=Data->Edges[I];const FString Key=BoundaryKey(Edge.A,Edge.B);
        if(const int32* Previous=FirstBoundary.Find(Key))
        {
            if(Data->Edges[*Previous].Polygon!=Edge.Polygon)
            {
                auto& First=Data->Edges[*Previous];Edge.bCoast=false;First.bCoast=false;
                Edge.OtherPolygon=First.Polygon;First.OtherPolygon=Edge.Polygon;Edge.bFirstShared=false;
            }
        }
        else FirstBoundary.Add(Key,I);
    }
    Data->Bins.SetNum(648);
    for(int32 I=0;I<Data->Polygons.Num();++I)
    {
        const FBox2D& B=Data->Polygons[I].Bounds;
        for(int32 Y=0;Y<18;++Y)if(-90+(Y+1)*10>=B.Min.Y&&-90+Y*10<=B.Max.Y)
            for(int32 X=0;X<36;++X)
            {
                const double Mid=-175.0+X*10.0,Aligned=Mid+360.0*std::round((B.GetCenter().X-Mid)/360.0);
                if(Aligned+5>=B.Min.X&&Aligned-5<=B.Max.X)Data->Bins[Y*36+X].Add(I);
            }
    }
    Data->TriangleBins.SetNum(64800);
    for(int32 I=0;I<Data->Triangles.Num();++I)
    {
        const auto& T=Data->Triangles[I].Geo;
        const int32 X0=FMath::FloorToInt(FMath::Min3(T.A.X,T.B.X,T.C.X)+180),X1=FMath::FloorToInt(FMath::Max3(T.A.X,T.B.X,T.C.X)+180);
        const int32 Y0=FMath::Clamp(FMath::FloorToInt(FMath::Min3(T.A.Y,T.B.Y,T.C.Y)+90),0,179),Y1=FMath::Clamp(FMath::FloorToInt(FMath::Max3(T.A.Y,T.B.Y,T.C.Y)+90),0,179);
        for(int32 Y=Y0;Y<=Y1;++Y)for(int32 X=X0;X<=X1;++X)Data->TriangleBins[Y*360+((X%360+360)%360)].Add(I);
    }
    if(Data->Triangles.IsEmpty()){LoadError=TEXT("No terrain triangles were generated");return false;}
    if(!TerrainMaterial)TerrainMaterial=WNTVisualAssets::LoadTerrainMaterial(DataRoot);
    if(!TerrainMaterial){LoadError=TEXT("Cannot load the native geometric terrain material.");return false;}
    if(!LineMaterial)LineMaterial=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_Graticule.M_Graticule"));
    if(!LineMaterial){LoadError=TEXT("Cannot load the filtered geographic grid material.");return false;}
    if(!BorderMaterial)BorderMaterial=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_MapBorder.M_MapBorder"));
    if(!FrontMaterial)FrontMaterial=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_CampaignFront.M_CampaignFront"));
    if(!BorderMaterial||!FrontMaterial){LoadError=TEXT("Cannot load geographic border/front materials.");return false;}
    RebuildProjectedMeshes();return true;
}

FVector WNTTerrainGeometry::WrappedTileOrigin(const FVector& GeographicOrigin, double Meridian, int32 Copy)
{
    const auto Geo=WNTProjection::Inverse(GeographicOrigin);
    if(!Geo.IsSet())return GeographicOrigin;
    return WNTProjection::ForwardUnwrapped(FVector2D(WNTProjection::WrapLongitude(Geo->X-Meridian)+360.0*Copy,Geo->Y),GeographicOrigin.Z/100.0);
}
double WNTTerrainGeometry::TileLongitudeShift(const FVector& GeographicOrigin,double Meridian,int32 Copy)
{
    const auto Geo=WNTProjection::Inverse(GeographicOrigin);if(!Geo.IsSet())return 0;
    return WNTProjection::WrapLongitude(Geo->X-Meridian)+360.0*Copy-Geo->X;
}
FBox WNTTerrainGeometry::ShearedLocalBounds(const FBox& LocalBounds,const FVector2D& ShearLimits,double LongitudeShift)
{
    if(!LocalBounds.IsValid)return LocalBounds;
    FBox Bounds=LocalBounds;
    Bounds.Min.Y+=FMath::Min(ShearLimits.X*LongitudeShift,ShearLimits.Y*LongitudeShift);
    Bounds.Max.Y+=FMath::Max(ShearLimits.X*LongitudeShift,ShearLimits.Y*LongitudeShift);
    return Bounds.ExpandBy(FVector(500,500,1000000));
}

FLinearColor WNTTerrainGeometry::TerrainColour(const FVector2D& LongitudeLatitude,double HeightMetres,const FLinearColor& PoliticalTint)
{
    const double Latitude=FMath::Clamp(LongitudeLatitude.Y,-90.0,90.0),AbsoluteLatitude=FMath::Abs(Latitude);
    const double Longitude=WNTProjection::WrapLongitude(LongitudeLatitude.X),Height=FMath::Max(0.0,HeightMetres);
    auto Blend=[](const FLinearColor& A,const FLinearColor& B,double T){return FMath::Lerp(A,B,float(FMath::Clamp(T,0.0,1.0)));};
    // These are intentionally broad illustrative climate regions, not claimed
    // land-cover data. Elevation is the unchanged actual local NOAA sample.
    const FLinearColor Meadow(.235f,.295f,.165f),Forest(.125f,.205f,.135f),Dry(.43f,.355f,.22f);
    const FLinearColor Rock(.32f,.315f,.285f),Snow(.69f,.735f,.74f);
    FLinearColor Base=Blend(Forest,Meadow,FMath::Clamp(AbsoluteLatitude/42.0,0.0,1.0));
    auto Region=[&](double Lon,double Lat,double LonRadius,double LatRadius)
    {
        const double X=WNTProjection::WrapLongitude(Longitude-Lon)/LonRadius,Y=(Latitude-Lat)/LatRadius;
        return FMath::Exp(-(X*X+Y*Y)*2.0);
    };
    const double Dryness=FMath::Max(FMath::Max(Region(22,25,55,16),Region(48,26,24,16)),FMath::Max(Region(134,-26,32,20),Region(-112,30,25,17)));
    Base=Blend(Base,Dry,Dryness*.88);
    Base=Blend(Base,Forest,FMath::Clamp((AbsoluteLatitude-48.0)/12.0,0.0,1.0)*.55);
    Base=Blend(Base,Rock,FMath::Clamp((Height-850.0)/2300.0,0.0,1.0)*.8);
    const double SnowLine=FMath::Clamp(4700.0-AbsoluteLatitude*48.0,700.0,4700.0);
    const double SnowAmount=FMath::Max(FMath::Clamp((Height-SnowLine)/900.0,0.0,1.0),FMath::Clamp((AbsoluteLatitude-68.0)/13.0,0.0,1.0));
    Base=Blend(Base,Snow,SnowAmount);
    // A readable political chart preserves biome/elevation structure while
    // giving neighboring governments distinct, subdued territorial colors.
    // Snow keeps a little more physical shading than temperate lowlands.
    const double PoliticalWeight=FMath::Lerp(.42,.24,SnowAmount);
    Base=Blend(Base,PoliticalTint.GetClamped(),PoliticalWeight);
    Base.A=1.0f;return Base;
}

double WNTTerrainGeometry::GraticuleWidthForPixelSize(double CentimetresPerPixel)
{
    if(!FMath::IsFinite(CentimetresPerPixel)||CentimetresPerPixel<=0)return 96000.0;
    const double Metres=FMath::Clamp(CentimetresPerPixel*.04,400.0,256000.0);
    // Four-pixel support leaves room for derivative-based edge filtering.
    // Half-octave geometry changes do not change the visible shader line width.
    return FMath::Clamp(FMath::Pow(2.0,FMath::CeilToDouble(FMath::Log2(Metres)*2.0)*.5),400.0,256000.0);
}

FVector WNTTerrainGeometry::RibbonDisplacement(const FVector2D& Extrusion,const FVector2D& Metadata,double WidthMetres,double Shift)
{
    const FVector2D Delta=Extrusion*(WidthMetres*100.-10000.);
    return FVector(Delta.X,Delta.Y+Shift*(Metadata.X+Metadata.Y*Extrusion.X*WidthMetres*100.),0);
}
double WNTTerrainGeometry::ReliefScaleForDistance(double Centimetres)
{
    if(!FMath::IsFinite(Centimetres))return 1.;
    const double T=FMath::Clamp((Centimetres-10000000.)/90000000.,0.,1.);
    return 1.+5.*T*T*(3.-2.*T);
}
bool WNTTerrainGeometry::BehindCampaignFront(const FVector2D& Point,const FVector2D& From,const FVector2D& To,double Progress)
{
    if(!FMath::IsFinite(Progress)||Point.ContainsNaN()||From.ContainsNaN()||To.ContainsNaN())return false;
    if(Progress<=0)return false;if(Progress>=1)return true;
    const FVector2D Direction(WNTProjection::WrapLongitude(To.X-From.X),To.Y-From.Y);
    if(Direction.SizeSquared()<1e-12)return false;
    const FVector2D Relative(WNTProjection::WrapLongitude(Point.X-From.X),Point.Y-From.Y);
    return FVector2D::DotProduct(Relative-Direction*Progress,Direction)<=0;
}
void AWNTTerrainActor::SetViewDistance(double Centimetres)
{
    const double Next=WNTTerrainGeometry::ReliefScaleForDistance(Centimetres);
    if(FMath::IsNearlyEqual(Next,ReliefScale,1e-9))return;
    ReliefScale=Next;
    for(auto Tile:TerrainTiles)if(Tile)Tile->SetCustomPrimitiveDataFloat(2,float(ReliefScale));
}

void AWNTTerrainActor::SetCentralMeridian(double Degrees)
{
    const double Next=WNTProjection::WrapLongitude(Degrees);
    if(FMath::Abs(WNTProjection::WrapLongitude(Next-CentralMeridian))<1e-9)return;
    CentralMeridian=Next;
    if(Data)Data->HeightFaces.Reset();
    const int32 TilesPerCopy=TerrainTiles.Num()/3;
    for(int32 I=0;I<TerrainTiles.Num();++I)UpdateTilePlacement(I,I/TilesPerCopy-1);
}
void AWNTTerrainActor::UpdateTilePlacement(int32 Index,int32 Copy)
{
    if(!TerrainTiles.IsValidIndex(Index)||!TerrainTiles[Index]||!TileOrigins.IsValidIndex(Index))return;
    UProceduralMeshComponent* Mesh=TerrainTiles[Index];
    const FVector2D Geo=TileOriginGeography[Index];
    const double Shift=WNTProjection::WrapLongitude(Geo.X-CentralMeridian)+360.*Copy-Geo.X;
    Mesh->SetCustomPrimitiveDataFloat(0,static_cast<float>(Shift));
    Mesh->SetCustomPrimitiveDataFloat(1,float(GridWidthMetres*100.));
    Mesh->SetCustomPrimitiveDataFloat(2,float(ReliefScale));
    if(TileLocalBounds.IsValidIndex(Index)&&TileLocalBounds[Index].IsValid&&TileShearLimits.IsValidIndex(Index))
    {
        FBox Bound=WNTTerrainGeometry::ShearedLocalBounds(TileLocalBounds[Index],TileShearLimits[Index],Shift)
            .ExpandBy(FVector(GridWidthMetres*125.,GridWidthMetres*125.*(1.+.014*FMath::Abs(Shift)),0));
        Bound.Max.Z=FMath::Max(Bound.Max.Z,TileLocalBounds[Index].Max.Z*6.+10000.);
        const FVector Extent=Bound.Min.GetAbs().ComponentMax(Bound.Max.GetAbs());
        if(auto* Tile=Cast<UWNTMapTileComponent>(Mesh))Tile->SetGeographicHalfExtent(Extent);
    }
    Mesh->SetRelativeLocation(TileOrigins[Index]+FVector(0,Shift*WNTProjection::EastUnitsPerDegree(Geo.Y),0));
}
double AWNTTerrainActor::HeightAt(const FVector2D& P)const{return Data?Data->Elevation.SampleMetres(P):0.0;}
bool AWNTTerrainActor::IsLandAt(const FVector2D& P)const{return Data&&Data->PolygonAt(P)!=INDEX_NONE;}
FString AWNTTerrainActor::TerritoryAt(const FVector2D& P)const
{const int32 I=Data?Data->PolygonAt(P):INDEX_NONE;return I==INDEX_NONE?FString():Data->Polygons[I].Id;}
double AWNTTerrainActor::RenderHeightAt(const FVector2D& P,bool UseCache)const
{
    if(!Data||!FMath::IsFinite(P.X)||!FMath::IsFinite(P.Y)||P.Y< -90.||P.Y>90.)return 0.;
    ++Data->HeightQueries;
    const FVector Query=WNTProjection::Forward(P,CentralMeridian);
    if(UseCache)for(const auto& Face:Data->HeightFaces)
    {
        // Strictly inside both the geographic and rendered triangles: never
        // shortcut a coast/shared-edge test or infer land from a bounding box.
        const double Lon=P.X+360.*std::round(((Face.Geo.A.X+Face.Geo.B.X+Face.Geo.C.X)/3.-P.X)/360.);
        const auto XY=[](const FVector2D& V){return FVector(V.X,V.Y,0);};
        const FVector Geographic=BarycentricXY(FVector(Lon,P.Y,0),XY(Face.Geo.A),XY(Face.Geo.B),XY(Face.Geo.C));
        if(Geographic.GetMin()<=1e-7)continue;
        const FVector W=BarycentricXY(Query,Face.A,Face.B,Face.C);
        if(W.GetMin()<=1e-7)continue;
        ++Data->HeightCacheHits;
        return (Face.A.Z*W.X+Face.B.Z*W.Y+Face.C.Z*W.Z)*.01*ReliefScale;
    }
    if(!IsLandAt(P))return 0.0;
    const double RelativeQuery=WNTProjection::WrapLongitude(P.X-CentralMeridian);
    double Surface=-1;
    TOptional<FWNTTerrainData::FHeightFace> Found;
    for(int32 Index:Data->TrianglesAt(P))for(const auto& T:WNTTerrainGeometry::ClipAtMeridian(Data->Triangles[Index].Geo,0))
    {
        const double Centre=(T.A.X+T.B.X+T.C.X)/3.0-CentralMeridian;
        const double Offset=-CentralMeridian+360.0*std::round((RelativeQuery-Centre)/360.0);
        auto Vertex=[&](const FVector2D& Relative)
        {return WNTProjection::ForwardUnwrapped(FVector2D(Relative.X+Offset,Relative.Y),LandBaseMetres+FMath::Max(0.0,HeightAt(Relative)));};
        const FVector A=Vertex(T.A),B=Vertex(T.B),C=Vertex(T.C),W=BarycentricXY(Query,A,B,C);
        if(W.X>=-1e-8&&W.Y>=-1e-8&&W.Z>=-1e-8)
        {
            const double Height=(A.Z*W.X+B.Z*W.Y+C.Z*W.Z)/100.0;
            if(Height>Surface){Surface=Height;Found=FWNTTerrainData::FHeightFace{T,A,B,C};}
        }
    }
    if(UseCache&&Found.IsSet())
    {
        if(Data->HeightFaces.Num()>=8)Data->HeightFaces.RemoveAt(0);
        Data->HeightFaces.Add(Found.GetValue());
    }
    return (Surface>=0?Surface:LandBaseMetres+FMath::Max(0.0,HeightAt(P)))*ReliefScale;
}
void AWNTTerrainActor::SetControl(const TMap<FString,FLinearColor>& Colours)
{
    if(!Data)return;
    bool Changed=Data->Control.Num()!=Colours.Num();
    if(!Changed)for(const auto& Pair:Colours)
    {const FLinearColor* Existing=Data->Control.Find(Pair.Key);if(!Existing||*Existing!=Pair.Value){Changed=true;break;}}
    if(!Changed)return;
    TSet<FString> ChangedTerritories;
    for(const auto& Pair:Data->Control)if(!Colours.Contains(Pair.Key)||Colours[Pair.Key]!=Pair.Value)ChangedTerritories.Add(Pair.Key);
    for(const auto& Pair:Colours)if(!Data->Control.Contains(Pair.Key)||Data->Control[Pair.Key]!=Pair.Value)ChangedTerritories.Add(Pair.Key);
    Data->Control=Colours;
    RefreshLandColours(ChangedTerritories);
    RebuildMapOverlays(true,false);
}
void AWNTTerrainActor::RefreshLandColours(const TSet<FString>& ChangedTerritories)
{
    if(!Data||ChangedTerritories.IsEmpty())return;
    // Ownership changes recolor existing land buffers; they never retriangulate
    // coastlines or allocate new terrain components. Stable vertex-to-polygon
    // attribution keeps boundary colors on the correct side of each border.
    const int32 TileCount=TileRows*TileColumns;
    for(int32 I=0;I<TileCount;++I)if(TerrainTiles.IsValidIndex(I))if(auto* Mesh=TerrainTiles[I].Get())
    {
        if(!Data->TileTerritories.IsValidIndex(I))continue;
        bool Affected=false;for(const auto& Id:ChangedTerritories)if(Data->TileTerritories[I].Contains(Id)){Affected=true;break;}
        if(!Affected)continue;
        const auto* Section=Mesh->GetProcMeshSection(0);if(!Section)continue;
        if(!Data->TileLandPolygons.IsValidIndex(I%TileCount))continue;
        const auto& Polygons=Data->TileLandPolygons[I%TileCount];
        if(Polygons.Num()!=Section->ProcVertexBuffer.Num())continue;
        TArray<FVector> Positions;TArray<FLinearColor> VertexColours;
        Positions.Reserve(Polygons.Num());VertexColours.Reserve(Polygons.Num());
        for(int32 V=0;V<Polygons.Num();++V)
        {
            const FVector Local=Section->ProcVertexBuffer[V].Position;Positions.Add(Local);
            const auto& Polygon=Data->Polygons[Polygons[V]];const auto* Override=Data->Control.Find(Polygon.Id);
            const FVector P=Local+TileOrigins[I];const auto Geo=WNTProjection::Inverse(P,0);
            FLinearColor Tint=Override?*Override:Polygon.Colour;
            if(const auto* Occupation=Data->Occupations.Find(Polygon.Id))
                Tint=Geo.IsSet()&&WNTTerrainGeometry::BehindCampaignFront(Geo.GetValue(),Occupation->From,Occupation->To,Occupation->Progress)
                    ?Occupation->Attacker:(Occupation->HasRestored?Occupation->Restored:Polygon.Colour);
            VertexColours.Add(WNTTerrainGeometry::TerrainColour(Geo.IsSet()?Geo.GetValue():FVector2D::ZeroVector,P.Z*.01,Tint));
        }
        // All three wrap copies share immutable local geography. Calculate
        // colors once; a changed daily front never creates actors or triangles.
        for(int32 Copy=0;Copy<3;++Copy)if(TerrainTiles.IsValidIndex(I+Copy*TileCount))
            if(auto* Target=TerrainTiles[I+Copy*TileCount].Get())
                Target->UpdateMeshSection_LinearColor(0,Positions,TArray<FVector>(),TArray<FVector2D>(),VertexColours,TArray<FProcMeshTangent>(),false);
    }
}
void AWNTTerrainActor::ApplyCampaignOccupations(const TArray<TSharedPtr<FJsonValue>>& Occupations)
{
    if(!Data)return;FString Signature;FJsonSerializer::Serialize(Occupations,TJsonWriterFactory<>::Create(&Signature));
    if(Data->OccupationSignature==Signature)return;
    TSet<FString> Changed;for(const auto& Pair:Data->Occupations)Changed.Add(Pair.Key);
    Data->Occupations.Reset();Data->OccupationSignature=Signature;
    for(const auto& Value:Occupations)
    {
        const auto Item=Value->AsObject();if(!Item)continue;
        const TArray<TSharedPtr<FJsonValue>> *From=nullptr,*To=nullptr,*Territories=nullptr;
        double Progress=0;FString Colour,Restored;
        if(!Item->TryGetNumberField(TEXT("progress"),Progress)||!FMath::IsFinite(Progress)||Progress<=0||Progress>=1
            ||!Item->TryGetArrayField(TEXT("from"),From)||From->Num()!=2||!Item->TryGetArrayField(TEXT("to"),To)||To->Num()!=2
            ||!Item->TryGetArrayField(TEXT("territories"),Territories)||!Item->TryGetStringField(TEXT("color"),Colour))continue;
        FWNTTerrainData::FOccupation Entry;
        Entry.From=FVector2D((*From)[0]->AsNumber(),(*From)[1]->AsNumber());Entry.To=FVector2D((*To)[0]->AsNumber(),(*To)[1]->AsNumber());
        if(Entry.From.ContainsNaN()||Entry.To.ContainsNaN())continue;
        Entry.Progress=Progress;Entry.Attacker=FLinearColor(FColor::FromHex(Colour));
        Entry.HasRestored=Item->TryGetStringField(TEXT("restoredColor"),Restored);if(Entry.HasRestored)Entry.Restored=FLinearColor(FColor::FromHex(Restored));
        for(const auto& Territory:*Territories){const FString Id=Territory->AsString();Data->Occupations.Add(Id,Entry);Changed.Add(Id);}
    }
    ++Data->OccupationUpdates;RefreshLandColours(Changed);
}
void AWNTTerrainActor::SetGraticuleVisible(bool Visible)
{
    if(bGraticuleVisible==Visible)return;bGraticuleVisible=Visible;
    for(UProceduralMeshComponent* Tile:TerrainTiles)if(Tile)Tile->SetMeshSectionVisible(2,Visible);
}

void AWNTTerrainActor::ApplyCampaignFronts(const TArray<TSharedPtr<FJsonValue>>& Fronts)
{
    if(!Data)return;FString Signature;
    FJsonSerializer::Serialize(Fronts,TJsonWriterFactory<>::Create(&Signature));
    if(Data->FrontSignature==Signature)return;
    Data->FrontSignature=Signature;Data->Fronts=Fronts;
    RebuildMapOverlays(false,true);
}

void AWNTTerrainActor::SetGraticulePixelSize(double CentimetresPerPixel)
{
    const double Started=FPlatformTime::Seconds();
    const double Width=WNTTerrainGeometry::GraticuleWidthForPixelSize(CentimetresPerPixel);
    if(FMath::IsNearlyEqual(Width,GridWidthMetres,.001))return;
    GridWidthMetres=Width;
    // Only custom primitive data changes. All ribbon vertices, indices and
    // packed projection coefficients stay immutable throughout camera motion.
    for(int32 Index=0;Index<TerrainTiles.Num();++Index)if(TerrainTiles[Index])
        UpdateTilePlacement(Index,Index/(TerrainTiles.Num()/3)-1);
    ++RibbonParameterUpdates;
    RibbonUpdateMilliseconds=(FPlatformTime::Seconds()-Started)*1000.;
}

namespace
{
    FVector BarycentricXY(const FVector& P,const FVector& A,const FVector& B,const FVector& C)
    {
        const FVector2D U(B.X-A.X,B.Y-A.Y),V(C.X-A.X,C.Y-A.Y),W(P.X-A.X,P.Y-A.Y);
        const double D=Cross2(U,V);
        if(FMath::Abs(D)<1e-10)return FVector(-1,-1,-1);
        const double Y=Cross2(W,V)/D,Z=Cross2(U,W)/D;
        return FVector(1-Y-Z,Y,Z);
    }
    struct FTileSection
    {
        TArray<FVector> Vertices,Normals;
        TArray<int32> Indices;
        TArray<FVector2D> UV,ProjectionUV,ProjectionDetailUV,ExtrusionUV;
        FVector2D ShearLimits=FVector2D(DBL_MAX,-DBL_MAX);
        TArray<FLinearColor> Colours;
        void Ribbon(const FVector& P,const FVector& Q,const FVector& UnitSide,const FLinearColor& Colour,const FVector& Origin,double Multiplier=1.)
        {
            const FVector Side=UnitSide*5000.*Multiplier; // immutable 100 m support
            const int32 First=Vertices.Num();
            Triangle(P-Side,P+Side,Q+Side,Colour,Origin,true,FVector2D(0,0),FVector2D(1,0),FVector2D(1,1));
            Triangle(P-Side,Q+Side,Q-Side,Colour,Origin,true,FVector2D(0,0),FVector2D(1,1),FVector2D(0,1));
            for(int32 I=First;I<Vertices.Num();++I)
            {
                const FVector Centre=UV[I].Y<.5?P:Q;
                const FVector Offset=Vertices[I]+Origin-Centre;
                ExtrusionUV[I]=FVector2D(Offset.X,Offset.Y)/10000.;
                const auto Metadata=WNTProjection::ChartVertexMetadata(Centre,Origin);
                const auto Packed=WNTProjection::PackChartShear(Metadata.X,Metadata.Y);
                ProjectionUV[I]=Packed.UV1;ProjectionDetailUV[I]=Packed.UV2;
            }
        }
        void Triangle(FVector A,FVector B,FVector C,const FLinearColor& Colour,const FVector& Origin,bool Up=true,
            FVector2D UVA=FVector2D(0,0),FVector2D UVB=FVector2D(1,0),FVector2D UVC=FVector2D(0,1))
        {TriangleWithColours(A,B,C,Colour,Colour,Colour,Origin,Up,UVA,UVB,UVC);}
        void TriangleWithColours(FVector A,FVector B,FVector C,FLinearColor CA,FLinearColor CB,FLinearColor CC,const FVector& Origin,bool Up=true,
            FVector2D UVA=FVector2D(0,0),FVector2D UVB=FVector2D(1,0),FVector2D UVC=FVector2D(0,1))
        {
            FVector N=FVector::CrossProduct(B-A,C-A).GetSafeNormal();
            if(N.IsNearlyZero())return;if(Up&&N.Z<0){Swap(B,C);Swap(UVB,UVC);Swap(CB,CC);N=-N;}
            const int32 Base=Vertices.Num();
            Vertices.Append({A-Origin,B-Origin,C-Origin});Normals.Append({N,N,N});
            // Unreal front faces are clockwise; shading normals stay outward.
            Indices.Append({Base,Base+2,Base+1});UV.Append({UVA,UVB,UVC});Colours.Append({CA,CB,CC});
            ExtrusionUV.Append({FVector2D::ZeroVector,FVector2D::ZeroVector,FVector2D::ZeroVector});
            for(const FVector& P:{A,B,C})
            {
                const FVector2D Metadata=WNTProjection::ChartVertexMetadata(P,Origin);
                const auto Packed=WNTProjection::PackChartShear(Metadata.X,Metadata.Y);
                ProjectionUV.Add(Packed.UV1);ProjectionDetailUV.Add(Packed.UV2);
                ShearLimits.X=FMath::Min(ShearLimits.X,Metadata.X);ShearLimits.Y=FMath::Max(ShearLimits.Y,Metadata.X);
            }
        }
    };
    struct FTileBuild{FVector Origin;FTileSection Land,Coast,Grid;};
    int32 TileAt(double RelativeLon,double Latitude)
    {
        return FMath::Clamp(FMath::FloorToInt((Latitude+90)/TileDegrees),0,TileRows-1)*TileColumns+
            FMath::Clamp(FMath::FloorToInt((RelativeLon+180)/TileDegrees),0,TileColumns-1);
    }
}

void AWNTTerrainActor::RebuildProjectedMeshes()
{
    if(!Data||Data->Triangles.IsEmpty())return;
    // Geometry and subdivision are built once against Greenwich. Each tile's
    // UV1 coefficient and CPD0 shift reproject it on the GPU during a drag;
    // indices and CPU vertex buffers stay fixed across continuous recentering.
    constexpr double MeshMeridian=0;
    TArray<FTileBuild> Tiles;Tiles.SetNum(TileRows*TileColumns);
    Data->TileLandPolygons.SetNum(Tiles.Num());for(auto& Indices:Data->TileLandPolygons)Indices.Reset();
    Data->TileTerritories.SetNum(Tiles.Num());for(auto& Ids:Data->TileTerritories)Ids.Reset();
    for(int32 I=0;I<Tiles.Num();++I)Tiles[I].Origin=WNTProjection::ForwardUnwrapped(FVector2D(-180+TileDegrees*.5+(I%TileColumns)*TileDegrees,-90+TileDegrees*.5+(I/TileColumns)*TileDegrees));
    auto Height=[&](const FVector2D& Relative){return LandBaseMetres+FMath::Max(0.0,HeightAt(FVector2D(Relative.X+MeshMeridian,Relative.Y)));};
    for(const FWNTTerrainData::FTriangle& Source:Data->Triangles)
    {
        const FWNTTerrainData::FPolygon& Polygon=Data->Polygons[Source.Polygon];
        const FLinearColor* Override=Data->Control.Find(Polygon.Id);const FLinearColor Colour=Override?*Override:Polygon.Colour;
        for(const FWNTGeographicTriangle& T:WNTTerrainGeometry::ClipAtMeridian(Source.Geo,MeshMeridian))
        {
            const FVector2D Centre=(T.A+T.B+T.C)/3.0;const int32 TileIndex=TileAt(Centre.X,Centre.Y);FTileBuild& Tile=Tiles[TileIndex];
            const int32 PreviousVertices=Tile.Land.Vertices.Num();
            Data->TileTerritories[TileIndex].Add(Polygon.Id);
            const double HA=Height(T.A),HB=Height(T.B),HC=Height(T.C);
            // Actual height and face normals provide relief; stable geographic
            // vertex colors supply restrained biomes and political ownership.
            // No photographic texture is enlarged as the camera approaches.
            Tile.Land.TriangleWithColours(WNTProjection::ForwardUnwrapped(T.A,HA),WNTProjection::ForwardUnwrapped(T.B,HB),WNTProjection::ForwardUnwrapped(T.C,HC),
                WNTTerrainGeometry::TerrainColour(T.A,HA,Colour),WNTTerrainGeometry::TerrainColour(T.B,HB,Colour),WNTTerrainGeometry::TerrainColour(T.C,HC,Colour),Tile.Origin);
            for(int32 V=PreviousVertices;V<Tile.Land.Vertices.Num();++V)Data->TileLandPolygons[TileIndex].Add(Source.Polygon);
        }
    }
    for(const FWNTTerrainData::FEdge& Edge:Data->Edges)
    {
        if(!Edge.bCoast)continue;
        const double Centre=(Edge.A.X+Edge.B.X)*.5-MeshMeridian,Shift=-360.0*std::floor((Centre+180)/360.0);
        for(int32 Copy=-1;Copy<=1;++Copy)
        {
            FVector2D A(Edge.A.X-MeshMeridian+Shift+Copy*360.0,Edge.A.Y),B(Edge.B.X-MeshMeridian+Shift+Copy*360.0,Edge.B.Y);
            if(FMath::Max(A.X,B.X)<-180||FMath::Min(A.X,B.X)>180)continue;
            if(A.X< -180)A=FMath::Lerp(A,B,(-180-A.X)/(B.X-A.X));if(B.X< -180)B=FMath::Lerp(B,A,(-180-B.X)/(A.X-B.X));
            if(A.X>180)A=FMath::Lerp(A,B,(180-A.X)/(B.X-A.X));if(B.X>180)B=FMath::Lerp(B,A,(180-B.X)/(A.X-B.X));
            const FVector2D Mid=(A+B)*.5;FTileBuild& Tile=Tiles[TileAt(Mid.X,Mid.Y)];
            const FVector TA=WNTProjection::ForwardUnwrapped(A,Height(A)),TB=WNTProjection::ForwardUnwrapped(B,Height(B));
            const FVector BA=WNTProjection::ForwardUnwrapped(A,-2),BB=WNTProjection::ForwardUnwrapped(B,-2);
            const FLinearColor Coast(.19f,.24f,.20f);
            Tile.Coast.Triangle(TA,BA,TB,Coast,Tile.Origin,false);Tile.Coast.Triangle(TB,BA,BB,Coast,Tile.Origin,false);
        }
    }
    auto AddGridLine=[&](const FVector2D& A,const FVector2D& B,double AX,double BX)
    {
        const FVector2D Mid((AX+BX)*.5,(A.Y+B.Y)*.5);FTileBuild& Tile=Tiles[TileAt(Mid.X,Mid.Y)];
        const FVector PA=WNTProjection::ForwardUnwrapped(FVector2D(AX,A.Y)),PB=WNTProjection::ForwardUnwrapped(FVector2D(BX,B.Y));
        struct FInterval{double Start,End,HeightA,HeightB;};TArray<FInterval> Land;
        TSet<int32> Candidates;
        for(const FVector2D& P:{A,B,(A+B)*.5})for(int32 Index:Data->TrianglesAt(P))Candidates.Add(Index);
        for(int32 Index:Candidates)for(const auto& T:WNTTerrainGeometry::ClipAtMeridian(Data->Triangles[Index].Geo,MeshMeridian))
        {
            const FVector TA=WNTProjection::ForwardUnwrapped(T.A,Height(T.A)),TB=WNTProjection::ForwardUnwrapped(T.B,Height(T.B)),TC=WNTProjection::ForwardUnwrapped(T.C,Height(T.C));
            const FVector WA=BarycentricXY(PA,TA,TB,TC),WB=BarycentricXY(PB,TA,TB,TC);
            double Start=0,End=1;bool Valid=true;
            for(int32 Axis=0;Axis<3;++Axis)
            {
                const double Change=WB[Axis]-WA[Axis];
                if(FMath::Abs(Change)<1e-12){if(WA[Axis]<-1e-8)Valid=false;continue;}
                const double Crossing=-WA[Axis]/Change;
                if(Change>0)Start=FMath::Max(Start,Crossing);else End=FMath::Min(End,Crossing);
            }
            if(!Valid||End-Start<1e-9)continue;
            const FVector W0=FMath::Lerp(WA,WB,Start),W1=FMath::Lerp(WA,WB,End);
            Land.Add({Start,End,W0.X*TA.Z+W0.Y*TB.Z+W0.Z*TC.Z,W1.X*TA.Z+W1.Y*TB.Z+W1.Z*TC.Z});
        }
        Land.Sort([](const FInterval& L,const FInterval& R){return L.Start<R.Start;});
        const FLinearColor Grid(.31f,.40f,.39f);
        auto DrawInterval=[&](double Start,double End,double H0,double H1)
        {
            if(End-Start<1e-9)return;
            FVector P=FMath::Lerp(PA,PB,Start),Q=FMath::Lerp(PA,PB,End);P.Z=H0+10000;Q.Z=H1+10000;
            const FVector Side=FVector::CrossProduct((Q-P).GetSafeNormal(),FVector::UpVector).GetSafeNormal();
            // U runs across the padded ribbon. The shader measures its screen
            // derivative to retain the same softly filtered pixel width.
            Tile.Grid.Ribbon(P,Q,Side,Grid,Tile.Origin);
        };
        double Cursor=0;
        for(const auto& Interval:Land)
        {
            if(Interval.End<=Cursor)continue;
            if(Interval.Start>Cursor)DrawInterval(Cursor,Interval.Start,0,0);
            const double Start=FMath::Max(Cursor,Interval.Start);
            const double H0=FMath::Lerp(Interval.HeightA,Interval.HeightB,(Start-Interval.Start)/(Interval.End-Interval.Start));
            DrawInterval(Start,Interval.End,H0,Interval.HeightB);Cursor=Interval.End;
        }
        if(Cursor<1)DrawInterval(Cursor,1,0,0);
    };
    auto GridSegment=[&](const FVector2D& A,const FVector2D& B)
    {
        const double AX=WNTProjection::WrapLongitude(A.X-MeshMeridian),BX=WNTProjection::WrapLongitude(B.X-MeshMeridian);
        if(FMath::Abs(AX-BX)<=180){AddGridLine(A,B,AX,BX);return;}
        const double UnwrappedB=BX+(AX>BX?360.0:-360.0),Boundary=AX>BX?180.0:-180.0;
        const FVector2D Seam=FMath::Lerp(A,B,(Boundary-AX)/(UnwrappedB-AX));
        AddGridLine(A,Seam,AX,Boundary);AddGridLine(Seam,B,-Boundary,BX);
    };
    const double GridStep=FMath::Clamp(GridSpacingDegrees,5.0,90.0);
    for(double Lon=-180;Lon<180-1e-8;Lon+=GridStep)for(double Lat=-90;Lat<90-1e-8;Lat+=.25)GridSegment(FVector2D(Lon,Lat),FVector2D(Lon,Lat+.25));
    for(double Lat=-90+GridStep;Lat<90-1e-8;Lat+=GridStep)for(double Lon=-180;Lon<180-1e-8;Lon+=.25)GridSegment(FVector2D(Lon,Lat),FVector2D(Lon+.25,Lat));
    if(TerrainTiles.Num()!=Tiles.Num()*3)TerrainTiles.SetNum(Tiles.Num()*3);
    TileOrigins.SetNum(TerrainTiles.Num());TileOriginGeography.SetNum(TerrainTiles.Num());
    TileLocalBounds.SetNum(TerrainTiles.Num());TileShearLimits.SetNum(TerrainTiles.Num());
    for(int32 Copy=-1;Copy<=1;++Copy)for(int32 I=0;I<Tiles.Num();++I)
    {
        const int32 Instance=(Copy+1)*Tiles.Num()+I;
        FTileBuild& Tile=Tiles[I];UProceduralMeshComponent* Mesh=TerrainTiles[Instance];
        TileOrigins[Instance]=Tile.Origin;TileOriginGeography[Instance]=WNTProjection::Inverse(Tile.Origin).GetValue();
        TileLocalBounds[Instance]=FBox(ForceInit);TileShearLimits[Instance]=FVector2D(DBL_MAX,-DBL_MAX);
        for(const FTileSection* Section:{&Tile.Land,&Tile.Coast,&Tile.Grid})for(int32 V=0;V<Section->Vertices.Num();++V)
        {
            TileLocalBounds[Instance]+=Section->Vertices[V];auto& Limits=TileShearLimits[Instance];
            Limits.X=FMath::Min(Limits.X,Section->ShearLimits.X);Limits.Y=FMath::Max(Limits.Y,Section->ShearLimits.Y);
        }
        if(!Mesh&&(Tile.Land.Vertices.Num()||Tile.Grid.Vertices.Num()))
        {
            auto* MapTile=NewObject<UWNTMapTileComponent>(this,*FString::Printf(TEXT("TerrainTile_%d"),Instance));
            Mesh=MapTile;
            Mesh->SetupAttachment(RootComponent);Mesh->SetMobility(EComponentMobility::Movable);Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
            // Planet-wide procedural terrain must not enter the ship-scale
            // virtual-shadow marking queue. Its relief remains fully lit.
            Mesh->SetCastShadow(false);Mesh->SetAffectDistanceFieldLighting(false);
            Mesh->bUseAsyncCooking=true;Mesh->RegisterComponent();TerrainTiles[Instance]=Mesh;AddInstanceComponent(Mesh);
        }
        if(!Mesh)continue;UpdateTilePlacement(Instance,Copy);
        auto Apply=[&](int32 Section,FTileSection& Build,UMaterialInterface* Material)
        {
            if(Build.Vertices.IsEmpty()){Mesh->ClearMeshSection(Section);return;}
            const FProcMeshSection* Existing=Mesh->GetProcMeshSection(Section);
            if(Existing&&Existing->ProcVertexBuffer.Num()==Build.Vertices.Num())
                Mesh->UpdateMeshSection_LinearColor(Section,Build.Vertices,Build.Normals,Build.UV,Build.ProjectionUV,Build.ProjectionDetailUV,Build.ExtrusionUV,Build.Colours,TArray<FProcMeshTangent>(),false);
            else Mesh->CreateMeshSection_LinearColor(Section,Build.Vertices,Build.Indices,Build.Normals,Build.UV,Build.ProjectionUV,Build.ProjectionDetailUV,Build.ExtrusionUV,Build.Colours,TArray<FProcMeshTangent>(),false,false);
            Mesh->SetMaterial(Section,Material?Material:UMaterial::GetDefaultMaterial(MD_Surface));
        };
        Apply(0,Tile.Land,TerrainMaterial);
        Apply(1,Tile.Coast,LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_Terrain.M_Terrain")));
        Apply(2,Tile.Grid,LineMaterial);
        Mesh->SetMeshSectionVisible(2,bGraticuleVisible);
    }
    RebuildMapOverlays(true,true);
}

void AWNTTerrainActor::RebuildMapOverlays(bool Borders,bool Fronts)
{
    if(!Data||TerrainTiles.Num()!=TileRows*TileColumns*3)return;
    struct FOverlayTile{FTileSection Border,Front;};
    TArray<FOverlayTile> Builds;Builds.SetNum(TileRows*TileColumns);
    if(Borders){Data->CountryBorderSegments=0;Data->CoastlineSegments=0;}if(Fronts)Data->CampaignFrontSegments=0;
    auto AddLine=[&](FVector2D From,FVector2D To,const FLinearColor& Colour,bool Front)
    {
        // All pieces follow the land subdivision and tile boundaries. Only
        // the transverse support changes with zoom; longitude pans use WPO.
        To.X=From.X+WNTProjection::WrapLongitude(To.X-From.X);
        const auto Points=WNTTerrainGeometry::SplitSurfaceEdge(From,To,SurfaceSampleDegrees);
        for(int32 J=0;J+1<Points.Num();++J)
        {
            FVector2D A=Points[J],B=Points[J+1];
            const double Shift=-360.*std::floor(((A.X+B.X)*.5+180.)/360.);
            A.X+=Shift;B.X+=Shift;
            if(A.Equals(B,1e-10))continue;
            const int32 TileIndex=TileAt((A.X+B.X)*.5,(A.Y+B.Y)*.5);
            const FVector Origin=TileOrigins[TileIndex];
            const FVector P=WNTProjection::ForwardUnwrapped(A,LandBaseMetres+FMath::Max(0.,HeightAt(A))+3.);
            const FVector Q=WNTProjection::ForwardUnwrapped(B,LandBaseMetres+FMath::Max(0.,HeightAt(B))+3.);
            const FVector Side=FVector::CrossProduct((Q-P).GetSafeNormal(),FVector::UpVector).GetSafeNormal();
            auto& Section=Front?Builds[TileIndex].Front:Builds[TileIndex].Border;
            if(Front)++Data->CampaignFrontSegments;
            Section.Ribbon(P,Q,Side,Colour,Origin,Front?2.5:1.5);
        }
    };
    if(Borders)for(const auto& Edge:Data->Edges)
    {
        // Neither the artificial pole closure nor a map seam is a coastline.
        if((FMath::Abs(Edge.A.Y)>89.99&&FMath::Abs(Edge.B.Y)>89.99)
            ||(FMath::Abs(FMath::Abs(Edge.A.X)-180)<1e-8&&FMath::Abs(FMath::Abs(Edge.B.X)-180)<1e-8))continue;
        if(!Edge.bCoast)
        {
            if(!Edge.bFirstShared||!Data->Polygons.IsValidIndex(Edge.OtherPolygon))continue;
            const auto& A=Data->Polygons[Edge.Polygon];const auto& B=Data->Polygons[Edge.OtherPolygon];
            const auto* CA=Data->Control.Find(A.Id);const auto* CB=Data->Control.Find(B.Id);
            const bool SameOwner=!CA&&!CB?A.Owner==B.Owner:(CA?*CA:A.Colour).Equals(CB?*CB:B.Colour,.00001f);
            if(SameOwner)continue;
        }
        if(Edge.bCoast)++Data->CoastlineSegments;else ++Data->CountryBorderSegments;
        AddLine(Edge.A,Edge.B,Edge.bCoast?FLinearColor(.075f,.125f,.14f,.72f):FLinearColor(.055f,.06f,.045f,.94f),false);
    }
    if(Fronts)for(const auto& Value:Data->Fronts)
    {
        const auto Front=Value->AsObject();if(!Front)continue;
        const TArray<TSharedPtr<FJsonValue>> *From=nullptr,*To=nullptr,*Territories=nullptr;
        double Progress=0;bool Island=false;FString Status;
        if(!Front->TryGetNumberField(TEXT("progress"),Progress)||!FMath::IsFinite(Progress)||Progress<=0||Progress>=1
            ||!Front->TryGetArrayField(TEXT("from"),From)||!Front->TryGetArrayField(TEXT("to"),To)
            ||!Front->TryGetArrayField(TEXT("territories"),Territories)||From->Num()!=2||To->Num()!=2)continue;
        Front->TryGetBoolField(TEXT("island"),Island);Front->TryGetStringField(TEXT("status"),Status);if(Status==TEXT("Ceasefire"))continue;
        double AX=0,AY=0,BX=0,BY=0;
        if(!(*From)[0]->TryGetNumber(AX)||!(*From)[1]->TryGetNumber(AY)||!(*To)[0]->TryGetNumber(BX)||!(*To)[1]->TryGetNumber(BY)
            ||!FMath::IsFinite(AX)||!FMath::IsFinite(AY)||!FMath::IsFinite(BX)||!FMath::IsFinite(BY))continue;
        const FVector2D A(AX,AY),B(BX,BY);
        TSet<FString> Ids;for(const auto& Id:*Territories)Ids.Add(Id->AsString());
        FString FrontColour;Front->TryGetStringField(TEXT("color"),FrontColour);
        const FLinearColor Colour(FColor::FromHex(FrontColour.IsEmpty()?TEXT("#e68e70"):FrontColour));
        for(const auto& Polygon:Data->Polygons)if(Ids.Contains(Polygon.Id))
        {
            if(Island)
            {
                for(const auto& Ring:Polygon.Rings)for(int32 I=0;I<Ring.Num();++I)AddLine(Ring[I],Ring[(I+1)%Ring.Num()],Colour,true);
            }
            else for(const auto& Segment:WNTTerrainGeometry::CampaignFrontSegments(Polygon.Rings,A,B,Progress))
                AddLine(Segment.Key,Segment.Value,Colour,true);
        }
    }
    for(int32 Copy=-1;Copy<=1;++Copy)for(int32 I=0;I<Builds.Num();++I)
    {
        const int32 Instance=(Copy+1)*Builds.Num()+I;auto* Mesh=TerrainTiles[Instance].Get();
        if(!Mesh&&(!Builds[I].Border.Vertices.IsEmpty()||!Builds[I].Front.Vertices.IsEmpty()))
        {
            Mesh=NewObject<UWNTMapTileComponent>(this,*FString::Printf(TEXT("TerrainTile_%d"),Instance));
            Mesh->SetupAttachment(RootComponent);Mesh->SetMobility(EComponentMobility::Movable);Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
            Mesh->SetCastShadow(false);Mesh->SetAffectDistanceFieldLighting(false);Mesh->RegisterComponent();TerrainTiles[Instance]=Mesh;AddInstanceComponent(Mesh);
        }
        if(!Mesh)continue;
        auto Apply=[&](int32 SectionIndex,FTileSection& Build,UMaterialInterface* Material)
        {
            if(Build.Vertices.IsEmpty()){Mesh->ClearMeshSection(SectionIndex);return;}
            for(const auto& Vertex:Build.Vertices)TileLocalBounds[Instance]+=Vertex;
            auto& Limits=TileShearLimits[Instance];Limits.X=FMath::Min(Limits.X,Build.ShearLimits.X);Limits.Y=FMath::Max(Limits.Y,Build.ShearLimits.Y);
            const auto* Existing=Mesh->GetProcMeshSection(SectionIndex);
            if(Existing&&Existing->ProcVertexBuffer.Num()==Build.Vertices.Num())
                Mesh->UpdateMeshSection_LinearColor(SectionIndex,Build.Vertices,Build.Normals,Build.UV,Build.ProjectionUV,Build.ProjectionDetailUV,Build.ExtrusionUV,Build.Colours,TArray<FProcMeshTangent>(),false);
            else Mesh->CreateMeshSection_LinearColor(SectionIndex,Build.Vertices,Build.Indices,Build.Normals,Build.UV,Build.ProjectionUV,Build.ProjectionDetailUV,Build.ExtrusionUV,Build.Colours,TArray<FProcMeshTangent>(),false,false);
            Mesh->SetMaterial(SectionIndex,Material);Mesh->SetMeshSectionVisible(SectionIndex,true);
        };
        if(Borders)Apply(3,Builds[I].Border,BorderMaterial);
        if(Fronts)Apply(4,Builds[I].Front,FrontMaterial);
        UpdateTilePlacement(Instance,Copy);
    }
}

TSharedPtr<FJsonObject> AWNTTerrainActor::GetMapStyleDiagnostics() const
{
    auto Result=MakeShared<FJsonObject>();int32 Components=0;
    for(const auto& Tile:TerrainTiles)if(Tile)++Components;
    Result->SetNumberField(TEXT("terrainComponents"),Components);
    Result->SetNumberField(TEXT("terrainComponentBudget"),TileRows*TileColumns*3);
    Result->SetNumberField(TEXT("countryBorderSegments"),Data?Data->CountryBorderSegments:0);
    Result->SetNumberField(TEXT("coastlineSegments"),Data?Data->CoastlineSegments:0);
    Result->SetNumberField(TEXT("campaignFrontSegments"),Data?Data->CampaignFrontSegments:0);
    Result->SetNumberField(TEXT("partiallyOccupiedTerritories"),Data?Data->Occupations.Num():0);
    Result->SetNumberField(TEXT("occupationColourUpdates"),Data?double(Data->OccupationUpdates):0);
    Result->SetNumberField(TEXT("surfaceSampleDegrees"),SurfaceSampleDegrees);
    Result->SetStringField(TEXT("ribbonResizeMode"),TEXT("immutable-geometry-gpu-extrusion"));
    Result->SetNumberField(TEXT("ribbonParameterUpdates"),double(RibbonParameterUpdates));
    Result->SetNumberField(TEXT("ribbonUpdateMilliseconds"),RibbonUpdateMilliseconds);
    Result->SetNumberField(TEXT("zoomVertexUploads"),0);
    Result->SetNumberField(TEXT("heightQueries"),Data?double(Data->HeightQueries):0.);
    Result->SetNumberField(TEXT("heightCacheHits"),Data?double(Data->HeightCacheHits):0.);
    Result->SetNumberField(TEXT("visualReliefScale"),ReliefScale);
    Result->SetStringField(TEXT("reliefBasis"),TEXT("Real elevation geometry, 1x at ship range, smoothly emphasized to 6x for the strategic chart; simulation geography unchanged."));
    Result->SetStringField(TEXT("frontAccuracy"),TEXT("Strategic campaign progress within recorded territories, not individual troop positions."));
    return Result;
}
