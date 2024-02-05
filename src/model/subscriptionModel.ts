import mongoose from "mongoose";

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    coords: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    sub_id: {
        type: String,
        required: true,
    },
    chatId: {
        type: Number,
        required: true,
    },
});

const Subscription = mongoose.model("subscription", subscriptionSchema);

export { Subscription };
