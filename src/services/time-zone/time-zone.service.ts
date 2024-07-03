import { Injectable } from "@nestjs/common";
import { ITimeZoneResponseTypes } from "./types/ITimeZoneService";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ICoordsTypes } from "../subscription/types/types";
import { ITZType } from "src/common/parseInputs";

@Injectable()
export class TimeZoneService {
    private URL = "https://timeapi.io/api/TimeZone/coordinate";

    /** @param {string} location - city name or coords (e.g., lat,lon) **/
    public getUTCOffset = async (
        location: ICoordsTypes,
    ): Promise<ITimeZoneResponseTypes> => {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.URL}?latitude=${location.latitude}&longitude=${location.longitude}`,
            );

            return response.data;
        } catch (error) {
            throw (error as AxiosError).response?.data;
        }
    };

    public convertSecondsToHours(seconds: number): ITZType {
        const totalMinutes = seconds / 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
            hours: hours,
            minutes: minutes,
        };
    }
}
