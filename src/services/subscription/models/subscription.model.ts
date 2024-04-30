import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Coords {
    @Prop({ type: Number, required: true })
    latitude: number;

    @Prop({ type: Number, required: true })
    longitude: number;
}

@Schema()
export class Subscription {
    @Prop({ type: String, required: true })
    time: string;

    @Prop({ type: String, required: true })
    location: string;

    @Prop({ type: String, required: true })
    sub_id: string;

    @Prop({ type: Number, required: true })
    chatId: number;

    @Prop({ type: Coords })
    coords: Coords;
}

export type SubscriptionDocument = Subscription & Document;

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.set("collection", "weather-subscriptions");
