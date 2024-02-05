import mongoose from "mongoose";

import { Bot } from "./Bot/Bot";
import { ConfigService } from "./services/ConfigService";
import { LoggerService } from "./services/LoggerService";
import { WeatherService } from "./services/WeatherService/WetherService";
import { SubscriptionService } from "./services/SubscriptionService/SubscriptionService";
import { UserSettingsService } from "./services/UserSettingService/UserSettingService";
import { TimeZoneService } from "./services/TimeZoneService";

const config = new ConfigService();
const logger = new LoggerService();
const subscriptionService = new SubscriptionService();
const timezoneService = new TimeZoneService(
    config.get("ABSTRACTAPI_TIMEZONE_API_KEY"),
);
const weatherService = new WeatherService(config.get("API_TOKEN"));

const mongoURL = config.get("DB_URL");

mongoose
    .connect(mongoURL)
    .then(() => logger.info("Connected to MongoDB"))
    .catch((err) => logger.error(`DB connection error: ${err}`));

const bot = new Bot(
    config.get("TELEGRAM_TOKEN"),
    logger,
    weatherService,
    subscriptionService,
    new UserSettingsService(timezoneService, weatherService),
    timezoneService,
);

bot.init();
