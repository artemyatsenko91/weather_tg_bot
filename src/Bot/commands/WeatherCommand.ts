import { BotContext } from "../Bot";
import { CommandInfo, ICommand } from "./ICommand";
import { IMessages } from "../../data/IMessages";
import { State } from "../ISessionData";
import { IWeatherInfo } from "../../services/WeatherService/IWeatherInfo";
import { weatherMessage } from "../../data/templateMessages";
import { WeatherError } from "../../services/WeatherService/WeatherApiError";

import messagesData from "../../data/messages.json";
import { ICoordsTypes } from "../../services/SubscriptionService/types";
import { InputCoords, InputType } from "../common/parseInput";

export class WeatherCommand extends ICommand {
    public command = "/weather";
    private messages: IMessages = messagesData;
    private commandRegExp = new RegExp(`${this.command} (.+)`);

    handle(): void {
        this.bot.bot.action(this.command, (context: BotContext) => {
            this.bot.commands.location.printLocationInputInstruction(context);

            context.session = {
                ...context.session,
                state: State.LOCATION_INPUT,
            };
        });

        this.bot.bot.action(this.commandRegExp, async (context: BotContext) => {
            const contextQuery = context.callbackQuery;

            if (contextQuery && "data" in contextQuery) {
                const parsedContextQuery = contextQuery.data.split(" ");
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

                await this.bot.mediator.switchNextState(context);
            }
        });

        this.bot.bot.command(this.command.slice(1), (context: BotContext) => {
            this.bot.commands.location.printLocationInputInstruction(context);

            context.session = {
                ...context.session,
                state: State.LOCATION_INPUT,
            };
        });
    }

    getCommandInfo(): CommandInfo {
        return {
            command: this.command,
            description: this.messages.description_commands.weather,
        };
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
        this.bot.logger.error(error.message, error);
        if (error instanceof WeatherError) {
            context.reply(this.messages.error.service);
        } else {
            context.reply(this.messages.error.unknown);
        }
    }

    public async showWeatherByCoords(
        context: BotContext,
        coords: ICoordsTypes,
    ) {
        try {
            const weatherData: IWeatherInfo =
                await this.bot.weather.getWeatherByCoord(coords);
            this.bot.commands.weather.printWeatherInfos(context, weatherData);
        } catch (error) {
            context.reply((error as Error).message);
        }
    }
}
