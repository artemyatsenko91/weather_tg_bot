import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Subscription, SubscriptionSchema } from "./models/subscription.model";
import {
    UserSettings,
    UserSettingsSchema,
} from "../user-settings/models/user-settings.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Subscription.name, schema: SubscriptionSchema },
            { name: UserSettings.name, schema: UserSettingsSchema },
        ]),
    ],
    providers: [SubscriptionService],
    exports: [SubscriptionService],
})
export class SubscriptionModule {}
