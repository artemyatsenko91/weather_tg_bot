import pino, { Logger } from "pino";
import { ILoggerService } from "./ILoggerService";

class LoggerService implements ILoggerService {
    private logger: Logger;

    constructor() {
        this.logger = pino(
            pino.transport({
                targets: [
                    {
                        target: "pino-pretty",
                        options: {
                            destination: "./logs/output.log",
                            mkdir: true,
                            colorize: false,
                        },
                    },
                    {
                        target: "pino-pretty",
                        options: {
                            destination: process.stdout.fd,
                        },
                    },
                ],
            }),
        );
    }

    public info(message: string, obj?: Record<string, unknown>) {
        this.logger.info(obj, message);
    }

    public warn(message: string) {
        this.logger.warn(message);
    }

    public error(message: string, obj?: Record<string, unknown>) {
        this.logger.error(obj, message);
    }
}

export const LoggerServiceInstance = new LoggerService();
