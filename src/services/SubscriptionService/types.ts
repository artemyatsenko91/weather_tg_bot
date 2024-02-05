import { ITZType } from "../../Bot/common/parseInput";

export interface IUserSettings {
    coords?: ICoordsTypes;
    time?: string;
    utc_offset?: ITZType;
    location?: string;
    sub_id?: string;
}

export interface ICoordsTypes {
    latitude: number;
    longitude: number;
}

export interface SubscriptionData extends IUserSettings {
    chatId: string;
}

export type GetSubscriptionsReturnType = SubscriptionData[];
