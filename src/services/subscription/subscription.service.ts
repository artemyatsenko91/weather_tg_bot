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
import { UserSettingsService } from "../user-settings/user-settings.service";

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectModel(Subscription.name)
        private readonly subscription: Model<SubscriptionDocument>,
        @InjectModel(UserSettings.name)
        private readonly userSettings: Model<UserSettingsDocument>,
        private readonly userSettingsService: UserSettingsService,
    ) {}

    public async insertOne(
        userSettingsData: IUserSettings,
        chatId: number,
        uuid: string,
    ) {
        // const userOffsetResponse: IUserSettingsResponse | null =
        await this.userSettingsService.insertTimeZone(
            chatId,
            userSettingsData.utc_offset,
        );

        // const userOffset = userOffsetResponse
        //     ? userOffsetResponse.utc_offset
        //     : userSettingsData.utc_offset;

        const subscriptions: IUserSettings = {
            coords: {
                latitude: userSettingsData.coords?.latitude,
                longitude: userSettingsData.coords?.longitude,
            },
            location: userSettingsData.location,
            time: convertTimeToUTC(
                userSettingsData.time,
                userSettingsData.utc_offset,
            ),
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

    public async updateLocation(
        sub_id: string,
        userSettingsData: IUserSettings,
    ) {
        await this.subscription.updateOne(
            { sub_id },
            {
                $set: {
                    coords: userSettingsData.coords,
                    location: userSettingsData.location,
                },
            },
        );
    }

    public async updateTime(
        sub_id: string,
        userSettingsData: IUserSettings,
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
                        userSettingsData.time,
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
