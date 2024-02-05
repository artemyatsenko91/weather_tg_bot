import axios, { AxiosError, AxiosResponse } from "axios";

import { IWeatherCityInfo, IWeatherInfo } from "./IWeatherInfo";
import { IWeatherError, WeatherError } from "./WeatherApiError";
import { ICoordsTypes } from "../SubscriptionService/types";

export class WeatherService {
    private url = "https://api.openweathermap.org";
    private api_key: string;

    /** @param {string} api_token - https://openweathermap.org/ token */
    constructor(private readonly api_token: string) {
        this.api_key = this.api_token;
    }

    public async getWeatherByCoord(
        coords: ICoordsTypes,
    ): Promise<IWeatherInfo> {
        try {
            const response: AxiosResponse = await axios.post(
                `${this.url}/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${this.api_key}&lang=ua&units=metric`,
            );
            return response.data;
        } catch (error) {
            const responseData = (error as AxiosError).response
                ?.data as IWeatherError;
            throw new WeatherError(responseData);
        }
    }

    public async getWeatherByCityName(
        location: string,
    ): Promise<IWeatherCityInfo[]> {
        try {
            const response: AxiosResponse = await axios.get(
                `${this.url}/geo/1.0/direct?q=${location}&limit=5&appid=${this.api_key}`,
            );
            return response.data;
        } catch (error) {
            const responseData = (error as AxiosError).response
                ?.data as IWeatherError;
            throw new WeatherError(responseData);
        }
    }
}
