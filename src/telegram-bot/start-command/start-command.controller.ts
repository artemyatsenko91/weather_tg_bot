import { Start, Update } from "nestjs-telegraf";

import { BotContext } from "../types/ISessionData";
import { StartCommandService } from "./start-command.service";

@Update()
export class StartCommandController {
    constructor(private readonly startCommandService: StartCommandService) {}

    @Start()
    public async startCommand(context: BotContext) {
        this.startCommandService.printStartMessage(context);
    }
}
