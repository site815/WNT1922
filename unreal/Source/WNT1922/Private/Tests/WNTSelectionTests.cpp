#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "WNTSelectionGeometry.h"
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTSelectionTest,"WNT.Input.RTSSelectionGeometry",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTSelectionTest::RunTest(const FString&)
{
    const FBox2D Hull(FVector2D(.4,.4),FVector2D(.5,.5));
    const FVector2D Padding(.01,.02);
    TestEqual(TEXT("Inside the visible hull is an exact target"),WNTSelectionGeometry::Distance(Hull,FVector2D(.45,.45),Padding),0.0);
    TestTrue(TEXT("Near miss gains a ten CSS pixel target"),WNTSelectionGeometry::Distance(Hull,FVector2D(.509,.5),Padding)<1);
    TestTrue(TEXT("Distant sea remains unselected"),WNTSelectionGeometry::Distance(Hull,FVector2D(.52,.5),Padding)>1);
    TestTrue(TEXT("Vertical radius respects normalized viewport aspect"),WNTSelectionGeometry::Distance(Hull,FVector2D(.5,.518),Padding)<1);
    TestFalse(TEXT("Invisible bounds cannot be selected"),WNTSelectionGeometry::Overlaps(Hull,FBox2D(ForceInit)));
    TestTrue(TEXT("Partial hull overlap selects the fleet"),WNTSelectionGeometry::Overlaps(Hull,FBox2D(FVector2D(.49,.49),FVector2D(.6,.6))));
    TestFalse(TEXT("Disjoint selection box excludes hull"),WNTSelectionGeometry::Overlaps(Hull,FBox2D(FVector2D(.51,.51),FVector2D(.6,.6))));
    return true;
}
#endif
