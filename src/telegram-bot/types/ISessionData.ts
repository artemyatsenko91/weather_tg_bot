import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { InputData } from "src/common/parseInputs";
import { IUserSettings } from "src/services/subscription/types/types";

export interface BotContext extends Context<Update> {
    session?: SessionData;
}

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
