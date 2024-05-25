import type { Context, Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser } from "../helpers/cache";

export function register(bot: Telegraf, cache: Database) {
    bot.hears(["KTP", "SIM", "STNK"], async (ctx: Context) => {

        const userId = ctx.message?.from.id.toString() || '';

        const { state } = getStateUser(cache, userId);

        if (state == 0) {
            ctx.reply("Oke, tak cek dulu...", {
                reply_markup: {
                    remove_keyboard: true,
                }
            })
        }
    })

    return []
}