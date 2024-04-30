import { Module } from "@nestjs/common";
import { SubscriptionMailingService } from "./cron-service.service";
import { WeatherModule } from "../weather/weather.module";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
    imports: [WeatherModule, SubscriptionModule],
    providers: [SubscriptionMailingService],
})
export class SubscriptionMailingModule {}
