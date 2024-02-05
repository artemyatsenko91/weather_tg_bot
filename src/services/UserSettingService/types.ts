import { ITZType } from "../../Bot/common/parseInput";

export interface IUseeSettingsResponse {
    chatId: number;
    utc_offset: ITZType;
}
