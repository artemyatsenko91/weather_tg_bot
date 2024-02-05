import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSettingsSchema = new Schema({
    chatId: {
        type: Number,
        required: true,
    },
    utc_offset: {
        hours: {
            type: Number,
            required: true,
        },
        minutes: {
            type: Number,
            default: 0,
        },
    },
});

const UserSettings = mongoose.model(
    "UserSettings",
    userSettingsSchema,
    "usersSettings",
);

export { UserSettings };
