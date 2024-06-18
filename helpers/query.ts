import db from "../db/init";

export async function getStateUser(data: { userId: string }) {
    const [state] = await db`SELECT state FROM users WHERE telegram_user_id = ${data.userId}`
    return state;
}

export async function setStateUser(data: { userId: string, state: number }) {
    const result = await db`UPDATE users SET state = ${data.state} WHERE telegram_user_id = ${data.userId}`
    return result;
}

export async function setThingTypeUser(data: { userId: string, thingType: string }) {
    const result = await db`UPDATE users SET thing_type = ${data.thingType} WHERE telegram_user_id = ${data.userId}`
    return result;
}

export async function getThingTypeUser(data: { userId: string }) {
    const [result] = await db`SELECT thing_type FROM users WHERE telegram_user_id = ${data.userId}`
    return result;
}