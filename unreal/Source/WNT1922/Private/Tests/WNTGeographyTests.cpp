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
#include "Math/Float16.h"
#include "Engine/World.h"
#include "ProceduralMeshComponent.h"
#if WITH_EDITOR
#include "Materials/Material.h"
#include "Materials/MaterialExpressionTextureBase.h"
#include "Materials/MaterialExpressionDDX.h"
#include "Materials/MaterialExpressionDDY.h"
#include "WNTVisualAssets.h"
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
        TestTrue(TEXT("Seam joins by its actual latitude-dependent repeat width"),Shift.Equals(FVector(0,WNTProjection::WrapWidthAtLatitude(Lat),0),1e-5));
    }
    TestTrue(TEXT("Equal Earth tapers toward each pole"),WNTProjection::WrapWidthAtLatitude(85)<WNTProjection::WorldWidth*.7);
    TestTrue(TEXT("Equal Earth pole northing follows the published normalized extent"),FMath::Abs(WNTProjection::PoleNorthing()/(WNTProjection::EarthRadiusMetres*100)-1.3173627591574)<1e-12);
    for(double Lat:{-80.0,-45.0,0.0,45.0,80.0})
    {
        constexpr double Step=.0001,Radians=UE_DOUBLE_PI/180.0;
        const FVector NorthA=WNTProjection::ForwardUnwrapped(FVector2D(37,Lat-Step)),NorthB=WNTProjection::ForwardUnwrapped(FVector2D(37,Lat+Step));
        const double DNorth=(NorthB.X-NorthA.X)/(2*Step*Radians),DEast=WNTProjection::EastUnitsPerDegree(Lat)/Radians;
        const double Scale=WNTProjection::EarthRadiusMetres*100;
        TestTrue(TEXT("Equal Earth local Jacobian preserves spherical area"),FMath::Abs(DNorth*DEast/(Scale*Scale)-FMath::Cos(Lat*Radians))<1e-8);
        const double DScale=(WNTProjection::EastUnitsPerDegree(Lat+Step)-WNTProjection::EastUnitsPerDegree(Lat-Step))/(NorthB.X-NorthA.X);
        TestTrue(TEXT("Shader normal derivative matches geographic projection"),FMath::Abs(DScale-WNTProjection::EastScaleDerivative(Lat))<1e-10);
        for(double From:{-179.9,0.0,179.9})for(double To:{-179.99,89.0,179.99})
        {
            const FVector P=WNTProjection::ForwardUnwrapped(FVector2D(410,Lat),5);
            const FVector Rebased=WNTProjection::ReprojectBetweenMeridians(P,From,To);
            const FVector Expected=WNTProjection::ForwardUnwrapped(FVector2D(410-WNTProjection::WrapLongitude(To-From),Lat),5);
            TestTrue(TEXT("Camera anchor rebase preserves its repeated-copy branch"),Rebased.Equals(Expected,.001));
        }
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
    FString GeographyText;TSharedPtr<FJsonObject> Geography;
    if(!TestTrue(TEXT("Read the actual Antarctica display rings"),FFileHelper::LoadFileToString(GeographyText,*FPaths::Combine(DataRoot(),TEXT("assets/maps/geometry.json")))&&FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(GeographyText),Geography)))return false;
    const auto Antarctic=Geography->GetObjectField(TEXT("geometry"))->GetObjectField(TEXT("ne_ATA"));
    TArray<FWNTGeographicTriangle> AntarcticTriangles;
    for(const auto& PolygonValue:Antarctic->GetArrayField(TEXT("coordinates")))
    {
        TArray<TArray<FVector2D>> Polygon;
        for(const auto& RingValue:PolygonValue->AsArray())
        {
            TArray<FVector2D> Ring;
            for(const auto& PointValue:RingValue->AsArray()){const auto& XY=PointValue->AsArray();Ring.Add(FVector2D(XY[0]->AsNumber(),XY[1]->AsNumber()));}
            Polygon.Add(MoveTemp(Ring));
        }
        TArray<FWNTGeographicTriangle> Part;
        if(!TestTrue(TEXT("Every actual Antarctic island and mainland ring triangulates"),WNTTerrainGeometry::TriangulatePolygon(Polygon,Part,Error)))return false;
        AntarcticTriangles.Append(Part);
        if(Polygon[0].ContainsByPredicate([](const FVector2D& P){return P.Y< -89.9;}))
        {
            const auto Unwrapped=WNTTerrainGeometry::UnwrapRing(Polygon[0]);
            FBox2D Bounds(ForceInit);for(const auto& P:Unwrapped)Bounds+=P;
            TestTrue(TEXT("Antarctic cap retains the authored dateline closure, not a peninsula cut"),Bounds.Min.X== -180&&Bounds.Max.X==180&&Bounds.Min.Y== -90);
            for(const FVector2D P:{FVector2D(-75,-85),FVector2D(-65,-85),FVector2D(-60,-85),FVector2D(-57.077,-85),FVector2D(-55,-85)})
            {
                bool Covered=false;for(const auto& T:Part)if(Contains(T,P)){Covered=true;break;}
                TestTrue(TEXT("Actual mainland remains present directly south of South America"),Covered);
            }
        }
    }
    for(double Meridian:{-179.999,-90.0,0.0,90.0,179.999})
    {
        TArray<FWNTGeographicTriangle> Pieces;double OriginalArea=0,WrappedArea=0;
        for(const auto& T:AntarcticTriangles){OriginalArea+=Area(T);for(const auto& C:WNTTerrainGeometry::ClipAtMeridian(T,Meridian)){Pieces.Add(C);WrappedArea+=Area(C);}}
        TestTrue(TEXT("Actual Antarctic triangulation conserves area through every moving seam"),FMath::Abs(OriginalArea-WrappedArea)<1e-6);
        for(double Longitude=-175;Longitude<180;Longitude+=10)
        {
            const FVector2D Query(WNTProjection::WrapLongitude(Longitude-Meridian),-85);
            bool Covered=false;for(const auto& T:Pieces)if(Contains(T,Query)){Covered=true;break;}
            TestTrue(TEXT("Full Antarctic interior survives every longitude and seam rotation"),Covered);
        }
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
    const double Width=WNTProjection::WrapWidthAtLatitude(37),TileWidth=Width/24.0;
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
    // UV1 + per-tile CPD0 must reproduce the same projection used by CPU picks
    // at all corners and intermediate rows, including repeated polar tiles.
    for(double Latitude:{-82.5,-52.5,-7.5,7.5,52.5,82.5})for(double Longitude:{-172.5,-7.5,7.5,172.5})
    {
        const FVector Origin=WNTProjection::ForwardUnwrapped(FVector2D(Longitude,Latitude));
        for(double Meridian:{-179.999,-90.0,0.0,90.0,179.999})for(int32 Copy=-1;Copy<=1;++Copy)
        {
            const FVector Placed=WNTTerrainGeometry::WrappedTileOrigin(Origin,Meridian,Copy);
            const double Shift=WNTTerrainGeometry::TileLongitudeShift(Origin,Meridian,Copy);
            for(double DY:{-7.5,-2.3,0.0,4.1,7.5})for(double DX:{-7.5,0.0,7.5})
            {
                const FVector2D Geo(Longitude+DX,Latitude+DY);
                const FVector Vertex=WNTProjection::ForwardUnwrapped(Geo,2500);
                const FVector2D Metadata=WNTProjection::ChartVertexMetadata(Vertex,Origin);
                const FVector Actual=Placed+Vertex-Origin+FVector(0,Metadata.X*Shift,0);
                const FVector Expected=WNTProjection::ForwardUnwrapped(FVector2D(Geo.X+Shift,Geo.Y),2500);
                TestTrue(TEXT("GPU latitude shear matches exact CPU Equal Earth on every wrapped tile"),Actual.Equals(Expected,.001));
                // Stock ProceduralMeshComponent stores UVs as half floats. Test
                // that actual path, plus float shader arithmetic and local vertices.
                const auto Packed=WNTProjection::PackChartShear(Metadata.X,Metadata.Y);
                const FVector2D UV1(FFloat16(float(Packed.UV1.X)).GetFloat(),FFloat16(float(Packed.UV1.Y)).GetFloat());
                const FVector2D UV2(FFloat16(float(Packed.UV2.X)).GetFloat(),FFloat16(float(Packed.UV2.Y)).GetFloat());
                TestTrue(TEXT("Encoded shear is finite in every half-float channel"),FMath::IsFinite(UV1.X)&&FMath::IsFinite(UV1.Y)&&FMath::IsFinite(UV2.X)&&FMath::IsFinite(UV2.Y));
                TestTrue(TEXT("Three-part half encoding preserves the longitude coefficient"),FMath::Abs(WNTProjection::DecodeChartShear(UV1,UV2)-Metadata.X)<.002);
                const float ShaderCoefficient=(float(UV1.X)*4096.0f+float(UV1.Y)*4.0f)+float(UV2.X)*4.0f;
                const FVector FloatShifted=Placed+FVector(FVector3f(Vertex-Origin))+FVector(0,ShaderCoefficient*float(Shift),0);
                TestTrue(TEXT("Actual half UV and float shader path remains within two metres at repeated polar edges"),FloatShifted.Equals(Expected,200));
                const FBox Local(Vertex-Origin,Vertex-Origin);
                const FBox Bound=WNTTerrainGeometry::ShearedLocalBounds(Local,FVector2D(Metadata.X,Metadata.X),Shift);
                TestTrue(TEXT("Displaced vertex remains inside its conservative bounds after real shader rounding"),Bound.IsInsideOrOn(FloatShifted-Placed));
            }
        }
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
        TestTrue(TEXT("Filtered grid has four to four sqrt(2) support pixels"),Width>=PixelMetres*4.0&&Width<=PixelMetres*4.0*FMath::Sqrt(2.0)+1e-7);
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTTerrainPaletteTest,"WNT.Geography.GeometricTerrainPalette",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTTerrainPaletteTest::RunTest(const FString& Parameters)
{
    const FLinearColor Neutral(.4f,.4f,.4f);
    for(double Lon:{-180.0,-112.0,-20.0,0.0,134.0,179.999})for(double Lat:{-85.0,-26.0,0.0,25.0,46.0,80.0})for(double Height:{0.0,1500.0,4500.0,6500.0})
    {
        const FLinearColor A=WNTTerrainGeometry::TerrainColour(FVector2D(Lon,Lat),Height,Neutral);
        const FLinearColor Wrapped=WNTTerrainGeometry::TerrainColour(FVector2D(Lon+720.0,Lat),Height,Neutral);
        TestTrue(TEXT("Biome/elevation colors are finite and remain in the display range"),FMath::IsFinite(A.R)&&FMath::IsFinite(A.G)&&FMath::IsFinite(A.B)&&A.R>=0&&A.R<=1&&A.G>=0&&A.G<=1&&A.B>=0&&A.B<=1&&A.A==1);
        TestTrue(TEXT("World wrapping never changes the terrain palette"),A.Equals(Wrapped,1e-6));
    }
    const FVector2D Alps(7.5,46);
    const FLinearColor Low=WNTTerrainGeometry::TerrainColour(Alps,100,Neutral),High=WNTTerrainGeometry::TerrainColour(Alps,5000,Neutral);
    TestTrue(TEXT("Actual elevation distinguishes low vegetation from pale mountain snow"),High.GetLuminance()>Low.GetLuminance()+.2);
    const FLinearColor Desert=WNTTerrainGeometry::TerrainColour(FVector2D(22,25),100,Neutral);
    const FLinearColor Forest=WNTTerrainGeometry::TerrainColour(FVector2D(-65,-5),100,Neutral);
    TestTrue(TEXT("Illustrative dry and forest regions have visibly different colors"),Desert.R>Forest.R+.10&&Forest.G>Forest.R);
    const FLinearColor Dark=WNTTerrainGeometry::TerrainColour(Alps,1500,FLinearColor::Black),Bright=WNTTerrainGeometry::TerrainColour(Alps,1500,FLinearColor::White);
    TestTrue(TEXT("Temperate political ownership is readable while retaining most physical terrain color"),FMath::Abs(Bright.R-Dark.R-.42f)<1e-6f&&FMath::Abs(Bright.G-Dark.G-.42f)<1e-6f&&FMath::Abs(Bright.B-Dark.B-.42f)<1e-6f);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTChartReliefAndRibbonTest,"WNT.Geography.ReliefAndRibbonShaderReference",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTChartReliefAndRibbonTest::RunTest(const FString& Parameters)
{
    double Previous=1.;
    for(double Distance:{0.,100000.,10000000.,20000000.,50000000.,100000000.,5000000000.})
    {
        const double Scale=WNTTerrainGeometry::ReliefScaleForDistance(Distance);
        TestTrue(TEXT("Relief smoothly increases within a restrained 1x to 6x range"),Scale>=Previous&&Scale<=6.);Previous=Scale;
    }
    TestEqual(TEXT("Ship-scale elevation retains actual metres"),WNTTerrainGeometry::ReliefScaleForDistance(200000.),1.);
    TestEqual(TEXT("Strategic relief is explicitly emphasized"),WNTTerrainGeometry::ReliefScaleForDistance(100000000.),6.);
    for(double Latitude:{-89.,-60.,0.,45.,89.})for(double Shift:{-720.,-179.,0.,179.,720.})
        for(double Width:{400.,10000.,256000.})for(const FVector2D Side:{FVector2D(.5,0),FVector2D(0,1.25),FVector2D(.75,1.)})
    {
        const FVector Origin=WNTProjection::ForwardUnwrapped(FVector2D(15,Latitude*.9));
        const FVector Centre=WNTProjection::ForwardUnwrapped(FVector2D(20,Latitude),2400.);
        const auto Metadata=WNTProjection::ChartVertexMetadata(Centre,Origin);
        const FVector Offset(Side.X*10000.,Side.Y*10000.,0);
        const FVector A=Centre+Offset+WNTTerrainGeometry::RibbonDisplacement(Side,Metadata,Width,Shift);
        const FVector B=Centre-Offset+WNTTerrainGeometry::RibbonDisplacement(-Side,Metadata,Width,Shift);
        TestTrue(TEXT("Width changes preserve exact geographic centerline under arbitrary wrapping"),((A+B)*.5).Equals(Centre+FVector(0,Metadata.X*Shift,0),.0001));
        const FVector2D Half=Side*Width*100.;
        TestTrue(TEXT("Ribbon support follows the projection differential"),(A-B).Equals(FVector(Half.X*2.,(Half.Y+Shift*Metadata.Y*Half.X)*2.,0),.0001));
        const FBox Bounds=WNTTerrainGeometry::ShearedLocalBounds(FBox(Centre-Origin, Centre-Origin),FVector2D(Metadata.X,Metadata.X),Shift)
            .ExpandBy(FVector(Width*125.,Width*125.*(1.+.014*FMath::Abs(Shift)),0));
        TestTrue(TEXT("Conservative bounds contain even the widest polar/front ribbon"),Bounds.IsInsideOrOn(A-Origin)&&Bounds.IsInsideOrOn(B-Origin));
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCampaignLineTest,"WNT.Geography.StrategicCampaignFrontClipping",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCampaignLineTest::RunTest(const FString& Parameters)
{
    const TArray<TArray<FVector2D>> Rings{{FVector2D(-5,-5),FVector2D(5,-5),FVector2D(5,5),FVector2D(-5,5)},
        {FVector2D(-1,-1),FVector2D(-1,1),FVector2D(1,1),FVector2D(1,-1)}};
    const auto Segments=WNTTerrainGeometry::CampaignFrontSegments(Rings,FVector2D(-10,0),FVector2D(10,0),.5);
    TestEqual(TEXT("Campaign line respects the territory's inland-water hole"),Segments.Num(),2);
    double Length=0;for(const auto& Segment:Segments)
    {
        TestTrue(TEXT("Front is at exactly the recorded progress cross-section"),FMath::Abs(Segment.Key.X)<1e-8&&FMath::Abs(Segment.Value.X)<1e-8);
        TestTrue(TEXT("Both line pieces stop at geography boundaries"),FMath::Abs(Segment.Key.Y)>=1&&FMath::Abs(Segment.Value.Y)>=1);
        Length+=FVector2D::Distance(Segment.Key,Segment.Value);
    }
    TestTrue(TEXT("No invented line crosses the excluded central lake"),FMath::IsNearlyEqual(Length,8.,1e-8));
    const auto Advanced=WNTTerrainGeometry::CampaignFrontSegments(Rings,FVector2D(-10,0),FVector2D(10,0),.65);
    TestEqual(TEXT("Progress moves to the next continuous land cross-section"),Advanced.Num(),1);
    if(!Advanced.IsEmpty())TestTrue(TEXT("Advancing front follows progress rather than a fixed country border"),FMath::IsNearlyEqual(Advanced[0].Key.X,3.,1e-8));
    const TArray<TArray<FVector2D>> Dateline{{FVector2D(179,-2),FVector2D(-179,-2),FVector2D(-179,2),FVector2D(179,2)}};
    const auto Wrapped=WNTTerrainGeometry::CampaignFrontSegments(Dateline,FVector2D(178,0),FVector2D(-178,0),.5);
    TestEqual(TEXT("Dateline front clips through one contiguous repeated territory"),Wrapped.Num(),1);
    if(!Wrapped.IsEmpty())TestTrue(TEXT("Date line is not an artificial front endpoint"),FMath::IsNearlyEqual(FMath::Abs(Wrapped[0].Key.X),180.,1e-8)&&FMath::IsNearlyEqual(FVector2D::Distance(Wrapped[0].Key,Wrapped[0].Value),4.,1e-8));
    for(double Progress:{0.,1.,-1.,2.})TestEqual(TEXT("Resolved/invalid progress cannot draw ongoing battle lines"),WNTTerrainGeometry::CampaignFrontSegments(Rings,FVector2D(-10,0),FVector2D(10,0),Progress).Num(),0);
    TestEqual(TEXT("Missing direction cannot invent a troop boundary"),WNTTerrainGeometry::CampaignFrontSegments(Rings,FVector2D::ZeroVector,FVector2D::ZeroVector,.5).Num(),0);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTPoliticalLineIntegrationTest,"WNT.Geography.ActualPoliticalBordersAndCampaignFronts",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTPoliticalLineIntegrationTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Political geography test world"),World))return false;
    auto* Terrain=World->SpawnActor<AWNTTerrainActor>();
    if(!TestNotNull(TEXT("Political geography actor"),Terrain)||!TestTrue(TEXT("Actual campaign terrain and prepared line materials load"),Terrain->Initialize(DataRoot())))
    {World->DestroyWorld(false);return false;}
    const auto Before=Terrain->GetMapStyleDiagnostics();
    TestTrue(TEXT("Actual shared country boundaries are drawn"),Before->GetNumberField(TEXT("countryBorderSegments"))>500);
    TestTrue(TEXT("Actual coastline has separate readable linework"),Before->GetNumberField(TEXT("coastlineSegments"))>1000);
    TestTrue(TEXT("Thirty-degree batching stays within216 terrain components"),Before->GetNumberField(TEXT("terrainComponents"))>0&&Before->GetNumberField(TEXT("terrainComponents"))<=216);
    TArray<UProceduralMeshComponent*> Tiles;Terrain->GetComponents(Tiles);
    TMap<UProceduralMeshComponent*,const FProcMeshVertex*> LandBuffers;
    for(auto* Tile:Tiles)if(const auto* Land=Tile->GetProcMeshSection(0))LandBuffers.Add(Tile,Land->ProcVertexBuffer.GetData());
    auto CheckLand=[&]()
    {
        TArray<UProceduralMeshComponent*> Current;Terrain->GetComponents(Current);
        TestEqual(TEXT("Front/control updates create no extra terrain components"),Current.Num(),Tiles.Num());
        for(const auto& Pair:LandBuffers)
        {
            const auto* Land=Pair.Key->GetProcMeshSection(0);
            TestTrue(TEXT("Front/control changes keep exact land vertex allocations"),Land&&Pair.Value==Land->ProcVertexBuffer.GetData());
        }
    };
    TSharedPtr<FJsonObject> Front;
    const FString Json=TEXT(R"({"id":"france","from":[8,50],"to":[-4,47],"progress":0.5,"territories":["c220","c210","c211","c212"],"island":false,"status":"Contested"})");
    TestTrue(TEXT("Recorded campaign corridor fixture parses"),FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json),Front));
    if(!Front){World->DestroyWorld(false);return false;}
    const TArray<TSharedPtr<FJsonValue>> Fronts{MakeShared<FJsonValueObject>(Front)};
    Terrain->ApplyCampaignFronts(Fronts);CheckLand();
    TestTrue(TEXT("Real France geometry clips an active progress line"),Terrain->GetMapStyleDiagnostics()->GetNumberField(TEXT("campaignFrontSegments"))>0);
    auto ColourHash=[&]()
    {
        uint32 Hash=0;for(auto* Tile:Tiles)if(const auto* Land=Tile->GetProcMeshSection(0))
            for(const auto& Vertex:Land->ProcVertexBuffer)Hash=HashCombineFast(Hash,GetTypeHash(Vertex.Color));
        return Hash;
    };
    const uint32 Unoccupied=ColourHash();Front->SetStringField(TEXT("color"),TEXT("#de805b"));
    Terrain->ApplyCampaignOccupations(Fronts);CheckLand();const uint32 Partial=ColourHash();
    TestTrue(TEXT("Saved partial advance changes real land colors before whole-country capture"),Partial!=Unoccupied);
    TestEqual(TEXT("Only recorded front territories have occupation masks"),Terrain->GetMapStyleDiagnostics()->GetNumberField(TEXT("partiallyOccupiedTerritories")),4.);
    const double Updates=Terrain->GetMapStyleDiagnostics()->GetNumberField(TEXT("occupationColourUpdates"));
    Terrain->ApplyCampaignOccupations(Fronts);
    TestEqual(TEXT("Identical camera/world packets never upload occupation colors"),Terrain->GetMapStyleDiagnostics()->GetNumberField(TEXT("occupationColourUpdates")),Updates);
    Front->SetNumberField(TEXT("progress"),.8);Terrain->ApplyCampaignOccupations(Fronts);CheckLand();
    TestTrue(TEXT("Further recorded progress moves occupation coloring"),ColourHash()!=Partial);
    Terrain->ApplyCampaignOccupations({});CheckLand();
    TestEqual(TEXT("Removing partial occupation restores previous political shading"),ColourHash(),Unoccupied);
    Front->SetNumberField(TEXT("progress"),.5);
    TMap<UProceduralMeshComponent*,const FProcMeshVertex*> FrontBuffers;
    for(auto* Tile:Tiles)if(const auto* Line=Tile->GetProcMeshSection(4))if(!Line->ProcVertexBuffer.IsEmpty())FrontBuffers.Add(Tile,Line->ProcVertexBuffer.GetData());
    TestTrue(TEXT("Campaign lines have actual mesh sections"),!FrontBuffers.IsEmpty());
    Terrain->ApplyCampaignFronts(Fronts);
    struct FImmutableRibbon{UProceduralMeshComponent* Tile;int32 Index;const FProcMeshVertex* Buffer;uint32 Fingerprint;};
    TArray<FImmutableRibbon> Ribbons;
    for(auto* Tile:Tiles)for(int32 Index:{2,3,4})if(const auto* Section=Tile->GetProcMeshSection(Index))
        if(!Section->ProcVertexBuffer.IsEmpty())Ribbons.Add({Tile,Index,Section->ProcVertexBuffer.GetData(),
            FCrc::MemCrc32(Section->ProcVertexBuffer.GetData(),Section->ProcVertexBuffer.Num()*sizeof(FProcMeshVertex))});
    const FVector2D Mountain(87.125,31.875);Terrain->SetViewDistance(100000.);
    const double RealHeight=Terrain->RenderHeightAt(Mountain);
    Terrain->SetViewDistance(100000000.);
    TestTrue(TEXT("Camera/picking terrain height matches shader relief exactly"),FMath::Abs(Terrain->RenderHeightAt(Mountain)-RealHeight*6.)<1e-7);
    // Same real source mesh, forced original lookup versus the bounded face
    // cache. The dense sweeps cross coastlines, political edges and the seam.
    int32 CachedComparisons=0;double CacheDifference=0;
    for(double TestMeridian:{0.,147.,-179.9})for(double Distance:{100000.,100000000.})
    {
        Terrain->SetCentralMeridian(TestMeridian);Terrain->SetViewDistance(Distance);
        for(const FVector2D Centre:{FVector2D(7.5,46.),FVector2D(18.43,-33.93),FVector2D(135.19,34.65),
            FVector2D(179.99,-16.5),FVector2D(-179.99,66.),FVector2D(87.125,31.875),FVector2D(37.,5.)})
            for(int32 X=-4;X<=4;++X)for(int32 Y=-4;Y<=4;++Y)
        {
            const FVector2D Point(WNTProjection::WrapLongitude(Centre.X+X*.014),Centre.Y+Y*.014);
            const double Expected=Terrain->RenderHeightAt(Point,false);
            CacheDifference=FMath::Max(CacheDifference,FMath::Abs(Terrain->RenderHeightAt(Point)-Expected));
            CacheDifference=FMath::Max(CacheDifference,FMath::Abs(Terrain->RenderHeightAt(Point)-Expected));
            ++CachedComparisons;
        }
    }
    TestTrue(TEXT("Cached ground queries preserve actual coast, shared-border, wrap and relief answers"),CachedComparisons>3000&&CacheDifference<.000001);
    TestTrue(TEXT("Repeated real geographic queries exercise cached projected faces"),Terrain->GetMapStyleDiagnostics()->GetNumberField(TEXT("heightCacheHits"))>100.);
    for(double Meridian:{-179.9,35.,179.9})
    {
        Terrain->SetCentralMeridian(Meridian);
        Terrain->SetGraticulePixelSize((Meridian+180.)*100000.+10000.);
        for(const auto& Ribbon:Ribbons)
        {
            const auto* Section=Ribbon.Tile->GetProcMeshSection(Ribbon.Index);
            TestTrue(TEXT("Zoom and pan retain exact ribbon allocation and every vertex byte"),Section&&Section->ProcVertexBuffer.GetData()==Ribbon.Buffer
                &&FCrc::MemCrc32(Section->ProcVertexBuffer.GetData(),Section->ProcVertexBuffer.Num()*sizeof(FProcMeshVertex))==Ribbon.Fingerprint);
            const auto& CPD=Ribbon.Tile->GetCustomPrimitiveData().Data;
            TestTrue(TEXT("Actual native primitive passes zoom width and relief to shader"),CPD.Num()>=3&&CPD[1]>0&&CPD[2]==6.);
        }
        for(const auto& Pair:FrontBuffers)TestTrue(TEXT("Unchanged packets and longitude panning never rebuild front buffers"),Pair.Key->GetProcMeshSection(4)->ProcVertexBuffer.GetData()==Pair.Value);
    }
    Front->SetNumberField(TEXT("progress"),.65);Terrain->ApplyCampaignFronts(Fronts);CheckLand();
    TMap<FString,FLinearColor> Control;Control.Add(TEXT("c220"),FLinearColor(FColor::FromHex(TEXT("#70b9ee"))));
    Terrain->SetControl(Control);CheckLand();
    Front->SetStringField(TEXT("status"),TEXT("Ceasefire"));Terrain->ApplyCampaignFronts(Fronts);CheckLand();
    TestEqual(TEXT("A ceasefire clears its battle line immediately"),Terrain->GetMapStyleDiagnostics()->GetNumberField(TEXT("campaignFrontSegments")),0.);
    for(auto* Tile:Tiles)if(const auto* Line=Tile->GetProcMeshSection(4))TestTrue(TEXT("No stale campaign geometry remains after ceasefire"),Line->ProcVertexBuffer.IsEmpty());
    World->DestroyWorld(false);return true;
}

#if WITH_EDITOR
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTGeometricMaterialTest,"WNT.Geography.GeometricTerrainAndFilteredGridMaterials",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTGeometricMaterialTest::RunTest(const FString& Parameters)
{
    auto* Terrain=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_TerrainSurface.M_TerrainSurface"));
    auto* Grid=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Graticule.M_Graticule"));
    if(!TestNotNull(TEXT("Prepared geometric land material"),Terrain)||!TestNotNull(TEXT("Prepared filtered geographic grid"),Grid))return false;
    TestTrue(TEXT("Land remains opaque lit geometry"),Terrain->BlendMode==BLEND_Opaque&&Terrain->GetShadingModels().HasShadingModel(MSM_DefaultLit));
    TestEqual(TEXT("Terrain loads without any external photograph directory"),WNTVisualAssets::LoadTerrainMaterial(TEXT("nonexistent-terrain-photograph-root")),static_cast<UMaterialInterface*>(Terrain));
    TestTrue(TEXT("Prepared terrain includes GPU Equal Earth displacement"),Terrain->HasVertexPositionOffsetConnected());
    TestTrue(TEXT("Prepared terrain corrects its geometric normals after projection"),Terrain->GetEditorOnlyData()->Normal.Expression!=nullptr);
    for(UMaterialExpression* Expression:Terrain->GetExpressions())
        TestFalse(TEXT("Geometric terrain has no texture sampling dependency"),Expression->IsA<UMaterialExpressionTextureBase>());
    TestTrue(TEXT("Grid is an unlit translucent chart overlay with no terrain depth fighting"),Grid->BlendMode==BLEND_Translucent&&Grid->bDisableDepthTest&&Grid->GetShadingModels().HasShadingModel(MSM_Unlit));
    TestTrue(TEXT("Grid overlay runs after temporal reconstruction and motion blur"),Grid->TranslucencyPass==MTP_AfterMotionBlur);
    TestTrue(TEXT("Prepared geographic grid shares GPU Equal Earth displacement"),Grid->HasVertexPositionOffsetConnected());
    bool HasDX=false,HasDY=false;
    for(UMaterialExpression* Expression:Grid->GetExpressions())
    {
        HasDX|=Expression->IsA<UMaterialExpressionDDX>();HasDY|=Expression->IsA<UMaterialExpressionDDY>();
        TestFalse(TEXT("Grid filtering does not load an image"),Expression->IsA<UMaterialExpressionTextureBase>());
    }
    TestTrue(TEXT("Both screen derivatives support constant-pixel line coverage"),HasDX&&HasDY);
    for(const TCHAR* Path:{TEXT("/Game/Materials/M_MapBorder.M_MapBorder"),TEXT("/Game/Materials/M_CampaignFront.M_CampaignFront")})
    {
        auto* Line=LoadObject<UMaterial>(nullptr,Path);if(!TestNotNull(TEXT("Prepared political/front line material"),Line))continue;
        TestTrue(TEXT("Political/front overlays remain depth-safe unlit filtered lines"),Line->BlendMode==BLEND_Translucent&&Line->bDisableDepthTest&&Line->GetShadingModels().HasShadingModel(MSM_Unlit)&&Line->TranslucencyPass==MTP_AfterMotionBlur);
        TestTrue(TEXT("Political/front overlays retain packed Equal Earth displacement"),Line->HasVertexPositionOffsetConnected());
        for(UMaterialExpression* Expression:Line->GetExpressions())TestFalse(TEXT("Political/front linework has no raster dependency"),Expression->IsA<UMaterialExpressionTextureBase>());
    }
    FMaterialResource Resource;Resource.SetMaterial(Grid,nullptr,SP_PCD3D_SM6,EMaterialQualityLevel::High);
    FString HLSL;
    if(!TestTrue(TEXT("Translate the actual filtered overlay graph"),Resource.GetMaterialExpressionSource(HLSL)))return false;
    TestTrue(TEXT("Generated grid shader retains screen-space filtering"),HLSL.Contains(TEXT("ddx"),ESearchCase::IgnoreCase)&&HLSL.Contains(TEXT("ddy"),ESearchCase::IgnoreCase));
    FFileHelper::SaveStringToFile(HLSL,*FPaths::Combine(FPaths::ProjectSavedDir(),TEXT("WNTGraticule.ush")));
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
    TestEqual(TEXT("Width"),Grid.GetWidth(),4320);TestEqual(TEXT("Height"),Grid.GetHeight(),2160);
    TestTrue(TEXT("Signed deep Pacific sample"),FMath::Abs(Grid.SampleMetres(FVector2D(-139.875,-.125))+4318)<1e-8);
    TestTrue(TEXT("Tibetan plateau sample"),FMath::Abs(Grid.SampleMetres(FVector2D(87.125,31.875))-4640)<1e-8);
    TestTrue(TEXT("Andes sample"),FMath::Abs(Grid.SampleMetres(FVector2D(-67.875,-20.125))-3654)<1e-8);
    for(double Lat:{-90.0,-40.0,0.0,40.0,90.0})
    {
        TestTrue(TEXT("Longitude wraps continuously"),FMath::Abs(Grid.SampleMetres(FVector2D(-180,Lat))-Grid.SampleMetres(FVector2D(180,Lat)))<1e-9);
        TestTrue(TEXT("Any number of complete turns leaves elevation unchanged"),FMath::Abs(Grid.SampleMetres(FVector2D(10,Lat))-Grid.SampleMetres(FVector2D(1090,Lat)))<1e-9);
    }
    TestTrue(TEXT("Polar sampling clamps north"),FMath::Abs(Grid.SampleMetres(FVector2D(20,90))-Grid.SampleMetres(FVector2D(20,90.-1./24.)))<1e-9);
    TestTrue(TEXT("Polar sampling clamps south"),FMath::Abs(Grid.SampleMetres(FVector2D(20,-90))-Grid.SampleMetres(FVector2D(20,-90.+1./24.)))<1e-9);
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCampaignOccupationGeometryTest,"WNT.Geography.RecordedCampaignOccupation",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCampaignOccupationGeometryTest::RunTest(const FString& Parameters)
{
    for(double Shift:{-720.,0.,720.})
    {
        const FVector2D From(170.+Shift,10),To(-170.+Shift,10);
        TestTrue(TEXT("Occupation follows advancing dateline corridor"),WNTTerrainGeometry::BehindCampaignFront(FVector2D(175,10),From,To,.5));
        TestFalse(TEXT("Unreached ground retains defender color"),WNTTerrainGeometry::BehindCampaignFront(FVector2D(-175,10),From,To,.5));
        TestFalse(TEXT("Retreat restores lost ground"),WNTTerrainGeometry::BehindCampaignFront(FVector2D(175,10),From,To,.1));
    }
    TestFalse(TEXT("A repulsed front has no partial occupation"),WNTTerrainGeometry::BehindCampaignFront(FVector2D(2,0),FVector2D(0,0),FVector2D(10,0),0));
    TestTrue(TEXT("Completed front occupies its whole listed territory"),WNTTerrainGeometry::BehindCampaignFront(FVector2D(20,0),FVector2D(0,0),FVector2D(10,0),1));
    return true;
}
#endif
