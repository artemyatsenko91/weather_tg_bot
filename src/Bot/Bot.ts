import { Context, Telegraf, session } from "telegraf";

import { LoggerService } from "../services/LoggerService";
import { ICommands } from "./commands/ICommands";
import { StartCommand } from "./commands/StartCommand";
import { SessionData } from "./ISessionData";
import { Update } from "telegraf/typings/core/types/typegram";
import { CommandInfo, ICommand } from "./commands/ICommand";
import { WeatherCommand } from "./commands/WeatherCommand";
import { ManualInput } from "./commands/ManualInput";
import { WeatherService } from "../services/WeatherService/WetherService";
import { LocationCommand } from "./commands/LocationCommand";
import { SubscriptionCommand } from "./commands/SubscriptionCommand";
import { SubscriptionService } from "../services/SubscriptionService/SubscriptionService";
import { UserSettingsService } from "../services/UserSettingService/UserSettingService";
import { TimeZoneService } from "../services/TimeZoneService";
import { CronService } from "../services/CronService";
import { Mediator } from "./Mediator";

export interface BotContext extends Context<Update> {
    session?: SessionData;
}

export class Bot {
    public bot: Telegraf;
    public logger: LoggerService;
    public weather: WeatherService;
    public subscriptionService: SubscriptionService;
    public userSettingService: UserSettingsService;
    public timeZoneService: TimeZoneService;
    public cronService: CronService;
    public mediator: Mediator;

    constructor(
        private readonly token: string,
        loggerService: LoggerService,
        weatherService: WeatherService,
        subscriptionService: SubscriptionService,
        userSettingService: UserSettingsService,
        timeZoneService: TimeZoneService,
    ) {
        this.bot = new Telegraf<BotContext>(this.token);
        this.logger = loggerService;
        this.weather = weatherService;
        this.subscriptionService = subscriptionService;
        this.userSettingService = userSettingService;
        this.timeZoneService = timeZoneService;
        this.cronService = new CronService(this);
        this.mediator = new Mediator(this);
    }

    public commands: ICommands = {
        start: new StartCommand(this),
        weather: new WeatherCommand(this),
        subscription: new SubscriptionCommand(this),
        location: new LocationCommand(this),
        manual: new ManualInput(this),
    };

    public initCommands() {
        Object.keys(this.commands).forEach((commandStr) => {
            const command = commandStr as keyof ICommands;
            this.commands[command].handle();
        });
    }

    public setupCommands() {
        const commandsInfos = this.getCommandsInfos();
        this.bot.telegram.setMyCommands(commandsInfos);
    }

    public getCommandsInfos(): CommandInfo[] {
        return Object.keys(this.commands)
            .map((commandStr) => {
                const commandKey = commandStr as keyof ICommands;
                const command = this.commands[commandKey] as ICommand;
                return command.getCommandInfo();
            })
            .filter((cmd) => cmd !== null) as CommandInfo[];
    }

    public setCronService(cronService: CronService) {
        this.cronService = cronService;
    }

    public init() {
        this.setupCommands();
        this.bot.use(session());
        this.initCommands();
        this.cronService.init(), this.bot.launch();
    }
}
