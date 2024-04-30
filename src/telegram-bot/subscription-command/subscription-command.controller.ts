import { Action, Command, Update } from "nestjs-telegraf";

import { SubscriptionCommandService } from "./subscription-command.service";
import { BotContext } from "../types/ISessionData";

export const subscriptionCommand = "/subscribe";
export const subscriptionCommandCreate = "/create";
export const subscriptionCommandEditSub = "/edit";
export const subscriptionCommandEditTZ = "/edit_tz";
export const subscriptionCommandDelete = "/delete";
export const subscriptionCommandEditLocationCallback = "/edit_location";
export const subscriptionCommandEditTimeCallback = "/edit_time";

const subscriptionCommandEditSubWithQuery = new RegExp(
    `${subscriptionCommandEditSub} (.+)`,
);
const subscriptionCommandDeleteWithQuery = new RegExp(
    `${subscriptionCommandDelete} (.+)`,
);

@Update()
export class SubscriptionCommandController {
    constructor(
        private readonly subscriptionCommandService: SubscriptionCommandService,
    ) {}
    @Action(subscriptionCommand)
    public async subscriptionActionCommand(context: BotContext) {
        await this.subscriptionCommandService.checkSubscribe(context);
    }

    @Command(subscriptionCommand.slice(1))
    public async checkSub(context: BotContext) {
        await this.subscriptionCommandService.checkSubscribeWithId(context);
    }

    @Action(subscriptionCommandEditSub)
    public async commandEditSub(context: BotContext) {
        await this.subscriptionCommandService.editSub(context);
    }

    @Action(subscriptionCommandDelete)
    public async commandDeleteSub(context: BotContext) {
        await this.subscriptionCommandService.deleteSub(context);
    }

    @Action(subscriptionCommandCreate)
    public async commandCreateSub(context: BotContext) {
        await this.subscriptionCommandService.createSub(context);
    }

    @Action(subscriptionCommandEditTZ)
    public async commandEditTZ(context: BotContext) {
        await this.subscriptionCommandService.editTimeZone(context);
    }

    @Action(subscriptionCommandEditLocationCallback)
    public async commandEditLocationCallback(context: BotContext) {
        await this.subscriptionCommandService.editLocation(context);
    }

    @Action(subscriptionCommandEditTimeCallback)
    public async commandEditTimeCallback(context: BotContext) {
        await this.subscriptionCommandService.editTime(context);
    }

    @Action(subscriptionCommandEditSubWithQuery)
    public async commandEditEditSubWithQueryCallback(context: BotContext) {
        const contextQuery = context.callbackQuery;
        if (contextQuery && "data" in contextQuery) {
            await this.subscriptionCommandService.editSubWithQuery(
                context,
                contextQuery.data,
            );
        }
    }

    @Action(subscriptionCommandDeleteWithQuery)
    public async commandEditDeleteWithQuery(context: BotContext) {
        const contextQuery = context.callbackQuery;
        if (contextQuery && "data" in contextQuery) {
            await this.subscriptionCommandService.deleteSubWithQuery(
                context,
                contextQuery.data,
            );
        }
    }
}
