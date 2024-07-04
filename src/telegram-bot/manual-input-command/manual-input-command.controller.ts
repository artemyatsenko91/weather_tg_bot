import { Hears, Update } from "nestjs-telegraf";
import { BotContext } from "../types/ISessionData";
import { ManualInputCommandService } from "./manual-input-command.service";

@Update()
export class ManualInputCommandController {
    constructor(
        private readonly manualInputCommandService: ManualInputCommandService,
    ) {}
    @Hears(/.*/)
    public async manualCommands(context: BotContext) {
        const state = context.session?.state;
        if (context.message && "text" in context.message) {
            await this.manualInputCommandService.updateStateByInput(
                context,
                state,
                context.message.text.trim(),
            );
        }
    }
}
