import { ITZType } from "./parseInputs";

export const convertTimeToUTC = (
    localTimeString: string,
    offset: ITZType,
    revert?: boolean,
): string => {
    const [hours, minutes] = localTimeString.split(":").map(Number);
    const localDate = new Date();

    localDate.setHours(hours);
    localDate.setMinutes(minutes);

    const offsetHours = offset.hours as number;
    const offsMinutes = offset.minutes ? (offset.hours as number) : 0;

    const utcTime = revert
        ? localDate.getTime() +
          offsetHours * 60 * 60 * 1000 +
          offsMinutes * 60 * 1000
        : localDate.getTime() -
          offsetHours * 60 * 60 * 1000 -
          offsMinutes * 60 * 1000;

    const utcDate = new Date(utcTime);

    const utcHours = String(utcDate.getHours()).padStart(2, "0");
    const utcMinutes = String(utcDate.getMinutes()).padStart(2, "0");

    const utcTimeString = `${utcHours}:${utcMinutes}`;
    return utcTimeString;
};
