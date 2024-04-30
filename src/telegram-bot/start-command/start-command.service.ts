import { Injectable } from "@nestjs/common";

import messagesData from "../../data/messages.json";
import { BotContext } from "../types/ISessionData";
import { Markup } from "telegraf";
import { weatherCommand } from "../weather-command/weather-command.controller";
import { subscriptionCommand } from "../subscription-command/subscription-command.controller";
import { UserSettingsService } from "src/services/user-settings/user-settings.service";
import { LoggerServiceInstance } from "src/services/LoggerService/LoggerService";

@Injectable()
export class StartCommandService {
    constructor(private readonly userSettingsService: UserSettingsService) {}

    public printStartMessage(context: BotContext) {
        context.reply(
            messagesData.start,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        messagesData.weather_btn_text,
                        weatherCommand,
                    ),
                ],
                [
                    Markup.button.callback(
                        messagesData.sub_btn_text,
                        subscriptionCommand,
                    ),
                ],
            ]),
        );
        this.userSettingsService.setChatId(context, context.message?.from.id);
        LoggerServiceInstance.info("Bot was started");
    }
}
