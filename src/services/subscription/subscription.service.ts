import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
    Subscription,
    SubscriptionDocument,
} from "./models/subscription.model";
import { Model } from "mongoose";
import { GetSubscriptionsReturnType, IUserSettings } from "./types/types";
import { IUserSettingsResponse } from "../user-settings/types/IUserSettingsResponse";
import {
    UserSettings,
    UserSettingsDocument,
} from "../user-settings/models/user-settings.model";
import { convertTimeToUTC } from "src/common/convertLocalTimeToUTC";
import { ITZType } from "src/common/parseInputs";

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectModel(Subscription.name)
        private readonly subscription: Model<SubscriptionDocument>,
        @InjectModel(UserSettings.name)
        private readonly userSettings: Model<UserSettingsDocument>,
    ) {}

    public async insertOne(
        userSettings: IUserSettings,
        chatId: number,
        uuid: string,
    ) {
        const userOffset: IUserSettingsResponse | null =
            await this.userSettings.findOne({
                chatId,
            });
        const subscriptions: IUserSettings = {
            coords: {
                latitude: userSettings.coords?.latitude,
                longitude: userSettings.coords?.longitude,
            },
            location: userSettings.location,
            time: convertTimeToUTC(userSettings.time, userOffset?.utc_offset),
            sub_id: uuid,
        };

        const convertedSettings = {
            chatId,
            ...subscriptions,
        };
        return await this.subscription.create(convertedSettings);
    }

    public async updateTimeByNewTimeZone(
        chatId: number,
        timeZoneDifference: ITZType,
    ) {
        const subData: GetSubscriptionsReturnType = await this.getSubscriptions(
            { chatId },
        );

        for (const sub of subData) {
            const newTime = convertTimeToUTC(sub.time, timeZoneDifference);

            await this.subscription.updateOne(
                { sub_id: sub.sub_id },
                { $set: { time: newTime } },
            );
        }
    }

    public async updateLocation(sub_id: string, userSettings: IUserSettings) {
        await this.subscription.updateOne(
            { sub_id },
            {
                $set: {
                    coords: userSettings.coords,
                    location: userSettings.location,
                },
            },
        );
    }

    public async updateTime(
        sub_id: string,
        userSettings: IUserSettings,
        chatId: number,
    ) {
        const subData: IUserSettingsResponse | null =
            await this.userSettings.findOne({
                chatId,
            });
        await this.subscription.updateOne(
            { sub_id },
            {
                $set: {
                    time: convertTimeToUTC(
                        userSettings.time,
                        subData?.utc_offset,
                    ),
                },
            },
        );
    }

    public async deleteSubscribe(sub_id: string, chatId: number) {
        await this.subscription.deleteOne({ sub_id });

        const subData: GetSubscriptionsReturnType = await this.getSubscriptions(
            { chatId },
        );

        if (subData.length === 0) {
            await this.userSettings.deleteOne({ chatId });
        }
    }

    public async getSubscriptions(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        param: Record<string, any>,
    ): Promise<GetSubscriptionsReturnType> {
        return await this.subscription.find({
            ...param,
        });
    }
}
