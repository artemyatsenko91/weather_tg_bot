import axios, { AxiosError, AxiosResponse } from "axios";

export class TimeZoneService {
    private URL = "https://timezone.abstractapi.com/v1/current_time";
    constructor(private readonly api_key: string) {}

    /** @param {string} location - city name or coords (e.g., lat,lon) **/
    public getUTCOffset = async (
        location: string,
    ): Promise<ITimeZoneResponseTypes> => {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.URL}?api_key=${this.api_key}&location=${location}`,
            );
            return response.data;
        } catch (error) {
            throw (error as AxiosError).response?.data;
        }
    };
}

export interface ITimeZoneResponseTypes {
    gmt_offset: string;
    latitude: number;
    longitude: number;
}
