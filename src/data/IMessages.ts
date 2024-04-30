export interface IMessages {
    start: string;
    geo_callback_btn_text: string;
    weather_btn_text: string;
    sub_btn_text: string;
    unknown_input: string;
    location: {
        input_city_instruction: string;
        clarification_of_choice: string;
        no_matches: string;
    };
    subscription: {
        start_message: string;
        time_instruction: string;
        invalid_coord_input: string;
        time_input_error: string;
        is_subscribe: string;
        create_subscription_btn_text: string;
        edit_subscription_text: string;
        what_to_edit_text: string;
        edit_location_text: string;
        edit_time_text: string;
        success_edit_location: string;
        success_edit_time: string;
        edit_time_zone_btn_text: string;
        time_zone_instruction: string;
        success_edit_tz: string;
        time_zone_invalid: string;
        delete_sub_btn_text: string;
        delete_instruction_text: string;
        delete_confirmation_text: string;
    };
    error: {
        unknown: string;
        service: string;
    };
    description_commands: {
        weather: string;
        start: string;
        subscribe: string;
    };
}
