import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

import { ITZType } from "./parseInputs";
import { convertTimeToUTC } from "./convertLocalTimeToUTC";
import { IWeatherCityInfo } from "src/services/weather/types/IWeatherService";
import { SubscriptionData } from "src/services/subscription/types/types";

export const generateCountriesButtons = (
    countries: IWeatherCityInfo[],
    command: string,
): InlineKeyboardButton[][] => {
    const buttonsPerRow = 2;

    const buttons: InlineKeyboardButton[][] = countries.reduce(
        (buttonArrays, city, index) => {
            const rowIndex = Math.floor(index / buttonsPerRow);
            createButtonCallback(
                buttonArrays,
                rowIndex,
                {
                    name: city.country,
                    state: city.state ? city.state : undefined,
                },
                command,
                city.lat,
                city.lon,
            );

            return buttonArrays;
        },
        [] as InlineKeyboardButton[][],
    );

    return buttons;
};

const createButtonCallback = (
    array: InlineKeyboardButton[][],
    index: number,
    btn_text: {
        name: string;
        state?: string;
        time?: string;
    },
    command: string,
    lat?: number,
    lon?: number,
    id?: string,
) => {
    if (!array[index]) {
        array[index] = [];
    }
    const text = btn_text.state
        ? `${btn_text.name}, ${btn_text.state}`
        : btn_text.time
          ? `${btn_text.name} час ${btn_text.time}`
          : btn_text.name;
    const callbackQuery = id ? id : `${lat} ${lon}`;
    const callbackCommand = `${command} ${callbackQuery}`;
    array[index].push(Markup.button.callback(text, callbackCommand));
};

export const generateSubscriptionsButtons = (
    subscriptions: SubscriptionData[],
    edit_command: string,
    userTimeZone: ITZType,
): InlineKeyboardButton[][] => {
    const buttonsPerRow = 2;

    const buttons: InlineKeyboardButton[][] = subscriptions.reduce(
        (accum, item, index) => {
            const rowIndex = Math.floor(index / buttonsPerRow);

            createButtonCallback(
                accum,
                rowIndex,
                {
                    name: item.location as string,
                    time: convertTimeToUTC(
                        item.time as string,
                        userTimeZone as ITZType,
                        true,
                    ),
                },
                edit_command,
                undefined,
                undefined,
                item.sub_id,
            );

            return accum;
        },
        [] as InlineKeyboardButton[][],
    );

    return buttons;
};
