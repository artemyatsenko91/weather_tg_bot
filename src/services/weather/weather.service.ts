import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ICoordsTypes } from "../subscription/types/types";

import axios, { AxiosError, AxiosResponse } from "axios";
import { IWeatherError, WeatherError } from "./WeatherApiError";
import { IWeatherCityInfo, IWeatherInfo } from "./types/IWeatherService";

@Injectable()
export class WeatherService {
    private url = "https://api.openweathermap.org";
    private api_key: string;

    constructor(private readonly configService: ConfigService) {
        this.api_key = this.configService.get("OPEN_WEATHER_API_TOKEN");
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
