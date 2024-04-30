import { Module } from "@nestjs/common";

import { TelegrafModule } from "nestjs-telegraf";
import { ConfigService } from "@nestjs/config";
import { session } from "telegraf";

import { LocationCommandModule } from "./location-command/location-command.module";
import { StartCommandModule } from "./start-command/start-command.module";
import { StartCommandService } from "./start-command/start-command.service";
import { SubscriptionCommandModule } from "./subscription-command/subscription-command.module";
import { WeatherCommandModule } from "./weather-command/weather-command.module";
import { UserSettingsModule } from "src/services/user-settings/user-settings.module";
import { ManualInputCommandModule } from "./manual-input-command/manual-input-command.module";
import { TelegramService } from "./telegram-bot.service";
import { LocationCommandService } from "./location-command/location-command.service";
import { WeatherCommandService } from "./weather-command/weather-command.service";
import { SubscriptionModule } from "src/services/subscription/subscription.module";
import { WeatherModule } from "src/services/weather/weather.module";
import { TimeZoneModule } from "src/services/time-zone/time-zone.module";

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                token: configService.get<string>("TELEGRAM_BOT_TOKEN"),
                middlewares: [session()],
            }),
        }),
        StartCommandModule,
        SubscriptionCommandModule,
        LocationCommandModule,
        WeatherCommandModule,
        ManualInputCommandModule,
        UserSettingsModule,
        SubscriptionModule,
        WeatherModule,
        TimeZoneModule,
    ],
    providers: [
        StartCommandService,
        TelegramService,
        LocationCommandService,
        WeatherCommandService,
    ],
    exports: [TelegramService],
})
export class TelegramModule {}
