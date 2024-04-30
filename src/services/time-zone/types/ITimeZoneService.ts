export interface ITimeZoneService {
    getUTCOffset: (location: string) => Promise<ITimeZoneResponseTypes>;
}

export interface ITimeZoneResponseTypes {
    gmt_offset: string;
    latitude: number;
    longitude: number;
}
