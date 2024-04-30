import { Module } from "@nestjs/common";
import { StartCommandService } from "./start-command.service";
import { StartCommandController } from "./start-command.controller";
import { WeatherCommandModule } from "../weather-command/weather-command.module";
import { UserSettingsModule } from "src/services/user-settings/user-settings.module";

@Module({
    imports: [WeatherCommandModule, UserSettingsModule],
    providers: [StartCommandController, StartCommandService],
})
export class StartCommandModule {}
