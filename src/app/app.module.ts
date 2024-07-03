import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { config } from "src/config";

import { MongooseModule } from "@nestjs/mongoose";
import { TelegramModule } from "src/telegram-bot/telegram-bot.module";
import { SubscriptionMailingModule } from "src/services/subscription-mailing/cron-service.module";

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    load: [config],
});

const mongoModule = MongooseModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const MONGO_USER: string = configService.get("MONGO_USER");
        const MONGO_PASSWORD = configService.get("MONGO_PASSWORD");
        const MONGO_CLUSTER_NAME = configService.get("MONGO_CLUSTER_NAME");
        const MONGO_DB_NAME = configService.get("MONGO_DB_NAME");

        return {
            uri: `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER_NAME}.1i22sgg.mongodb.net/?retryWrites=true&w=majority&appName=${MONGO_DB_NAME}`,
        };
    },
});

@Module({
    imports: [
        configModule,
        mongoModule,
        TelegramModule,
        SubscriptionMailingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
