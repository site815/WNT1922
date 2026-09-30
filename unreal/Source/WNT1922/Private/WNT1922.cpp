#include "Modules/ModuleManager.h"
#include "WNTWindowPolicy.h"
class FWNTGameModule : public FDefaultGameModuleImpl
{
    virtual void StartupModule() override
    {
        FDefaultGameModuleImpl::StartupModule();
        WNTWindowPolicy::ConfigureStartup();
    }
};
IMPLEMENT_PRIMARY_GAME_MODULE(FWNTGameModule, WNT1922, "WNT1922");
