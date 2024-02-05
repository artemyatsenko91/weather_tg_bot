import { convertTimeToUTC } from "../../Bot/common/convertLocalTimeToUTC";
import { ITZType } from "../../Bot/common/parseInput";
import { Subscription } from "../../model/subscriptionModel";
import { UserSettings } from "../../model/userSettingsModel";
import { IUseeSettingsResponse } from "../UserSettingService/types";
import { GetSubscriptionsReturnType, IUserSettings } from "./types";

export class SubscriptionService {
    public async insertOne(
        userSettings: IUserSettings,
        chatId: number,
        uuid: string,
    ) {
        const userOffset: IUseeSettingsResponse | null =
            await UserSettings.findOne({
                chatId,
            });
        const subscriptions: IUserSettings = {
            coords: {
                latitude: userSettings.coords?.latitude as number,
                longitude: userSettings.coords?.longitude as number,
            },
            location: userSettings.location as string,
            time: convertTimeToUTC(
                userSettings.time as string,
                userOffset?.utc_offset as ITZType,
            ),
            sub_id: uuid,
        };

        const convertedSettings = {
            chatId,
            ...subscriptions,
        };
        return await Subscription.create(convertedSettings);
    }

    public async updateTimeByNewTimeZone(
        chatId: number,
        timeZoneDifference: ITZType,
    ) {
        const subData: GetSubscriptionsReturnType =
            await this.getSubscriptions(chatId);

        for (const sub of subData) {
            const newTime = convertTimeToUTC(
                sub.time as string,
                timeZoneDifference,
            );

            await Subscription.updateOne(
                { sub_id: sub.sub_id },
                { $set: { time: newTime } },
            );
        }
    }

    public async updateLocation(sub_id: string, userSettings: IUserSettings) {
        await Subscription.updateOne(
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
        const subData: IUseeSettingsResponse | null =
            await UserSettings.findOne({
                chatId,
            });
        await Subscription.updateOne(
            { sub_id },
            {
                $set: {
                    time: convertTimeToUTC(
                        userSettings.time as string,
                        subData?.utc_offset as ITZType,
                    ),
                },
            },
        );
    }

    public async deleteSubscribe(sub_id: string, chatId: number) {
        await Subscription.deleteOne({ sub_id });

        const subData: GetSubscriptionsReturnType =
            await this.getSubscriptions(chatId);

        if (subData.length === 0) {
            await UserSettings.deleteOne({ chatId });
        }
    }

    public async getSubscriptions(
        chatId: number,
    ): Promise<GetSubscriptionsReturnType> {
        return await Subscription.find({
            chatId: chatId,
        });
    }
}
