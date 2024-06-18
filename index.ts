import { Telegraf } from "telegraf";
import { getCommandName } from "./helpers/command";
import * as introduction from "./services/introduction";
import * as things from "./services/things";
import * as confirmation from "./services/confirmation";
import * as search from "./services/search";
import db from "./db/init";

const PORT = Number(Bun.env.PORT) || 3000;
const BOT_TOKEN = Bun.env.BOT_TOKEN || '';

const server = Bun.serve({
    port: PORT,
    development: Bun.env.ENV === "development",
    async fetch(req) {

        const url = new URL(req.url);

        if (url.pathname === 'health-check') return new Response('Hello World')

        const file = Bun.file(import.meta.dir + '/public' + (url.pathname == '/' ? '/index.html' : url.pathname))
        const isExists = await file.exists()

        if (!isExists) return new Response('Not Found');

        return new Response(file)
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

async function terminate(signal: string) {
    bot.stop(signal);
    db.end()
    console.log(`Turn off bot...`)
    process.exit(0);
}

process.once("SIGINT", () => terminate("SIGINT"));
process.once("SIGTERM", () => terminate("SIGTERM"));

async function main() {

    bot.use(async (ctx, next) => {

        const senderUserId: string = ctx.message?.from.id.toString() || '';
        const senderUsername: string = ctx.message?.from.username?.toString() || '';

        if (ctx.from?.is_bot) {
            return;
        }

        // TODO : lengkapi command-command yang valid
        const validCommands = ["halo", "mulai", "pilih-menu", "konfirmasi", "tes"];

        if (ctx.updateType === "message") {
            const command = getCommandName(ctx);

            if (command === "" || !validCommands.includes(command)) {
                next();
                return;
            }

            const [user] = await db`SELECT telegram_user_id,state,username FROM users WHERE telegram_user_id = ${senderUserId}`

            if (!user) {
                await db`INSERT INTO users (telegram_user_id, username, remaining_usage, level) 
                        VALUES (${senderUserId}, ${senderUsername}, 2, 'normal');`;
            } else {
                await db`UPDATE users SET 
                updated_at = ${new Date().toISOString()},
                state = 0
                WHERE telegram_user_id = ${senderUserId};`;
            }

            next();
            return;
        }

        next();
    })

    const commands = [
        introduction.register(bot),
        things.register(bot),
        confirmation.register(bot),
        search.register(bot)
    ].filter((v) => Array.isArray(v)).flat();

    bot.telegram.setMyCommands(commands.slice(0, 100)).then(o => o).catch((e) => { console.error(e) })

    console.log(`Launching Bot...`);
    bot.botInfo = await bot.telegram.getMe();
    console.log("Bot started");
    await bot.launch();
}

main();

console.log(`Successfully started server at ${server.hostname}:${server.port}...`)

