import { Database } from "bun:sqlite";

export function getStateUser(cache: Database, userId: string) {
    const query = cache.query('SELECT state FROM users WHERE telegram_user_id = $userId')
    return query.get({ $userId: userId }) as { state: number };
}