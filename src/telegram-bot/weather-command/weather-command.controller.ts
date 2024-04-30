import { Action, Command, Update } from "nestjs-telegraf";

import { BotContext, State } from "../types/ISessionData";
import { LocationCommandService } from "../location-command/location-command.service";
import { WeatherCommandService } from "./weather-command.service";

export const weatherCommand = "/weather";
const commandRegExp = new RegExp(`${weatherCommand} (.+)`);

@Update()
export class WeatherCommandController {
    constructor(
        private readonly locationCommand: LocationCommandService,
        private readonly weatherCommandService: WeatherCommandService,
    ) {}

    @Action(weatherCommand)
    public async weatherActionCommand(context: BotContext) {
        this.locationCommand.printLocationInputInstruction(context);

        context.session = {
            ...context.session,
            state: State.LOCATION_INPUT,
        };
    }

    @Command(weatherCommand.slice(1))
    public async weatherCommand(context: BotContext) {
        this.locationCommand.printLocationInputInstruction(context);

        context.session = {
            ...context.session,
            state: State.LOCATION_INPUT,
        };
    }

    @Action(commandRegExp)
    public async weatherActionCommandWithRegExp(context: BotContext) {
        const contextQuery = context.callbackQuery;

        if (contextQuery && "data" in contextQuery) {
            await this.weatherCommandService.updateState(
                context,
                contextQuery.data,
            );
        }
    }
}
