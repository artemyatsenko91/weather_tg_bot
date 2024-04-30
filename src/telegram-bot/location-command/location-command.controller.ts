import { Action, On, Update } from "nestjs-telegraf";
import { BotContext } from "../types/ISessionData";
import { ICoordsTypes } from "src/services/subscription/types/types";
import { LocationCommandService } from "./location-command.service";

export const locationCommand = "/location";
const locationRegExp = new RegExp(`${locationCommand} (.+)`);

@Update()
export class LocationCommandController {
    constructor(
        private readonly locationCommandService: LocationCommandService,
    ) {}

    @On("location")
    public async g(context: BotContext) {
        if (context.message && "location" in context.message) {
            const coord = context.message.location;

            await this.locationCommandService.transferToMediator(
                context,
                coord,
            );
        }
    }

    @Action(locationRegExp)
    public async g2(context: BotContext) {
        const contextQuery = context.callbackQuery;

        if (contextQuery && "data" in contextQuery) {
            const parsedContextQuery = contextQuery.data.split(" ");
            const latitude: number = +parsedContextQuery[1];
            const longitude: number = +parsedContextQuery[2];

            const coord: ICoordsTypes = {
                latitude,
                longitude,
            };

            await this.locationCommandService.transferToMediator(
                context,
                coord,
            );
        }
    }
}
