import { Bot } from "../Bot";

export interface CommandInfo {
    command: string;
    description: string;
}

export abstract class ICommand {
    constructor(public bot: Bot) {}
    abstract handle(): void;
    abstract getCommandInfo(): CommandInfo | null;
}
