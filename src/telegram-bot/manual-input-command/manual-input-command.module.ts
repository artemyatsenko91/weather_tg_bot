import { Module } from "@nestjs/common";
import { ManualInputCommandController } from "./manual-input-command.controller";
import { ManualInputCommandService } from "./manual-input-command.service";
import { TelegramService } from "../telegram-bot.service";
import { LocationCommandService } from "../location-command/location-command.service";
import { WeatherCommandService } from "../weather-command/weather-command.service";
import { UserSettingsModule } from "src/services/user-settings/user-settings.module";
import { SubscriptionModule } from "src/services/subscription/subscription.module";
import { WeatherService } from "src/services/weather/weather.service";

@Module({
    imports: [UserSettingsModule, SubscriptionModule],
    providers: [
        ManualInputCommandController,
        ManualInputCommandService,
        LocationCommandService,
        WeatherCommandService,
        TelegramService,
        WeatherService,
    ],
})
export class ManualInputCommandModule {}
