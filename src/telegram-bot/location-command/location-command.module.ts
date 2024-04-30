import { forwardRef, Module } from "@nestjs/common";
import { LocationCommandController } from "./location-command.controller";
import { LocationCommandService } from "./location-command.service";
import { TelegramService } from "../telegram-bot.service";
import { TelegramModule } from "../telegram-bot.module";
import { WeatherCommandService } from "../weather-command/weather-command.service";
import { UserSettingsModule } from "src/services/user-settings/user-settings.module";
import { SubscriptionModule } from "src/services/subscription/subscription.module";
import { WeatherModule } from "src/services/weather/weather.module";

@Module({
    imports: [
        UserSettingsModule,
        forwardRef(() => TelegramModule),
        SubscriptionModule,
        WeatherModule,
    ],
    providers: [
        LocationCommandService,
        LocationCommandController,
        TelegramService,
        WeatherCommandService,
    ],
    exports: [LocationCommandService],
})
export class LocationCommandModule {}
