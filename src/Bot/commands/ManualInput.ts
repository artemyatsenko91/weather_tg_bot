import { BotContext } from "../Bot";
import { State } from "../ISessionData";
import { ICommand } from "./ICommand";
import { InputType, parseText } from "../common/parseInput";

export class ManualInput extends ICommand {
    getCommandInfo(): null {
        return null;
    }

    handle(): void {
        this.bot.bot.hears(/.*/, async (context: BotContext) => {
            const state = context.session?.state;

            if (context.message && "text" in context.message) {
                const userText = context.message.text;
                let type: InputType;
                switch (state) {
                    case State.SUB_EDIT_TIME_INPUT:
                    case State.SUB_TIME_INPUT:
                        type = InputType.time;
                        break;
                    case State.SUB_TIMEZONE_INPUT:
                    case State.SUB_EDIT_TIMEZONE_INPUT:
                        type =
                            InputType.zone | InputType.coords | InputType.city;
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

                await this.bot.mediator.switchNextState(context);
            }
        });
    }
}
