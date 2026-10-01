#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Misc/Paths.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "WNTProjection.h"
#include "WNTTerrainActor.h"
#include "WNTMapTileComponent.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Misc/FileHelper.h"
#if WITH_EDITOR
#include "Materials/Material.h"
#include "Materials/MaterialExpressionDivide.h"
#include "MaterialShared.h"
#include "RHI.h"
#endif

namespace
{
    double Area(const FWNTGeographicTriangle& T)
    {const FVector2D A=T.B-T.A,B=T.C-T.A;return FMath::Abs(A.X*B.Y-A.Y*B.X)*.5;}
    bool Contains(const FWNTGeographicTriangle& T,const FVector2D& P)
    {
        const FVector2D U=T.B-T.A,V=T.C-T.A,W=P-T.A;
        const double D=U.X*V.Y-U.Y*V.X;if(FMath::Abs(D)<1e-15)return false;
        const double B=(W.X*V.Y-W.Y*V.X)/D,C=(U.X*W.Y-U.Y*W.X)/D;
        return B>=-1e-9&&C>=-1e-9&&B+C<=1+1e-9;
    }
    FString DataRoot()
    {
        FString Root;
        if(!FParse::Value(FCommandLine::Get(),TEXT("WNTDataRoot="),Root))Root=FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(),TEXT("..")));
        return Root;
    }
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTEqualEarthProjectionTest,"WNT.Geography.WrappingTerrainProjection",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTEqualEarthProjectionTest::RunTest(const FString& Parameters)
{
    for(double Meridian:{-179.5,0.0,87.25,179.5})for(double Lon:{-540.0,-180.0,-179.999,0.0,123.456,179.999,540.0})for(double Lat:{-90.0,-75.0,-12.5,0.0,49.3,89.0,90.0})
    {
        const FVector World=WNTProjection::Forward(FVector2D(Lon,Lat),Meridian,1234.5);
        const TOptional<FVector2D> RoundTrip=WNTProjection::Inverse(World,Meridian);
        TestTrue(TEXT("Inside point has inverse"),RoundTrip.IsSet());if(!RoundTrip.IsSet())continue;
        TestTrue(TEXT("Longitude round trip across moving seam"),FMath::Abs(WNTProjection::WrapLongitude(RoundTrip->X-Lon))<1e-7);
        TestTrue(TEXT("Latitude round trip including poles"),FMath::Abs(RoundTrip->Y-Lat)<1e-5);
        TestTrue(TEXT("Metres become centimetres exactly"),FMath::Abs(World.Z-123450)<1e-8);
    }
    const FVector Origin=WNTProjection::Forward(FVector2D(0,0));
    const FVector North=WNTProjection::Forward(FVector2D(0,30));
    const FVector East=WNTProjection::Forward(FVector2D(30,0));
    TestTrue(TEXT("Prime equator at origin"),Origin.IsNearlyZero());
    TestTrue(TEXT("North is +X with zero roll"),North.X>0&&FMath::Abs(North.Y)<1e-8);
    TestTrue(TEXT("East is +Y"),East.Y>0&&FMath::Abs(East.X)<1e-8);
    TestFalse(TEXT("Beyond the poles cannot pick land"),WNTProjection::Inverse(FVector(1e12,0,0)).IsSet());
    for(double Lat:{-85.0,0.0,85.0})for(double Turns:{-7.0,-1.0,0.0,1.0,7.0})
    {
        const FVector Point=WNTProjection::ForwardUnwrapped(FVector2D(42+360*Turns,Lat),321);
        const auto Inverse=WNTProjection::Inverse(Point);
        TestTrue(TEXT("Repeated world copies pick the same geography"),Inverse.IsSet()&&Inverse->Equals(FVector2D(42,Lat),1e-7));
        const FVector Shift=WNTProjection::ForwardUnwrapped(FVector2D(42+360,Lat))-WNTProjection::ForwardUnwrapped(FVector2D(42,Lat));
        TestTrue(TEXT("Seam joins by one constant translation at every latitude"),Shift.Equals(FVector(0,WNTProjection::WorldWidth,0),1e-5));
    }
    TestTrue(TEXT("Seam endpoints have distinct positions"),WNTProjection::ForwardUnwrapped(FVector2D(180,0)).Y>0&&WNTProjection::ForwardUnwrapped(FVector2D(-180,0)).Y<0);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTGeographicSeamsTest,"WNT.Geography.HolesDatelineAndPoles",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTGeographicSeamsTest::RunTest(const FString& Parameters)
{
    const TArray<TArray<FVector2D>> Rings{
        {{170,-10},{-170,-10},{-170,10},{170,10},{170,-10}},
        {{176,-3},{176,3},{-176,3},{-176,-3},{176,-3}}
    };
    TArray<FWNTGeographicTriangle> Triangles;FString Error;
    TestTrue(TEXT("Constrained polygon with seam-crossing hole triangulates"),WNTTerrainGeometry::TriangulatePolygon(Rings,Triangles,Error));
    double Total=0;for(const auto& T:Triangles)Total+=Area(T);
    TestTrue(TEXT("Hole area is subtracted"),FMath::Abs(Total-352.0)<1e-7);
    for(double Rotation:{-179.0,-90.0,0.0,90.0,179.0})
    {
        TArray<FWNTGeographicTriangle> Clipped;double Sum=0;
        for(const auto& T:Triangles)for(const auto& C:WNTTerrainGeometry::ClipAtMeridian(T,Rotation))
        {
            Sum+=Area(C);Clipped.Add(C);
            TestTrue(TEXT("Every seam fragment remains inside outline longitude"),FMath::Min3(C.A.X,C.B.X,C.C.X)>=-180-1e-9&&FMath::Max3(C.A.X,C.B.X,C.C.X)<=180+1e-9);
            TestTrue(TEXT("No triangle bridges the world"),FMath::Max3(C.A.X,C.B.X,C.C.X)-FMath::Min3(C.A.X,C.B.X,C.C.X)<=20.000001);
        }
        TestTrue(TEXT("Wrapping conserves area"),FMath::Abs(Sum-352.0)<1e-7);
        for(const FVector2D P:{FVector2D(179,0),FVector2D(-179,0),FVector2D(172,0),FVector2D(-172,0)})
        {
            const FVector2D Q(WNTProjection::WrapLongitude(P.X-Rotation),P.Y);bool Hit=false;
            for(const auto& T:Clipped)if(Contains(T,Q)){Hit=true;break;}
            TestEqual(TEXT("Hole stays open on both sides of moving seam"),Hit,FMath::Abs(P.X)<176);
        }
    }
    for(double Sign:{-1.0,1.0})
    {
        TArray<TArray<FVector2D>> Cap{{{-180,Sign*75},{-90,Sign*75},{0,Sign*75},{90,Sign*75},{180,Sign*75},{180,Sign*89.999},{-180,Sign*89.999},{-180,Sign*75}}};
        Triangles.Reset();TestTrue(TEXT("Artificial map pole closure triangulates"),WNTTerrainGeometry::TriangulatePolygon(Cap,Triangles,Error));
        Total=0;for(const auto& T:Triangles)Total+=Area(T);
        TestTrue(TEXT("Polar cap spans the full world width"),FMath::Abs(Total-5400.0)<1e-7);
    }
    // Authored historical borders can cross their source coastline, as in c365w.
    // Preserve both odd/even lobes after splitting the crossed boundary.
    Triangles.Reset();
    const TArray<TArray<FVector2D>> CrossedBoundary{{{0,0},{4,4},{0,4},{4,0},{0,0}}};
    TestTrue(TEXT("Crossed historical boundary resolves before triangulation"),WNTTerrainGeometry::TriangulatePolygon(CrossedBoundary,Triangles,Error));
    Total=0;for(const auto& T:Triangles)Total+=Area(T);
    TestTrue(TEXT("Intersection repair keeps both lobes without filling outside land"),FMath::Abs(Total-8.0)<1e-6);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWrappedTileCoverageTest,"WNT.Geography.RepeatedTileCoverage",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWrappedTileCoverageTest::RunTest(const FString& Parameters)
{
    const double Width=WNTProjection::WorldWidth,TileWidth=Width/24.0;
    for(double Meridian:{-720.25,-179.999,-147.,0.,89.,179.999,540.2})
    {
        TArray<double> Centres;
        for(int32 Copy=-1;Copy<=1;++Copy)for(int32 Column=0;Column<24;++Column)
        {
            const FVector Origin=WNTProjection::ForwardUnwrapped(FVector2D(-172.5+Column*15.0,37),123);
            const FVector Placed=WNTTerrainGeometry::WrappedTileOrigin(Origin,Meridian,Copy);
            Centres.Add(Placed.Y);
            const auto Geo=WNTProjection::Inverse(Placed,Meridian);
            TestTrue(TEXT("Every repeated tile still maps to its original geography"),Geo.IsSet()
                &&FMath::Abs(WNTProjection::WrapLongitude(Geo->X-(-172.5+Column*15.0)))<1e-8
                &&FMath::Abs(Geo->Y-37)<1e-8&&FMath::Abs(Placed.Z-12300)<.001);
        }
        Centres.Sort();
        bool NoGaps=true;
        for(int32 I=1;I<Centres.Num();++I)NoGaps&=FMath::Abs(Centres[I]-Centres[I-1]-TileWidth)<.001;
        TestTrue(TEXT("Three repeated worlds have no gaps or duplicated tiles"),NoGaps);
        TestTrue(TEXT("Coverage remains centered across an ultrawide strategic view"),
            Centres[0]-TileWidth*.5<=-Width*1.47&&Centres.Last()+TileWidth*.5>=Width*1.47);
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTConservativeChartBoundsTest,"WNT.Geography.ConservativeChartBounds",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTConservativeChartBoundsTest::RunTest(const FString& Parameters)
{
    auto* Tile=NewObject<UWNTMapTileComponent>();
    if(!TestNotNull(TEXT("Native map tile component"),Tile))return false;
    const double Half=WNTProjection::WorldWidth/48.0;
    const FVector Extent(Half,Half,1000000.0);
    Tile->SetGeographicHalfExtent(Extent);
    const TArray<FVector> Vertices{FVector(-Half,-Half,10000),FVector(Half,-Half,10000),FVector(Half,-Half+400000,10000)};
    Tile->CreateMeshSection_LinearColor(0,Vertices,TArray<int32>{0,2,1},TArray<FVector>(),TArray<FVector2D>(),TArray<FLinearColor>(),TArray<FProcMeshTangent>(),false,false);
    const auto* Allocation=Tile->GetProcMeshSection(0)->ProcVertexBuffer.GetData();
    for(const FVector Translation:{FVector::ZeroVector,FVector(700000000,-2500000000,0),FVector(-700000000,5100000000,0)})
    {
        const FBox Bounds=Tile->CalcBounds(FTransform(Translation)).GetBox();
        TestTrue(TEXT("A single thin line retains the complete geographic tile footprint"),
            Bounds.IsInsideOrOn(Translation-Extent)&&Bounds.IsInsideOrOn(Translation+Extent));
        TestTrue(TEXT("Flat chart geometry has nonzero conservative depth bounds"),Bounds.GetExtent().Z>=1000000.0);
        for(const FVector& Vertex:Vertices)TestTrue(TEXT("Conservative bounds always include visible geometry"),Bounds.IsInsideOrOn(Translation+Vertex));
    }
    TestTrue(TEXT("Bounds calculations never modify or allocate geometry"),Allocation==Tile->GetProcMeshSection(0)->ProcVertexBuffer.GetData());
    for(double PixelMetres:{120.0,500.0,4000.0,18000.0,32000.0,44000.0})
    {
        const double Width=WNTTerrainGeometry::GraticuleWidthForPixelSize(PixelMetres*100.0);
        TestTrue(TEXT("Strategic grid quantization stays between one and sqrt(2) pixels"),Width>=PixelMetres&&Width<=PixelMetres*FMath::Sqrt(2.0)+1e-7);
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTSatellitePrecisionTest,"WNT.Geography.SatelliteTexturePrecision",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTSatellitePrecisionTest::RunTest(const FString& Parameters)
{
    // Match the shader's float arithmetic, including its CPD and local vertex
    // positions. Quantization must stay below one percent of a NASA texel.
    auto ShaderUV=[](const FVector2D& Point,const FVector2D& TileCentre)
    {
        const FVector Origin=WNTProjection::ForwardUnwrapped(TileCentre);
        const FVector Local=WNTProjection::ForwardUnwrapped(Point)-Origin;
        const FVector2D UV=WNTTerrainGeometry::GlobalTextureOrigin(Origin);
        const float U=float(UV.X)+float(Local.Y)/float(WNTProjection::WorldWidth);
        const float V=float(UV.Y)+float(Local.X)/float(-WNTProjection::WorldWidth/2.0);
        return FVector2D(U,V);
    };
    for(double Lon:{-179.999,-15.001,-15.0,-.001,0.0,14.999,15.0,179.999})for(double Lat:{-89.999,-.001,0.0,37.5,89.999})
    {
        const FVector2D Point(Lon,Lat);
        const FVector2D Centre(-172.5+FMath::FloorToDouble((Lon+180)/15.0)*15.0,-82.5+FMath::FloorToDouble((Lat+90)/15.0)*15.0);
        const FVector2D UV=ShaderUV(Point,Centre),Expected((Lon+180)/360.0,(90-Lat)/180.0);
        TestTrue(TEXT("Global float UV tracks geographic coordinates to subpixel precision"),UV.Equals(Expected,2e-7));
        const FVector2D Adjacent=ShaderUV(Point,Centre+FVector2D(15,0));
        TestTrue(TEXT("Satellite sampling is continuous across adjacent tile origins"),UV.Equals(Adjacent,2e-7));
    }
    const FVector2D A=ShaderUV(FVector2D(12.0,38.0),FVector2D(7.5,37.5));
    const FVector2D B=ShaderUV(FVector2D(12.001,38.001),FVector2D(7.5,37.5));
    TestTrue(TEXT("Subkilometre movement changes UV instead of sticking to half-float steps"),B.X-A.X>2.6e-6&&A.Y-B.Y>5.3e-6);
    const FVector2D West=ShaderUV(FVector2D(-180,37.0),FVector2D(-172.5,37.5));
    const FVector2D East=ShaderUV(FVector2D(180,37.0),FVector2D(172.5,37.5));
    TestTrue(TEXT("Dateline differs only by exactly one repeating texture turn"),FMath::Abs(East.X-West.X-1.0)<2e-7&&FMath::Abs(East.Y-West.Y)<2e-7);
    return true;
}

#if WITH_EDITOR
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTSatelliteCompiledCoordinatesTest,"WNT.Geography.CompiledSatelliteCoordinates",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTSatelliteCompiledCoordinatesTest::RunTest(const FString& Parameters)
{
    UMaterial* Material=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_TerrainSurface.M_TerrainSurface"));
    if(!TestNotNull(TEXT("Actual prepared terrain surface material"),Material))return false;
    int32 CoordinateDivisions=0;
    for(UMaterialExpression* Expression:Material->GetExpressions())
    {
        auto* Division=Cast<UMaterialExpressionDivide>(Expression);
        if(!Division||!Division->Desc.StartsWith(TEXT("Satellite ")))continue;
        ++CoordinateDivisions;
        TestNotNull(TEXT("Satellite coordinate retains a spatial input"),Division->A.Expression);
        const double Expected=Division->Desc.Contains(TEXT("longitude"))?WNTProjection::WorldWidth:-WNTProjection::WorldWidth/2.0;
        TestTrue(TEXT("Satellite denominator is a representable world span, not a rounded-zero reciprocal"),FMath::Abs(Division->ConstB/Expected-1.0)<1e-6);
    }
    TestEqual(TEXT("Prepared satellite material contains both coordinate divisions"),CoordinateDivisions,2);
    // NullRHI does not allocate the material's runtime rendering resources.
    // Bind a translation-only resource to the real loaded graph and the same
    // Windows SM6 target used by the package; shader translation needs no GPU.
    FMaterialResource Resource;
    Resource.SetMaterial(Material,nullptr,SP_PCD3D_SM6,EMaterialQualityLevel::High);
    FString HLSL;
    if(!TestTrue(TEXT("Translate the actual prepared material to shader source"),Resource.GetMaterialExpressionSource(HLSL)))return false;
    // The earlier CPU UV test could pass while UE emitted *0.00000000f.
    // Inspect real material translation as well as the numerical projection.
    for(float Denominator:{float(WNTProjection::WorldWidth),float(-WNTProjection::WorldWidth/2.0)})
    {
        const FString Literal=FString::Printf(TEXT("%0.8f"),Denominator);
        TestTrue(TEXT("Generated shader preserves a nonzero satellite coordinate denominator: ")+Literal,HLSL.Contains(Literal));
    }
    FFileHelper::SaveStringToFile(HLSL,*FPaths::Combine(FPaths::ProjectSavedDir(),TEXT("WNTTerrainSurface.ush")));
    return true;
}
#endif

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTSharedBorderContinuityTest,"WNT.Geography.SharedBorderTerrainContinuity",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTSharedBorderContinuityTest::RunTest(const FString& Parameters)
{
    const FString Root=DataRoot();FString Text,Error;TSharedPtr<FJsonObject> Document;
    if(!TestTrue(TEXT("Read actual display geometry"),FFileHelper::LoadFileToString(Text,*FPaths::Combine(Root,TEXT("assets/maps/geometry.json")))&&FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text),Document)))return false;
    FWNTElevationGrid Grid;
    if(!TestTrue(TEXT("Read actual elevation for boundary continuity"),Grid.Load(FPaths::Combine(Root,TEXT("assets/terrain/elevation.bin")),FPaths::Combine(Root,TEXT("assets/terrain/elevation.json")),Error)))return false;
    const auto Height=[&](const FVector2D& P){return AWNTTerrainActor::LandBaseMetres+FMath::Max(0.0,Grid.SampleMetres(P));};
    struct FBoundary{FVector2D A,B;TArray<int32> Owners;};
    TMap<FString,FBoundary> Boundaries;TArray<TArray<FWNTGeographicTriangle>> Surfaces;Surfaces.SetNum(3);
    const TArray<FString> Ids{TEXT("c220"),TEXT("c325"),TEXT("ne_CHE")};
    const auto Geometries=Document->GetObjectField(TEXT("geometry"));
    for(int32 Owner=0;Owner<Ids.Num();++Owner)
    {
        const auto Geometry=Geometries->GetObjectField(Ids[Owner]);
        const auto& Coordinates=Geometry->GetArrayField(TEXT("coordinates"));TArray<TArray<TSharedPtr<FJsonValue>>> Polygons;
        if(Geometry->GetStringField(TEXT("type"))==TEXT("Polygon"))Polygons.Add(Coordinates);
        else for(const auto& P:Coordinates)Polygons.Add(P->AsArray());
        for(const auto& Polygon:Polygons)
        {
            TArray<TArray<FVector2D>> Rings;FBox2D Bounds(ForceInit);
            for(const auto& RingValue:Polygon)
            {
                TArray<FVector2D> Ring;
                for(const auto& Value:RingValue->AsArray()){const auto& XY=Value->AsArray();Ring.Add(FVector2D(XY[0]->AsNumber(),XY[1]->AsNumber()));}
                if(Rings.IsEmpty())for(const auto& P:Ring)Bounds+=P;Rings.Add(MoveTemp(Ring));
            }
            if(Bounds.Max.X<6.6||Bounds.Min.X>8.4||Bounds.Max.Y<45.5||Bounds.Min.Y>46.5)continue;
            TArray<FWNTGeographicTriangle> Coarse;
            if(!TestTrue(TEXT("Triangulate actual Alpine country ")+Ids[Owner],WNTTerrainGeometry::TriangulatePolygon(Rings,Coarse,Error)))return false;
            for(const auto& T:Coarse)
            {
                if(FMath::Max3(T.A.X,T.B.X,T.C.X)<6.6||FMath::Min3(T.A.X,T.B.X,T.C.X)>8.4||FMath::Max3(T.A.Y,T.B.Y,T.C.Y)<45.5||FMath::Min3(T.A.Y,T.B.Y,T.C.Y)>46.5)continue;
                Surfaces[Owner].Append(WNTTerrainGeometry::SubdivideSurface(T,.5));
            }
            for(const auto& Ring:Rings)for(int32 I=0;I+1<Ring.Num();++I)
            {
                const FVector2D A=Ring[I],B=Ring[I+1],Mid=(A+B)*.5;
                if(Mid.X<=6.6||Mid.X>=8.4||Mid.Y<=45.5||Mid.Y>=46.5)continue;
                const FString KA=FString::Printf(TEXT("%.9f,%.9f"),A.X,A.Y),KB=FString::Printf(TEXT("%.9f,%.9f"),B.X,B.Y);
                const FString Key=KA<KB?KA+TEXT(":")+KB:KB+TEXT(":")+KA;
                auto& Edge=Boundaries.FindOrAdd(Key);Edge.A=A;Edge.B=B;Edge.Owners.AddUnique(Owner);
            }
        }
    }
    auto SurfaceHeight=[&](const FVector2D& P,int32 Owner,double& Out)
    {
        for(const auto& T:Surfaces[Owner])
        {
            const FVector2D U=T.B-T.A,V=T.C-T.A,W=P-T.A;const double D=U.X*V.Y-U.Y*V.X;
            if(FMath::Abs(D)<1e-14)continue;
            const double B=(W.X*V.Y-W.Y*V.X)/D,C=(U.X*W.Y-U.Y*W.X)/D;
            if(B>=-1e-8&&C>=-1e-8&&B+C<=1+1e-8){Out=(1-B-C)*Height(T.A)+B*Height(T.B)+C*Height(T.C);return true;}
        }
        return false;
    };
    TestTrue(TEXT("Fixture includes many exact shared Alpine boundary edges"),Boundaries.Num()>20);
    int32 Checked=0;double MaximumDifference=0;
    for(const auto& Pair:Boundaries)
    {
        const auto& Edge=Pair.Value;
        if(!TestEqual(TEXT("Every Alpine boundary has two exactly matching country owners"),Edge.Owners.Num(),2))return false;
        const auto Points=WNTTerrainGeometry::SplitSurfaceEdge(Edge.A,Edge.B,.5);
        const auto Reverse=WNTTerrainGeometry::SplitSurfaceEdge(Edge.B,Edge.A,.5);
        TestEqual(TEXT("Reversing a shared edge keeps its split count"),Points.Num(),Reverse.Num());
        for(int32 I=0;I<Points.Num();++I)TestTrue(TEXT("Shared edge split positions coincide in either orientation"),Points[I].Equals(Reverse[Reverse.Num()-1-I],1e-10));
        for(int32 I=0;I+1<Points.Num();++I)for(double Fraction:{.2,.5,.8})
        {
            const FVector2D P=FMath::Lerp(Points[I],Points[I+1],Fraction);
            const double Expected=FMath::Lerp(Height(Points[I]),Height(Points[I+1]),Fraction);
            for(int32 Owner:Edge.Owners)
            {
                double Actual=0;
                if(!TestTrue(TEXT("Both actual tessellated country surfaces cover their shared border"),SurfaceHeight(P,Owner,Actual)))return false;
                MaximumDifference=FMath::Max(MaximumDifference,FMath::Abs(Expected-Actual));++Checked;
            }
        }
    }
    TestTrue(TEXT("Real source elevation agrees across both tessellated sides within one millimetre"),Checked>100&&MaximumDifference<.001);
    AddInfo(FString::Printf(TEXT("Checked %d real shared-edge samples; maximum vertical mismatch %.9f metres"),Checked,MaximumDifference));
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTElevationDataTest,"WNT.Geography.OfflineElevation",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTElevationDataTest::RunTest(const FString& Parameters)
{
    FWNTElevationGrid Grid;FString Error;const FString Root=DataRoot();
    const bool Loaded=Grid.Load(FPaths::Combine(Root,TEXT("assets/terrain/elevation.bin")),FPaths::Combine(Root,TEXT("assets/terrain/elevation.json")),Error);
    TestTrue(TEXT("Real NOAA raster loads from native data root: ")+Error,Loaded);if(!Loaded)return false;
    TestEqual(TEXT("Width"),Grid.GetWidth(),1440);TestEqual(TEXT("Height"),Grid.GetHeight(),720);
    TestTrue(TEXT("Signed deep Pacific sample"),FMath::Abs(Grid.SampleMetres(FVector2D(-139.875,-.125))+4318)<1e-8);
    TestTrue(TEXT("Tibetan plateau sample"),FMath::Abs(Grid.SampleMetres(FVector2D(87.125,31.875))-4640)<1e-8);
    TestTrue(TEXT("Andes sample"),FMath::Abs(Grid.SampleMetres(FVector2D(-67.875,-20.125))-3654)<1e-8);
    for(double Lat:{-90.0,-40.0,0.0,40.0,90.0})
    {
        TestTrue(TEXT("Longitude wraps continuously"),FMath::Abs(Grid.SampleMetres(FVector2D(-180,Lat))-Grid.SampleMetres(FVector2D(180,Lat)))<1e-9);
        TestTrue(TEXT("Any number of complete turns leaves elevation unchanged"),FMath::Abs(Grid.SampleMetres(FVector2D(10,Lat))-Grid.SampleMetres(FVector2D(1090,Lat)))<1e-9);
    }
    TestTrue(TEXT("Polar sampling clamps north"),FMath::Abs(Grid.SampleMetres(FVector2D(20,90))-Grid.SampleMetres(FVector2D(20,89.875)))<1e-9);
    TestTrue(TEXT("Polar sampling clamps south"),FMath::Abs(Grid.SampleMetres(FVector2D(20,-90))-Grid.SampleMetres(FVector2D(20,-89.875)))<1e-9);
    return true;
}
#endif
