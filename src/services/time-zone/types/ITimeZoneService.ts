export interface ITimeZoneService {
    getUTCOffset: (location: string) => Promise<ITimeZoneResponseTypes>;
}

export interface ITimeZoneResponseTypes {
    currentUtcOffset: {
        seconds: number;
    };
}
