import { Injectable } from "@nestjs/common";
import { CronJob } from "cron";
import { GetSubscriptionsReturnType } from "../subscription/types/types";

import { IWeatherInfo } from "../weather/types/IWeatherService";
import { weatherMessage } from "src/data/templateMessages";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { WeatherService } from "../weather/weather.service";
import { SubscriptionService } from "../subscription/subscription.service";

@Injectable()
export class SubscriptionMailingService {
    private job: CronJob;

    constructor(
        @InjectBot() private bot: Telegraf,
        private readonly weatherService: WeatherService,
        private readonly subscriptionService: SubscriptionService,
    ) {
        this.job = new CronJob(
            "* * * * *",
            this.onTick,
            null,
            false,
            null,
            null,
            null,
            0,
        );

        this.job.start();
    }

    private onTick = async () => {
        const Time = new Date().toUTCString();
        const currentTime = Time.split(" ")[4].slice(0, 5);
        const response: GetSubscriptionsReturnType =
            await this.subscriptionService.getSubscriptions({
                time: currentTime,
            });
        response.forEach(async (sub) => {
            const weatherData: IWeatherInfo =
                await this.weatherService.getWeatherByCoord(sub.coords);
            this.bot.telegram.sendMessage(
                +sub.chatId,
                weatherMessage(
                    weatherData.name,
                    weatherData.weather[0].description,
                    weatherData.main.temp,
                    weatherData.main.feels_like,
                    weatherData.wind.speed,
                ),
            );
        });
    };
}
