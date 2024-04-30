export class WeatherError extends Error {
    error: IWeatherError;

    constructor(error: IWeatherError) {
        super();
        this.error = error;
        this.name = "WeatherError";
    }
}

export interface IWeatherError {
    cod: string;
    message: string;
}
