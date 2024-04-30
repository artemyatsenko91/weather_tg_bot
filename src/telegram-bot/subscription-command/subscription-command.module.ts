import { Module } from "@nestjs/common";

import { SubscriptionCommandService } from "./subscription-command.service";
import { SubscriptionCommandController } from "./subscription-command.controller";
import { SubscriptionModule } from "src/services/subscription/subscription.module";
import { LocationCommandModule } from "../location-command/location-command.module";
import { UserSettingsModule } from "src/services/user-settings/user-settings.module";

@Module({
    imports: [SubscriptionModule, LocationCommandModule, UserSettingsModule],
    providers: [SubscriptionCommandService, SubscriptionCommandController],
    exports: [SubscriptionCommandController],
})
export class SubscriptionCommandModule {}
