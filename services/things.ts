import type { Context, Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser, setThingTypeUser } from "../helpers/cache";

export function register(bot: Telegraf, cache: Database) {
    bot.action(["KTP", "SIM", "STNK"], async (ctx: Context) => {
        await handleThing(ctx, cache);
    })

    return []
}

async function handleThing(ctx: Context, cache: Database) {
    const message: any = ctx.update;
    const thingType = message?.callback_query?.data || '';
    const userId = ctx?.from?.id.toString() || '';

    const { state } = getStateUser(cache, userId);

    if (state == 0) {

        setThingTypeUser(cache, userId, thingType)

        await ctx.reply(`Baik, kamu cari ${thingType} ya. _Menyiapkan template..._`, {
            reply_markup: {
                remove_keyboard: true,
            },
            parse_mode: 'Markdown'
        })

        await ctx.telegram.sendMessage(userId, `
            *Nama :* \n*Lokasi Terakhir :* \n*Rentang Waktu Hilang :* \n
        `, {
            parse_mode: 'Markdown'
        });
    }
}