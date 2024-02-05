import pino, { Logger } from "pino";

export class LoggerService {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public info(message: string, obj?: { [key: string]: any }) {
        this.logger.info(obj, message);
    }

    public warn(message: string) {
        this.logger.warn(message);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error(message: string, obj?: { [key: string]: any }) {
        this.logger.error(obj, message);
    }
}
