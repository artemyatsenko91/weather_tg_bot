import { Injectable } from "@nestjs/common";
import { Markup } from "telegraf";
import { BotContext, State } from "../types/ISessionData";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

import messagesData from "../../data/messages.json";
import {
    subscriptionCommandCreate,
    subscriptionCommandDelete,
    subscriptionCommandEditLocationCallback,
    subscriptionCommandEditSub,
    subscriptionCommandEditTimeCallback,
    subscriptionCommandEditTZ,
} from "./subscription-command.controller";
import { SubscriptionService } from "src/services/subscription/subscription.service";
import { LocationCommandService } from "../location-command/location-command.service";
import { GetSubscriptionsReturnType } from "src/services/subscription/types/types";
import { generateSubscriptionsButtons } from "src/common/generateInlineButtons";
import { UserSettingsService } from "src/services/user-settings/user-settings.service";

@Injectable()
export class SubscriptionCommandService {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly locationCommandService: LocationCommandService,
        private readonly userSettingsService: UserSettingsService,
    ) {}

    public async checkSubscribe(context: BotContext) {
        const subscriptions = await this.subscriptionService.getSubscriptions({
            chatId: context.session?.chatId,
        });
        switch (subscriptions.length) {
            case 0:
                await this.sendSubscriptionInstruction(context);
                break;
            default:
                await this.sendExistingSubscriptionInstructions(context);
                break;
        }
    }

    public async checkSubscribeWithId(context: BotContext) {
        this.userSettingsService.setChatId(context, context.message?.from.id);

        await this.checkSubscribe(context);
    }

    public async sendSubscriptionInstruction(context: BotContext) {
        context.reply(messagesData.subscription.start_message);
        context.session = {
            ...context.session,
            state: State.SUB_TIMEZONE_INPUT,
        };

        setTimeout(() => {
            context.reply(
                messagesData.subscription.time_zone_instruction,
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
        }, 1000);
    }

    public async sendExistingSubscriptionInstructions(context: BotContext) {
        context.reply(
            messagesData.subscription.is_subscribe,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        messagesData.subscription.create_subscription_btn_text,
                        subscriptionCommandCreate,
                    ),

                    Markup.button.callback(
                        messagesData.subscription.edit_subscription_text,
                        subscriptionCommandEditSub,
                    ),
                ],
                [
                    Markup.button.callback(
                        messagesData.subscription.edit_time_zone_btn_text,
                        subscriptionCommandEditTZ,
                    ),
                    Markup.button.callback(
                        messagesData.subscription.delete_sub_btn_text,
                        subscriptionCommandDelete,
                    ),
                ],
            ]),
        );
    }

    public async editLocation(context: BotContext) {
        await this.locationCommandService.printLocationInputInstruction(
            context,
        );

        context.session = {
            ...context.session,
            state: State.SUB_EDIT_LOCATION_INPUT,
        };
    }

    public async editTime(context: BotContext) {
        context.reply(messagesData.subscription.time_instruction);

        context.session = {
            ...context.session,
            state: State.SUB_EDIT_TIME_INPUT,
        };
    }

    public async editTimeZone(context: BotContext) {
        context.reply(
            messagesData.subscription.time_zone_instruction,
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

        context.session = {
            ...context.session,
            state: State.SUB_EDIT_TIMEZONE_INPUT,
        };
    }

    public async createSub(context: BotContext) {
        this.locationCommandService.printLocationInputInstruction(context);

        context.session = {
            ...context.session,
            state: State.SUB_LOCATION_INPUT,
        };
    }

    public async editSub(context: BotContext) {
        const buttons: InlineKeyboardButton[][] =
            await this.generateAvailableSubscriptionsButtons(
                context,
                subscriptionCommandEditSub,
            );
        context.reply(
            messagesData.subscription.edit_subscription_text,
            Markup.inlineKeyboard(buttons),
        );
    }

    public async editSubWithQuery(context: BotContext, contextQuery: string) {
        const parsedContextQuery = contextQuery.split(" ");
        this.printWhatToEditMessage(context, parsedContextQuery[1]);
    }

    public async deleteSub(context: BotContext) {
        const buttons: InlineKeyboardButton[][] =
            await this.generateAvailableSubscriptionsButtons(
                context,
                subscriptionCommandDelete,
            );
        context.reply(
            messagesData.subscription.delete_instruction_text,
            Markup.inlineKeyboard(buttons),
        );

        context.session = {
            ...context.session,
            state: State.DELETE_SUB,
        };
    }

    public async deleteSubWithQuery(context: BotContext, contextQuery: string) {
        const parsedContextQuery = contextQuery.split(" ");

        await this.subscriptionService.deleteSubscribe(
            parsedContextQuery[1],
            context.session?.chatId,
        );

        context.reply(messagesData.subscription.delete_confirmation_text);
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
            messagesData.subscription.what_to_edit_text,
            Markup.inlineKeyboard([
                Markup.button.callback(
                    messagesData.subscription.edit_location_text,
                    subscriptionCommandEditLocationCallback,
                ),
                Markup.button.callback(
                    messagesData.subscription.edit_time_text,
                    subscriptionCommandEditTimeCallback,
                ),
            ]),
        );
    }

    private async generateAvailableSubscriptionsButtons(
        context: BotContext,
        command: string,
    ) {
        const subscriptions: GetSubscriptionsReturnType =
            await this.subscriptionService.getSubscriptions({
                chatId: context.session?.chatId,
            });
        const userTImeZone = await this.userSettingsService.getUserSettings(
            context.session?.chatId,
        );
        return generateSubscriptionsButtons(
            subscriptions,
            command,
            userTImeZone?.utc_offset,
        );
    }
}
