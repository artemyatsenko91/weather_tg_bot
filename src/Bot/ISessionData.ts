import { IUserSettings } from "../services/SubscriptionService/types";
import { InputData } from "./common/parseInput";

export interface SessionData {
    state?: State;
    inputData?: InputData;
    userSettings?: IUserSettings;
    chatId?: number;
}

export enum State {
    DELETE_SUB = "DELETE_SUB",
    LOCATION_INPUT = "LOCATION_INPUT",
    SUB_LOCATION_INPUT = "SUB_LOCATION_INPUT",
    SUB_TIMEZONE_INPUT = "SUB_TIMEZONE_INPUT",
    SUB_EDIT_LOCATION_INPUT = "SUB_EDIT_LOCATION_INPUT",
    SUB_TIME_INPUT = "SUB_TIME_INPUT",
    SUB_EDIT_TIME_INPUT = "SUB_EDIT_TIME_INPUT",
    SUB_EDIT_TIMEZONE_INPUT = "SUB_EDIT_TIMEZONE_INPUT",
    NEUTRAL = "NEUTRAL",
}
