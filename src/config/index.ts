export const config = () => ({
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_CLUSTER_NAME: process.env.MONGO_CLUSTER_NAME,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TIME_ZONE_API_TOKEN: process.env.TIME_ZONE_API_TOKEN,
    OPEN_WEATHER_API_TOKEN: process.env.OPEN_WEATHER_API_TOKEN,
});
