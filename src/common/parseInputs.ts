type InputCity = string;
export type InputCoords = { latitude: number; longitude: number };
type InputTime = string;
type InputZone = ITZType;

export enum InputType {
    city = 1,
    coords = 2,
    time = 4,
    zone = 8,
}

export type ITZType = {
    hours: number;
    minutes?: number;
};

export type InputData = {
    type: InputType;
    data: InputCity | InputCoords | InputTime | InputZone | null;
};

export const parseText = async (
    text: string,
    types: InputType,
): Promise<InputData | undefined> => {
    let unparsedData: InputData;

    if (types & InputType.coords) {
        const coordinatePattern = /^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/;
        const parsedCoords = coordinatePattern.exec(text);
        if (parsedCoords)
            return {
                type: InputType.coords,
                data: {
                    latitude: +parsedCoords[1],
                    longitude: +parsedCoords[3],
                },
            };
        else {
            unparsedData = {
                type: InputType.coords,
                data: null,
            };
        }
    }

    if (types & InputType.time) {
        const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        const parsedTime = timePattern.exec(text);

        if (parsedTime)
            return {
                type: InputType.time,
                data: parsedTime[0],
            };
        else {
            unparsedData = {
                type: InputType.time,
                data: null,
            };
        }
    }

    if (types & InputType.zone) {
        const timeZonePattern = /^([-+]\d{1,2}(:?\d{2})?)$/;
        const parsedZone = timeZonePattern.test(text);
        if (parsedZone) {
            const timeArr = text.split(":");
            return {
                type: InputType.time,
                data: {
                    hours: +timeArr[0],
                    minutes: timeArr[1] ? +timeArr[1] : 0,
                },
            };
        } else {
            unparsedData = {
                type: InputType.zone,
                data: null,
            };
        }
    }

    if (types & InputType.city) {
        const textPattern = /^[^\d]*$/.test(text);
        if (textPattern) {
            return {
                type: InputType.city,
                data: text,
            };
        } else {
            unparsedData = {
                type: InputType.time,
                data: null,
            };
            return unparsedData;
        }
    }
};
