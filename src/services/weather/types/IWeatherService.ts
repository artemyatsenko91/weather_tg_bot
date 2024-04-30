import { ICoordsTypes } from "src/services/subscription/types/types";

export interface IWeatherService {
    getWeatherByCoord(coords: ICoordsTypes): Promise<IWeatherInfo>;
    getWeatherByCityName(location: string): Promise<IWeatherCityInfo[]>;
}

export interface IWeatherCityInfo {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

export interface IWeatherInfo {
    id: number;
    name: string;
    coord: Coord;
    main: Main;
    dt: number;
    wind: Wind;
    sys: Sys;
    snow: Snow | null;
    rain: Snow | null;
    clouds: Clouds;
    weather: Weather[];
    base: string;
    visibility: number;
    timezone: number;
    cod: number;
}

interface Coord {
    lon: number;
    lat: number;
}

interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
}

interface Main {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
}

interface Wind {
    speed: number;
    deg: number;
    gust: number;
}

interface Clouds {
    all: number;
}

interface Sys {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
}

interface Snow {
    "1h": number;
    "3h": number;
}
