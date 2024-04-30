import { Injectable } from "@nestjs/common";
import { ITimeZoneResponseTypes } from "./types/ITimeZoneService";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TimeZoneService {
    private URL = "https://timezone.abstractapi.com/v1/current_time";
    private api_key: string;

    constructor(private readonly configService: ConfigService) {
        this.api_key = this.configService.get("TIME_ZONE_API_TOKEN");
    }

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
