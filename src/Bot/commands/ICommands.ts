import { LocationCommand } from "./LocationCommand";
import { ManualInput } from "./ManualInput";
import { StartCommand } from "./StartCommand";
import { SubscriptionCommand } from "./SubscriptionCommand";
import { WeatherCommand } from "./WeatherCommand";

export interface ICommands {
    start: StartCommand;
    weather: WeatherCommand;
    manual: ManualInput;
    location: LocationCommand;
    subscription: SubscriptionCommand;
}
