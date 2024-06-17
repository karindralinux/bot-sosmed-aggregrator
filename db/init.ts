import postgres from 'postgres'

const db = postgres({
    host: Bun.env.DB_HOST || '127.0.0.1',
    port: Number(Bun.env.DB_PORT) || 5432,
    database: Bun.env.DB_NAME || 'postgres',
    username: Bun.env.DB_USERNAME,
    password: Bun.env.DB_PASSWORD,
})

export default db