import { Module } from "@nestjs/common";
import { WeatherCommandService } from "./weather-command.service";
import { WeatherCommandController } from "./weather-command.controller";
import { LocationCommandModule } from "../location-command/location-command.module";
import { TelegramService } from "../telegram-bot.service";
import { SubscriptionModule } from "src/services/subscription/subscription.module";
import { UserSettingsModule } from "src/services/user-settings/user-settings.module";
import { WeatherModule } from "src/services/weather/weather.module";

@Module({
    imports: [
        LocationCommandModule,
        SubscriptionModule,
        UserSettingsModule,
        WeatherModule,
    ],
    providers: [
        WeatherCommandService,
        WeatherCommandController,
        TelegramService,
    ],
    exports: [WeatherCommandService],
})
export class WeatherCommandModule {}
