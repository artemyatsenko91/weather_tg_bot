import { Module } from "@nestjs/common";
import { UserSettingsService } from "./user-settings.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSettings, UserSettingsSchema } from "./models/user-settings.model";
import { WeatherModule } from "../weather/weather.module";
import { TimeZoneService } from "../time-zone/time-zone.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserSettings.name, schema: UserSettingsSchema },
        ]),
        WeatherModule,
    ],
    providers: [UserSettingsService, TimeZoneService],
    exports: [UserSettingsService],
})
export class UserSettingsModule {}
