import { v4 as uuidv4 } from "uuid";

import { Bot, BotContext } from "./Bot";
import { State } from "./ISessionData";
import { InputCoords, InputType, ITZType } from "./common/parseInput";
import messagesData from "../data/messages.json";
import { IMessages } from "../data/IMessages";
import {
    ICoordsTypes,
    IUserSettings,
} from "../services/SubscriptionService/types";
import { subscriptionConfirmationMessage } from "../data/templateMessages";
import {
    IWeatherCityInfo,
    IWeatherInfo,
} from "../services/WeatherService/IWeatherInfo";

export class Mediator {
    private messages: IMessages = messagesData;

    constructor(private readonly bot: Bot) {}

    public async switchNextState(context: BotContext) {
        const state = context.session?.state;
        let session = context.session;
        let inputData = session?.inputData;

        if (!inputData) {
            context.reply(this.messages.unknown_input);
            return;
        }

        if (!inputData.data) {
            switch (inputData.type) {
                case InputType.coords:
                    context.reply(
                        this.messages.subscription.invalid_coord_input,
                    );
                    break;
                case InputType.time:
                    context.reply(this.messages.subscription.time_input_error);
                    break;
                case InputType.zone:
                    context.reply(this.messages.subscription.time_zone_invalid);
                    break;
                default:
                    break;
            }
        }

        if (inputData.type === InputType.city) {
            const locationResponse: IWeatherCityInfo[] =
                await this.bot.weather.getWeatherByCityName(
                    inputData.data as string,
                );
            switch (locationResponse.length) {
                case 0:
                    context.reply(this.messages.location.no_matches);
                    break;
                case 1:
                    {
                        const coords = {
                            latitude: locationResponse[0].lat,
                            longitude: locationResponse[0].lon,
                        } as ICoordsTypes;
                        inputData = {
                            type: InputType.coords,
                            data: coords,
                        };
                    }
                    break;
                default: {
                    this.bot.commands.location.generateCountriesButtonsByLocationName(
                        context,
                        locationResponse,
                    );
                    return;
                }
            }
        }
        switch (state) {
            case State.LOCATION_INPUT:
                {
                    const coords = inputData.data as InputCoords;
                    this.bot.commands.weather.showWeatherByCoords(context, {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    } as ICoordsTypes);
                    session = {
                        ...session,
                        state: State.NEUTRAL,
                    };
                }
                break;
            case State.SUB_EDIT_LOCATION_INPUT:
                await this.bot.userSettingService.setCoords(
                    context,
                    inputData.data as ICoordsTypes,
                );

                await this.bot.subscriptionService.updateLocation(
                    session?.userSettings?.sub_id as string,
                    context.session?.userSettings as IUserSettings,
                );
                session = {
                    ...session,
                    state: State.NEUTRAL,
                };
                context.reply(this.messages.subscription.success_edit_location);
                break;
            case State.SUB_LOCATION_INPUT:
                {
                    await this.bot.userSettingService.setCoords(
                        context,
                        inputData.data as ICoordsTypes,
                    );
                    context.session = {
                        ...context.session,
                        state: State.SUB_TIME_INPUT,
                    };
                    context.reply(this.messages.subscription.time_instruction);
                }
                break;
            case State.SUB_TIME_INPUT:
                this.bot.userSettingService.setTime(
                    context,
                    context.session?.inputData?.data as string,
                );
                this.bot.subscriptionService.insertOne(
                    context.session?.userSettings as IUserSettings,
                    context.session?.chatId as number,
                    uuidv4(),
                );
                context.session = {
                    ...context.session,
                    state: State.NEUTRAL,
                };
                context.reply(
                    subscriptionConfirmationMessage(
                        context.session?.userSettings?.time as string,
                    ),
                );
                break;
            case State.SUB_EDIT_TIME_INPUT:
                this.bot.userSettingService.setTime(
                    context,
                    context.session?.inputData?.data as string,
                );
                this.bot.subscriptionService.updateTime(
                    context.session?.userSettings?.sub_id as string,
                    context.session?.userSettings as IUserSettings,
                    context.session?.chatId as number,
                );

                context.session = {
                    ...context.session,
                    state: State.NEUTRAL,
                };
                context.reply(this.messages.subscription.success_edit_time);
                break;
            case State.SUB_TIMEZONE_INPUT:
                switch (inputData.type) {
                    case InputType.coords:
                        await this.bot.userSettingService.insertTimeZoneByCoords(
                            context.session?.chatId as number,
                            context.session?.inputData?.data as ICoordsTypes,
                        );
                        break;
                    default:
                        await this.bot.userSettingService.insertTimeZone(
                            context.session?.chatId as number,
                            context.session?.inputData?.data as ITZType,
                        );
                        break;
                }
                context.session = {
                    ...context.session,
                    state: State.SUB_LOCATION_INPUT,
                };
                this.bot.commands.location.printLocationInputInstruction(
                    context,
                );
                break;
            case State.SUB_EDIT_TIMEZONE_INPUT:
                {
                    let timeZoneDifferenceObj: ITZType;
                    switch (inputData.type) {
                        case InputType.coords:
                            {
                                const timeZoneDifference =
                                    await this.bot.userSettingService.updateTimeZoneByCoord(
                                        context.session?.chatId as number,
                                        inputData?.data as ICoordsTypes,
                                    );
                                timeZoneDifferenceObj = {
                                    hours: timeZoneDifference as number,
                                } as ITZType;
                            }

                            break;
                        default:
                            {
                                const timeZoneDifference =
                                    await this.bot.userSettingService.updateTimeZoneByZone(
                                        context.session?.chatId as number,
                                        context.session?.inputData
                                            ?.data as ITZType,
                                    );
                                timeZoneDifferenceObj = {
                                    hours: timeZoneDifference as number,
                                } as ITZType;
                            }
                            break;
                    }
                    await this.bot.subscriptionService.updateTimeByNewTimeZone(
                        context.session?.chatId as number,
                        timeZoneDifferenceObj,
                    );
                    context.session = {
                        ...context.session,
                        state: State.NEUTRAL,
                    };
                    context.reply(this.messages.subscription.success_edit_tz);
                }
                break;
            default:
                try {
                    const wetherData: IWeatherInfo =
                        await this.bot.weather.getWeatherByCoord(
                            inputData.data as ICoordsTypes,
                        );
                    this.bot.commands.weather.printWeatherInfos(
                        context,
                        wetherData,
                    );
                    context.session = {
                        ...context.session,
                        state: State.NEUTRAL,
                    };
                } catch (error) {
                    this.bot.commands.weather.printErrorMessage(
                        error as Error,
                        context,
                    );
                }
                break;
        }
    }
}
