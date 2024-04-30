import { ITZType } from "src/common/parseInputs";

export interface IUserSettingsResponse {
    chatId: number;
    utc_offset: ITZType;
}
