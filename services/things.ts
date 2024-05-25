import type { Context, Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser, setThingTypeUser } from "../helpers/cache";

export function register(bot: Telegraf, cache: Database) {
    bot.hears(["KTP", "SIM", "STNK"], async (ctx: Context) => {

        const message: any = ctx.message;
        const thingType = message?.text || '';
        const userId = message?.from.id.toString() || '';

        const { state } = getStateUser(cache, userId);

        if (state == 0) {

            setThingTypeUser(cache, userId, thingType)

            ctx.reply(`Baik, kamu cari ${thingType} ya`, {
                reply_markup: {
                    remove_keyboard: true,
                }
            })
        }
    })

    return []
}