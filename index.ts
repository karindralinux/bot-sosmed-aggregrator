import { Telegraf } from "telegraf";
import { FacebookScraper, QueryFacebookType } from "./scraper/facebook/scraper";
import { getCommandName } from "./helpers/command";
import * as introduction from "./services/introduction";
import * as things from "./services/things";

import { Database } from "bun:sqlite";

const cacheDb = new Database(":memory:");

const PORT = Number(Bun.env.PORT) || 3000;
const BOT_TOKEN = Bun.env.BOT_TOKEN || '';

const server = Bun.serve({
    port: PORT,
    development: Bun.env.ENV === "development",
    async fetch(req) {

        const url = new URL(req.url);
        const params = new URLSearchParams(req.url);

        switch (url.pathname) {
            case "/facebook":
                const scraper = new FacebookScraper("example@gmail.com", "rahasia123");
                const data = await scraper.search({
                    type: QueryFacebookType.GROUP, query: 'stnk', accountId: '760885718141448'
                })

                return Response.json({
                    status: true,
                    data
                }, { status: 200 });

            case "/instagram":
                return new Response("instagram..")
            case "/twitter":
                return new Response("twitter...")
        }

        return new Response("Hello World");

    },
    error(e) {
        console.error(e)
        return Response.json({
            status: false,
            message: 'Internal Server Error'
        }, { status: 500 });
    }
});

const bot = new Telegraf(BOT_TOKEN);

async function initCacheDb() {
    const query = cacheDb.query(`CREATE TABLE users (
        telegram_user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        state TINYINT DEFAULT 0,
        thing_type VARCHAR(255)
    );`);

    query.run();
}

async function terminate(signal: string) {
    bot.stop(signal);
    cacheDb.close()
    console.log(`Turn off bot...`)
    process.exit(0);
}

process.once("SIGINT", () => terminate("SIGINT"));
process.once("SIGTERM", () => terminate("SIGTERM"));

async function main() {

    initCacheDb().then(() => { console.log(`Successfully Init Cache DB..`) }).catch((e) => console.error(e, `Error Init Cache DB`))

    bot.use((ctx, next) => {

        const senderUserId: string = ctx.message?.from.id.toString() || '';
        const senderUsername: string = ctx.message?.from.username?.toString() || ''

        if (ctx.from?.is_bot) {
            return;
        }

        // TODO : lengkapi command-command yang valid
        const validCommands = ["halo", "mulai", "pilih-menu", "konfirmasi", "tes", "KTP", "SIM", "STNK"];

        if (ctx.updateType === "message") {
            const command = getCommandName(ctx);

            if (command === "" || !validCommands.includes(command)) {
                ctx.reply("Maaf, pesan anda tidak kami kenali");
                next();
                return;
            }

            const user = cacheDb.query("SELECT telegram_user_id,state,username FROM users WHERE $telegram_user_id;").get({
                $telegram_user_id: senderUserId
            });

            if (!user) {
                const query = cacheDb.query("INSERT INTO users (telegram_user_id, username) VALUES ($telegram_user_id, $username);")
                query.run({
                    $telegram_user_id: senderUserId,
                    $username: senderUsername
                })
            }

            next();
            return;
        }

        next();
    })

    const commands = [
        introduction.register(bot, cacheDb),
        things.register(bot, cacheDb)
    ].filter((v) => Array.isArray(v)).flat();

    bot.telegram.setMyCommands(commands.slice(0, 100)).then(o => o).catch((e) => { console.error(e) })

    console.log(`Launching Bot...`);
    bot.botInfo = await bot.telegram.getMe();
    console.log("Bot started");
    await bot.launch();
}

main();

console.log(`Successfully started server at ${server.hostname}:${server.port}...`)

