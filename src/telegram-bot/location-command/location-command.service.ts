import { Injectable } from "@nestjs/common";
import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

import messagesData from "../../data/messages.json";
import { BotContext } from "../types/ISessionData";
import { ICoordsTypes } from "src/services/subscription/types/types";
import { InputCoords, InputType } from "src/common/parseInputs";
import { TelegramService } from "../telegram-bot.service";
import { IWeatherCityInfo } from "src/services/weather/types/IWeatherService";
import { generateCountriesButtons } from "src/common/generateInlineButtons";
import { locationCommand } from "./location-command.controller";

@Injectable()
export class LocationCommandService {
    constructor(private readonly telegramService: TelegramService) {}
    public async printLocationInputInstruction(context: BotContext) {
        context.reply(
            messagesData.location.input_city_instruction,
            Markup.keyboard([
                [
                    Markup.button.locationRequest(
                        messagesData.geo_callback_btn_text,
                    ),
                ],
            ])
                .resize()
                .oneTime(),
        );
    }

    public async transferToMediator(context: BotContext, coord: ICoordsTypes) {
        context.session = {
            ...context.session,
            inputData: {
                type: InputType.coords,
                data: coord as InputCoords,
            },
        };

        await this.telegramService.switchNextState(context);
    }

    public generateCountriesButtonsByLocationName(
        context: BotContext,
        locationResponse: IWeatherCityInfo[],
    ) {
        const buttons: InlineKeyboardButton[][] = generateCountriesButtons(
            locationResponse,
            locationCommand,
        );
        context.reply(
            messagesData.location.clarification_of_choice,
            Markup.inlineKeyboard(buttons),
        );
    }
}
