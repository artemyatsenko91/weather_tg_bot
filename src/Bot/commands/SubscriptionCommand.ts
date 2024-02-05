import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

import { CommandInfo, ICommand } from "./ICommand";
import { IMessages } from "../../data/IMessages";
import { BotContext } from "../Bot";
import { State } from "../ISessionData";
import { GetSubscriptionsReturnType } from "../../services/SubscriptionService/types";
import { generateSubscriptionsButtons } from "../common/generateInlineButtons";

import messagesData from "../../data/messages.json";
import { ITZType } from "../common/parseInput";

export class SubscriptionCommand extends ICommand {
    public command = "/subscribe";
    public command_create = "/create";
    public command_edit_sub = "/edit";
    public command_edit_sub_TZ = "/edit_tz";
    public command_delete = "/delete";
    public command_edit_location_callback = "/edit_location";
    public command_edit_time_callback = "/edit_time";
    private messages: IMessages = messagesData;

    handle(): void {
        const command_edit_sub_with_query = new RegExp(
            `${this.command_edit_sub} (.+)`,
        );
        const command_delete_with_query = new RegExp(
            `${this.command_delete} (.+)`,
        );
        this.bot.bot.action(this.command, async (context: BotContext) => {
            await this.checkSubscribe(context);
        });

        this.bot.bot.action(
            this.command_edit_location_callback,
            async (context: BotContext) => {
                await this.bot.commands.location.printLocationInputInstruction(
                    context,
                );

                context.session = {
                    ...context.session,
                    state: State.SUB_EDIT_LOCATION_INPUT,
                };
            },
        );

        this.bot.bot.action(
            this.command_edit_time_callback,
            async (context: BotContext) => {
                context.reply(this.messages.subscription.time_instruction);

                context.session = {
                    ...context.session,
                    state: State.SUB_EDIT_TIME_INPUT,
                };
            },
        );

        this.bot.bot.action(
            command_edit_sub_with_query,
            async (context: BotContext) => {
                const contextQuery = context.callbackQuery;
                if (contextQuery && "data" in contextQuery) {
                    const parsedContextQuery = contextQuery.data.split(" ");
                    this.printWhatToEditMessage(context, parsedContextQuery[1]);
                }
            },
        );
        this.bot.bot.action(
            command_delete_with_query,
            async (context: BotContext) => {
                const contextQuery = context.callbackQuery;
                if (contextQuery && "data" in contextQuery) {
                    const parsedContextQuery = contextQuery.data.split(" ");

                    await this.bot.subscriptionService.deleteSubscribe(
                        parsedContextQuery[1],
                        context.session?.chatId as number,
                    );

                    context.reply(
                        this.messages.subscription.delete_confirmation_text,
                    );
                }
            },
        );

        this.bot.bot.action(
            this.command_edit_sub,
            async (context: BotContext) => {
                const buttons: InlineKeyboardButton[][] =
                    await this.generateAvailableSubscriptionsButtons(
                        context,
                        this.command_edit_sub,
                    );
                context.reply(
                    this.messages.subscription.edit_subscription_text,
                    Markup.inlineKeyboard(buttons),
                );
            },
        );

        this.bot.bot.action(
            this.command_delete,
            async (context: BotContext) => {
                const buttons: InlineKeyboardButton[][] =
                    await this.generateAvailableSubscriptionsButtons(
                        context,
                        this.command_delete,
                    );
                context.reply(
                    this.messages.subscription.delete_instruction_text,
                    Markup.inlineKeyboard(buttons),
                );

                context.session = {
                    ...context.session,
                    state: State.DELETE_SUB,
                };
            },
        );

        this.bot.bot.action(this.command_create, (context: BotContext) => {
            this.bot.commands.location.printLocationInputInstruction(context);

            context.session = {
                ...context.session,
                state: State.SUB_LOCATION_INPUT,
            };
        });

        this.bot.bot.action(this.command_edit_sub_TZ, (context: BotContext) => {
            context.reply(
                this.messages.subscription.time_zone_instruction,
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

            context.session = {
                ...context.session,
                state: State.SUB_EDIT_TIMEZONE_INPUT,
            };
        });

        this.bot.bot.command(
            this.command.slice(1),
            async (context: BotContext) => {
                this.bot.userSettingService.setChatId(
                    context,
                    context.message?.from.id as number,
                );

                await this.checkSubscribe(context);
            },
        );
    }

    getCommandInfo(): CommandInfo {
        return {
            command: this.command,
            description: this.messages.description_commands.subscribe,
        };
    }

    private printWhatToEditMessage(context: BotContext, sub_id: string) {
        context.session = {
            ...context.session,
            userSettings: {
                ...context.session?.userSettings,
                sub_id,
            },
        };

        context.reply(
            this.messages.subscription.what_to_edit_text,
            Markup.inlineKeyboard([
                Markup.button.callback(
                    this.messages.subscription.edit_location_text,
                    this.command_edit_location_callback,
                ),
                Markup.button.callback(
                    this.messages.subscription.edit_time_text,
                    this.command_edit_time_callback,
                ),
            ]),
        );
    }

    private async generateAvailableSubscriptionsButtons(
        context: BotContext,
        command: string,
    ) {
        const subscriptions: GetSubscriptionsReturnType =
            await this.bot.subscriptionService.getSubscriptions(
                context.session?.chatId as number,
            );
        const userTImeZone = await this.bot.userSettingService.getUserSettings(
            context.session?.chatId as number,
        );
        return generateSubscriptionsButtons(
            subscriptions,
            command,
            userTImeZone?.utc_offset as ITZType,
        );
    }

    private async checkSubscribe(context: BotContext) {
        const subscriptions =
            await this.bot.subscriptionService.getSubscriptions(
                context.session?.chatId as number,
            );
        switch (subscriptions.length) {
            case 0:
                await this.sendSubscriptionInstruction(context);
                break;

            default:
                await this.sendExistingSubscriptionInstructions(context);
                break;
        }
    }

    public async sendSubscriptionInstruction(context: BotContext) {
        context.reply(this.messages.subscription.start_message);
        context.session = {
            ...context.session,
            state: State.SUB_TIMEZONE_INPUT,
        };

        setTimeout(() => {
            context.reply(
                this.messages.subscription.time_zone_instruction,
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
        }, 1000);
    }

    public async sendExistingSubscriptionInstructions(context: BotContext) {
        context.reply(
            this.messages.subscription.is_subscribe,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        this.messages.subscription.create_subscription_btn_text,
                        this.command_create,
                    ),

                    Markup.button.callback(
                        this.messages.subscription.edit_subscription_text,
                        this.command_edit_sub,
                    ),
                ],
                [
                    Markup.button.callback(
                        this.messages.subscription.edit_time_zone_btn_text,
                        this.command_edit_sub_TZ,
                    ),
                    Markup.button.callback(
                        this.messages.subscription.delete_sub_btn_text,
                        this.command_delete,
                    ),
                ],
            ]),
        );
    }
}
