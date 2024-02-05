import { CronJob } from "cron";
import {
    GetSubscriptionsReturnType,
    ICoordsTypes,
} from "./SubscriptionService/types";
import { Subscription } from "../model/subscriptionModel";
import { IWeatherInfo } from "./WeatherService/IWeatherInfo";
import { weatherMessage } from "../data/templateMessages";
import { Bot } from "../Bot/Bot";

export class CronService {
    private job: CronJob;
    private bot!: Bot;

    constructor(bot: Bot) {
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
        this.bot = bot;
    }

    private onTick = async () => {
        const Time = new Date().toUTCString();
        const currentTime = Time.split(" ")[4].slice(0, 5);
        const response: GetSubscriptionsReturnType = await Subscription.find({
            time: currentTime,
        });
        response.forEach(async (sub) => {
            if (sub.time === currentTime) {
                const weatherData: IWeatherInfo =
                    await this.bot.weather.getWeatherByCoord(
                        sub.coords as ICoordsTypes,
                    );
                this.bot.bot.telegram.sendMessage(
                    +sub.chatId,
                    weatherMessage(
                        weatherData.name,
                        weatherData.weather[0].description,
                        weatherData.main.temp,
                        weatherData.main.feels_like,
                        weatherData.wind.speed,
                    ),
                );
            }
        });
    };

    public init() {
        this.job.start();
    }
}
