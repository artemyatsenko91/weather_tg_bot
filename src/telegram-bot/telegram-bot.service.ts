import { v4 as uuidv4 } from "uuid";
import { forwardRef, Inject, Injectable } from "@nestjs/common";

import { BotContext, State } from "./types/ISessionData";
import messagesData from "../data/messages.json";
import { InputCoords, InputType, ITZType } from "src/common/parseInputs";
import {
    IWeatherCityInfo,
    IWeatherInfo,
} from "src/services/weather/types/IWeatherService";
import {
    ICoordsTypes,
    IUserSettings,
} from "src/services/subscription/types/types";
import { subscriptionConfirmationMessage } from "src/data/templateMessages";

import { LocationCommandService } from "./location-command/location-command.service";
import { WeatherCommandService } from "./weather-command/weather-command.service";
import { UserSettingsService } from "src/services/user-settings/user-settings.service";
import { SubscriptionService } from "src/services/subscription/subscription.service";
import { WeatherService } from "src/services/weather/weather.service";

@Injectable()
export class TelegramService {
    constructor(
        @Inject(forwardRef(() => LocationCommandService))
        private readonly locationCommandService: LocationCommandService,
        private readonly weatherCommandService: WeatherCommandService,
        private readonly userSettingsService: UserSettingsService,
        private readonly subscriptionService: SubscriptionService,
        private readonly weatherService: WeatherService,
    ) {}
    public async switchNextState(context: BotContext) {
        const state = context.session?.state;
        let session = context.session;
        let inputData = session?.inputData;

        if (!inputData) {
            context.reply(messagesData.unknown_input);
            return;
        }

        if (!inputData.data) {
            switch (inputData.type) {
                case InputType.coords:
                    context.reply(
                        messagesData.subscription.invalid_coord_input,
                    );
                    break;
                case InputType.time:
                    context.reply(messagesData.subscription.time_input_error);
                    break;
                case InputType.zone:
                    context.reply(messagesData.subscription.time_zone_invalid);
                    break;
                default:
                    break;
            }
        }

        if (inputData.type === InputType.city) {
            const locationResponse: IWeatherCityInfo[] =
                await this.weatherService.getWeatherByCityName(
                    inputData.data as string,
                );
            switch (locationResponse.length) {
                case 0:
                    context.reply(messagesData.location.no_matches);
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
                    this.locationCommandService.generateCountriesButtonsByLocationName(
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
                    this.weatherCommandService.showWeatherByCoords(context, {
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
                await this.userSettingsService.setCoords(
                    context,
                    inputData.data as ICoordsTypes,
                );

                await this.subscriptionService.updateLocation(
                    session?.userSettings?.sub_id,
                    context.session?.userSettings,
                );
                session = {
                    ...session,
                    state: State.NEUTRAL,
                };
                context.reply(messagesData.subscription.success_edit_location);
                break;
            case State.SUB_LOCATION_INPUT:
                await this.userSettingsService.setCoords(
                    context,
                    inputData.data as ICoordsTypes,
                );
                context.session = {
                    ...context.session,
                    state: State.SUB_TIME_INPUT,
                };
                context.reply(messagesData.subscription.time_instruction);

                break;
            case State.SUB_TIME_INPUT:
                this.userSettingsService.setTime(
                    context,
                    context.session?.inputData?.data as string,
                );
                this.subscriptionService.insertOne(
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
                this.userSettingsService.setTime(
                    context,
                    context.session?.inputData?.data as string,
                );
                this.subscriptionService.updateTime(
                    context.session?.userSettings?.sub_id as string,
                    context.session?.userSettings as IUserSettings,
                    context.session?.chatId as number,
                );

                context.session = {
                    ...context.session,
                    state: State.NEUTRAL,
                };
                context.reply(messagesData.subscription.success_edit_time);
                break;
            case State.SUB_TIMEZONE_INPUT:
                switch (inputData.type) {
                    case InputType.coords:
                        await this.userSettingsService.insertTimeZoneByCoords(
                            context.session?.chatId as number,
                            context.session?.inputData?.data as ICoordsTypes,
                        );
                        break;
                    default:
                        await this.userSettingsService.insertTimeZone(
                            context.session?.chatId as number,
                            context.session?.inputData?.data as ITZType,
                        );
                        break;
                }
                context.session = {
                    ...context.session,
                    state: State.SUB_LOCATION_INPUT,
                };
                this.locationCommandService.printLocationInputInstruction(
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
                                    await this.userSettingsService.updateTimeZoneByCoord(
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
                                    await this.userSettingsService.updateTimeZoneByZone(
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
                    await this.subscriptionService.updateTimeByNewTimeZone(
                        context.session?.chatId as number,
                        timeZoneDifferenceObj,
                    );
                    context.session = {
                        ...context.session,
                        state: State.NEUTRAL,
                    };
                    context.reply(messagesData.subscription.success_edit_tz);
                }
                break;
            default:
                try {
                    const wetherData: IWeatherInfo =
                        await this.weatherService.getWeatherByCoord(
                            inputData.data as ICoordsTypes,
                        );
                    this.weatherCommandService.printWeatherInfos(
                        context,
                        wetherData,
                    );
                    context.session = {
                        ...context.session,
                        state: State.NEUTRAL,
                    };
                } catch (error) {
                    this.weatherCommandService.printErrorMessage(
                        error as Error,
                        context,
                    );
                }
                break;
        }
    }
}
