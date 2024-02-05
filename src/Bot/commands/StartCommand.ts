import { Markup } from "telegraf";

import { ICommand } from "./ICommand";
import { BotContext } from "../Bot";
import { IMessages } from "../../data/IMessages";
import messagesData from "../../data/messages.json";

export class StartCommand extends ICommand {
    public command = "/start";
    private messages: IMessages = messagesData;

    handle(): void {
        this.bot.bot.start((context: BotContext) => {
            context.reply(
                this.messages.start,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            this.messages.weather_btn_text,
                            this.bot.commands.weather.command,
                        ),
                    ],
                    [
                        Markup.button.callback(
                            this.messages.sub_btn_text,
                            this.bot.commands.subscription.command,
                        ),
                    ],
                ]),
            );
            this.bot.userSettingService.setChatId(
                context,
                context.message?.from.id as number,
            );
        });
    }

    getCommandInfo() {
        return {
            command: this.command,
            description: this.messages.description_commands.start,
        };
    }
}
