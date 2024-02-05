import { ICommand } from "./ICommand";
import { BotContext } from "../Bot";
import { InputCoords, InputType } from "../common/parseInput";
import { ICoordsTypes } from "../../services/SubscriptionService/types";
import messagesData from "../../data/messages.json";
import { IMessages } from "../../data/IMessages";
import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { generateCountriesButtons } from "../common/generateInlineButtons";
import { IWeatherCityInfo } from "../../services/WeatherService/IWeatherInfo";

export class LocationCommand extends ICommand {
    public command = "/location";
    private messages: IMessages = messagesData;
    private locationRegExp = new RegExp(`${this.command} (.+)`);

    handle(): void {
        this.bot.bot.on("location", async (context: BotContext) => {
            if (context.message && "location" in context.message) {
                const coord = context.message.location;
                await this.transferToMediator(context, coord);
            }
        });

        this.bot.bot.action(
            this.locationRegExp,
            async (context: BotContext) => {
                const contextQuery = context.callbackQuery;

                if (contextQuery && "data" in contextQuery) {
                    const parsedContextQuery = contextQuery.data.split(" ");
                    const latitude: number = +parsedContextQuery[1];
                    const longitude: number = +parsedContextQuery[2];

                    const coord: ICoordsTypes = {
                        latitude,
                        longitude,
                    };

                    await this.transferToMediator(context, coord);
                }
            },
        );
    }

    private async transferToMediator(context: BotContext, coord: ICoordsTypes) {
        context.session = {
            ...context.session,
            inputData: {
                type: InputType.coords,
                data: coord as InputCoords,
            },
        };

        await this.bot.mediator.switchNextState(context);
    }

    public async printLocationInputInstruction(context: BotContext) {
        context.reply(
            this.messages.location.input_city_instruction,
            Markup.keyboard([
                [
                    Markup.button.locationRequest(
                        this.messages.geo_callback_btn_text,
                    ),
                ],
            ])
                .resize()
                .oneTime(),
        );
    }

    getCommandInfo(): null {
        return null;
    }

    public generateCountriesButtonsByLocationName(
        context: BotContext,
        locationResponse: IWeatherCityInfo[],
    ) {
        const buttons: InlineKeyboardButton[][] = generateCountriesButtons(
            locationResponse,
            this.bot.commands.location.command,
        );
        context.reply(
            this.messages.location.clarification_of_choice,
            Markup.inlineKeyboard(buttons),
        );
    }
}
