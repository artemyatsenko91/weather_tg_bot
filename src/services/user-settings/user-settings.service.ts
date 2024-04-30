import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { BotContext, State } from "src/telegram-bot/types/ISessionData";
import { ICoordsTypes } from "../subscription/types/types";
import { ITZType } from "src/common/parseInputs";

import { IUserSettingsResponse } from "./types/IUserSettingsResponse";
import { IWeatherInfo } from "../weather/types/IWeatherService";
import { ITimeZoneResponseTypes } from "../time-zone/types/ITimeZoneService";
import {
    UserSettings,
    UserSettingsDocument,
} from "./models/user-settings.model";
import { WeatherService } from "../weather/weather.service";
import { TimeZoneService } from "../time-zone/time-zone.service";

@Injectable()
export class UserSettingsService {
    constructor(
        @InjectModel(UserSettings.name)
        private readonly userModel: Model<UserSettingsDocument>,
        private readonly weatherService: WeatherService,
        private readonly timeZoneService: TimeZoneService,
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
        await this.userModel.create({
            chatId,
            utc_offset,
        });
    }

    public async insertTimeZoneByCoords(chatId: number, coords: ICoordsTypes) {
        const timeZoneResponse = await this.timeZoneService.getUTCOffset(
            `${coords.latitude},${coords.longitude}`,
        );
        await this.userModel.create({
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
        const userTimeZone: IUserSettingsResponse | null =
            await this.userModel.findOne({
                chatId,
            });
        const timeZoneResponse = await this.timeZoneService.getUTCOffset(
            `${coords.latitude},${coords.longitude}`,
        );
        if (userTimeZone) {
            const userHours = userTimeZone.utc_offset?.hours;
            const utcOffsetHours = +timeZoneResponse.gmt_offset;

            if (userHours !== undefined && utcOffsetHours !== undefined) {
                await this.userModel.updateOne(
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
        const userTimeZone: IUserSettingsResponse | null =
            await this.userModel.findOne({
                chatId,
            });

        if (userTimeZone) {
            const userHours = userTimeZone.utc_offset?.hours;
            const utcOffsetHours = zone.hours;
            if (userHours !== undefined && utcOffsetHours !== undefined) {
                await this.userModel.updateOne(
                    { chatId },
                    { $set: { "utc_offset.hours": utcOffsetHours } },
                );

                return utcOffsetHours - userHours;
            }
        }
    }

    public async getUserSettings(
        chatId: number,
    ): Promise<IUserSettingsResponse | null> {
        return await this.userModel.findOne({
            chatId,
        });
    }
}
