export const weatherMessage = (
    name: string,
    description: string,
    temp: number,
    feels_like: number,
    speed: number,
) => {
    return `
Зараз в ${name} ${description}.
Температура: ${temp}
Відчувається як: ${feels_like}
Швидкість вітру: ${speed} м/с
        `;
};

export const subscriptionConfirmationMessage = (time: string) => {
    return `
Дякую, вашу підписку створено. Ви будете отримувати прогноз погоди кожен день о ${time}.
    `;
};
