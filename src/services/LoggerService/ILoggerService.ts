export interface ILoggerService {
    info: (message: string, obj?: Record<string, unknown>) => void;
    warn: (message: string) => void;
    error: (message: string, obj?: Record<string, unknown>) => void;
}
