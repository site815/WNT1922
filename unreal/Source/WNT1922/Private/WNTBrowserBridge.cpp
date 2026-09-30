#include "WNTBrowserBridge.h"
#include "WNTPlayerController.h"
void UWNTBrowserBridge::World(const FString& Json) { if (Owner.IsValid()) Owner->Receive(TEXT("world"), Json); }
void UWNTBrowserBridge::Battle(const FString& Json) { if (Owner.IsValid()) Owner->Receive(TEXT("battle"), Json); }
void UWNTBrowserBridge::SceneInput(const FString& Json) { if (Owner.IsValid()) Owner->Receive(TEXT("input"), Json); }
void UWNTBrowserBridge::Viewport(const FString& Json) { if (Owner.IsValid()) Owner->Receive(TEXT("viewport"), Json); }
void UWNTBrowserBridge::CloseApproved(bool Saved) { if (Owner.IsValid()) Owner->CompleteClose(Saved); }
