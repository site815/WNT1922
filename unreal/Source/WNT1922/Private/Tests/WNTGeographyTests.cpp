#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Misc/Paths.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "WNTProjection.h"
#include "WNTTerrainActor.h"

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

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTEqualEarthProjectionTest,"WNT.Geography.EqualEarthProjection",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
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
    TestFalse(TEXT("Outside outline cannot pick land"),WNTProjection::Inverse(FVector(0,1e12,0)).IsSet());
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
