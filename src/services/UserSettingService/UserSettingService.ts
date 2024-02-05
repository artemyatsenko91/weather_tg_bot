import { BotContext } from "../../Bot/Bot";
import { State } from "../../Bot/ISessionData";
import { ITZType } from "../../Bot/common/parseInput";
import { UserSettings } from "../../model/userSettingsModel";
import { ICoordsTypes } from "../SubscriptionService/types";
import { ITimeZoneResponseTypes, TimeZoneService } from "../TimeZoneService";
import { IWeatherInfo } from "../WeatherService/IWeatherInfo";
import { WeatherService } from "../WeatherService/WetherService";
import { IUseeSettingsResponse } from "./types";

export class UserSettingsService {
    constructor(
        private readonly timeZoneService: TimeZoneService,
        private readonly weatherService: WeatherService,
    ) {}

    public async setCoords(context: BotContext, userText: ICoordsTypes) {
        const timeZoneResponse = await this.timeZoneService.getUTCOffset(
            `${userText.latitude},${userText.longitude}`,
        );
        const location = await this.getLocationName(timeZoneResponse);
        context.session = {
            ...context.session,
            userSettings: {
                ...context.session?.userSettings,
                coords: {
                    latitude: timeZoneResponse.latitude,
                    longitude: timeZoneResponse.longitude,
                },
                utc_offset: {
                    hours: +timeZoneResponse.gmt_offset,
                },
                location,
            },
        };
    }

    public async getLocationName(
        timeZoneResponse: ITimeZoneResponseTypes,
    ): Promise<string> {
        const coordsObj: ICoordsTypes = {
            latitude: timeZoneResponse.latitude,
            longitude: timeZoneResponse.longitude,
        };
        const responseLocationName: IWeatherInfo =
            await this.weatherService.getWeatherByCoord(coordsObj);
        return `${responseLocationName.name}, ${responseLocationName.sys.country}`;
    }

    public setTime(context: BotContext, time: string) {
        context.session = {
            ...context.session,
            userSettings: {
                ...context.session?.userSettings,
                time,
            },
        };
    }

    public async setChatId(context: BotContext, chatId: number) {
        context.session = {
            ...context.session,
            chatId,
        };
    }

    public async setTimeZone(
        context: BotContext,
        userText: ICoordsTypes | string | ITZType,
    ) {
        if (
            typeof userText === "object" &&
            "hours" in userText &&
            "minutes" in userText
        ) {
            context.session = {
                ...context.session,
                state: State.NEUTRAL,
                userSettings: {
                    ...context.session?.userSettings,
                    utc_offset: userText,
                },
            };
        } else {
            const timeZoneResponse = await this.timeZoneService.getUTCOffset(
                userText as string,
            );
            context.session = {
                ...context.session,
                state: State.NEUTRAL,
                userSettings: {
                    ...context.session?.userSettings,
                    utc_offset: {
                        hours: +timeZoneResponse.gmt_offset,
                    },
                },
            };
        }
    }

    public async insertTimeZone(chatId: number, utc_offset: ITZType) {
        await UserSettings.create({
            chatId,
            utc_offset,
        });
    }

    public async insertTimeZoneByCoords(chatId: number, coords: ICoordsTypes) {
        const timeZoneResponse = await this.timeZoneService.getUTCOffset(
            `${coords.latitude},${coords.longitude}`,
        );
        await UserSettings.create({
            chatId,
            utc_offset: {
                hours: timeZoneResponse.gmt_offset,
            },
        });
    }

    public async updateTimeZoneByCoord(
        chatId: number,
        coords: ICoordsTypes,
    ): Promise<number | undefined> {
        const userTimeZone: IUseeSettingsResponse | null =
            await UserSettings.findOne({
                chatId,
            });
        const timeZoneResponse = await this.timeZoneService.getUTCOffset(
            `${coords.latitude},${coords.longitude}`,
        );
        if (userTimeZone) {
            const userHours = userTimeZone.utc_offset?.hours;
            const utcOffsetHours = +timeZoneResponse.gmt_offset;

            if (userHours !== undefined && utcOffsetHours !== undefined) {
                await UserSettings.updateOne(
                    { chatId },
                    { $set: { "utc_offset.hours": utcOffsetHours } },
                );

                return utcOffsetHours - userHours;
            }
        }
    }

    public async updateTimeZoneByZone(
        chatId: number,
        zone: ITZType,
    ): Promise<number | undefined> {
        const userTimeZone: IUseeSettingsResponse | null =
            await UserSettings.findOne({
                chatId,
            });

        if (userTimeZone) {
            const userHours = userTimeZone.utc_offset?.hours;
            const utcOffsetHours = zone.hours;
            if (userHours !== undefined && utcOffsetHours !== undefined) {
                await UserSettings.updateOne(
                    { chatId },
                    { $set: { "utc_offset.hours": utcOffsetHours } },
                );

                return utcOffsetHours - userHours;
            }
        }
    }

    public async getUserSettings(
        chatId: number,
    ): Promise<IUseeSettingsResponse | null> {
        return await UserSettings.findOne({
            chatId,
        });
    }
}
