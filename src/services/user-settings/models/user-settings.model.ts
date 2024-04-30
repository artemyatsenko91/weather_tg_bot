import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Offset {
    @Prop({ type: Number, required: true })
    hours: number;

    @Prop({ type: Number, default: 0 })
    minutes: number;
}

@Schema()
export class UserSettings {
    @Prop({ type: Number, required: true })
    chatId: number;

    @Prop({ type: Offset })
    utc_offset: Offset;
}

export type UserSettingsDocument = UserSettings & Document;

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
UserSettingsSchema.set("collection", "weather-user-settings");
