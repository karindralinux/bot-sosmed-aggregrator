import { Database } from "bun:sqlite";

export function getStateUser(cache: Database, userId: string) {
    const query = cache.query('SELECT state FROM users WHERE telegram_user_id = $userId')
    return query.get({ $userId: userId }) as { state: number };
}

export function setStateUser(data: { cache: Database, userId: string, state: number }) {
    const query = data.cache.query('UPDATE users SET state $state WHERE telegram_user_id = $userId')
    return query.run({ $userId: data.userId, $state: data.state })
}

export function setThingTypeUser(cache: Database, userId: string, thingType: string) {
    const query = cache.query('UPDATE users SET thing_type = $thingType WHERE telegram_user_id = $userId')
    return query.run({ $userId: userId, $thingType: thingType })
}

export function getThingTypeUser(cache: Database, userId: string) {
    const query = cache.query('SELECT thing_type FROM users WHERE telegram_user_id = $userId')
    return query.get({ $userId: userId }) as { thingType: string };
}