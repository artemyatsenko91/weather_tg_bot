import { forwardRef, Inject, Injectable } from "@nestjs/common";

import messagesData from "../../data/messages.json";
import { BotContext } from "../types/ISessionData";
import { ICoordsTypes } from "src/services/subscription/types/types";
import { IWeatherInfo } from "src/services/weather/types/IWeatherService";
import { weatherMessage } from "src/data/templateMessages";
import { ILoggerService } from "src/services/LoggerService/ILoggerService";
import { LoggerServiceInstance } from "src/services/LoggerService/LoggerService";
import { WeatherError } from "src/services/weather/WeatherApiError";
import { TelegramService } from "../telegram-bot.service";
import { InputCoords, InputType } from "src/common/parseInputs";
import { WeatherService } from "src/services/weather/weather.service";

@Injectable()
export class WeatherCommandService {
    private loggerService: ILoggerService = LoggerServiceInstance;

    constructor(
        @Inject(forwardRef(() => TelegramService))
        private readonly telegramService: TelegramService,
        private readonly weatherService: WeatherService,
    ) {}

    public async showWeatherByCoords(
        context: BotContext,
        coords: ICoordsTypes,
    ) {
        try {
            const weatherData: IWeatherInfo =
                await this.weatherService.getWeatherByCoord(coords);
            this.printWeatherInfos(context, weatherData);
        } catch (error) {
            context.reply((error as Error).message);
        }
    }

    public printWeatherInfos(context: BotContext, data: IWeatherInfo) {
        context.reply(
            weatherMessage(
                data.name,
                data.weather[0].description,
                data.main.temp,
                data.main.feels_like,
                data.wind.speed,
            ),
        );
    }

    public printErrorMessage(error: Error, context: BotContext) {
        this.loggerService.error(error.message);
        if (error instanceof WeatherError) {
            context.reply(messagesData.error.service);
        } else {
            context.reply(messagesData.error.unknown);
        }
    }

    public async updateState(context: BotContext, contextQuery: string) {
        const parsedContextQuery = contextQuery.split(" ");
        const latitude: number = +parsedContextQuery[1];
        const longitude: number = +parsedContextQuery[2];

        const coords = {
            latitude,
            longitude,
        } as ICoordsTypes;

        context.session = {
            ...context.session,
            inputData: {
                type: InputType.coords,
                data: coords as InputCoords,
            },
        };

        await this.telegramService.switchNextState(context);
    }
}
