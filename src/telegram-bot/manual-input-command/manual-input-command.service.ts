import { Injectable } from "@nestjs/common";
import { BotContext, State } from "../types/ISessionData";
import { InputType, parseText } from "src/common/parseInputs";
import { TelegramService } from "../telegram-bot.service";

@Injectable()
export class ManualInputCommandService {
    constructor(private readonly telegramService: TelegramService) {}
    public async updateStateByInput(
        context: BotContext,
        state: State,
        userText: string,
    ) {
        let type: InputType;
        switch (state) {
            case State.SUB_EDIT_TIME_INPUT:
            case State.SUB_TIME_INPUT:
                type = InputType.time;
                break;
            case State.SUB_TIMEZONE_INPUT:
            case State.SUB_EDIT_TIMEZONE_INPUT:
                type = InputType.zone | InputType.coords | InputType.city;
                break;
            case State.LOCATION_INPUT:
            case State.SUB_LOCATION_INPUT:
            case State.SUB_EDIT_LOCATION_INPUT:
                type = InputType.coords | InputType.city;
                break;
            default:
                type = InputType.city;
                break;
        }

        const data = await parseText(userText, type);

        context.session = {
            ...context.session,
            inputData: data,
        };

        await this.telegramService.switchNextState(context);
    }
}
