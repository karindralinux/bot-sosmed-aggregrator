import type { Context, Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser, setStateUser, setThingTypeUser } from "../helpers/query";

export function register(bot: Telegraf) {
    bot.action(["KTP", "SIM", "STNK"], async (ctx: Context) => {
        await handleThing(ctx);
    })

    return []
}

async function handleThing(ctx: Context) {
    const message: any = ctx.update;
    const thingType = message?.callback_query?.data || '';
    const userId = ctx?.from?.id.toString() || '';

    const { state } = await getStateUser({ userId });

    if (state == 0) {

        await setThingTypeUser({ userId, thingType })

        await ctx.reply(`Baik, kamu cari ${thingType} ya. _Menyiapkan template..._`, {
            reply_markup: {
                remove_keyboard: true,
            },
            parse_mode: 'Markdown'
        })

        await ctx.telegram.sendMessage(userId, `
            *Nama Lengkap:* \n*Lokasi Terakhir :* \n*Rentang Waktu Hilang(dd/mm/yyyy) :* \n
        `, {
            parse_mode: 'Markdown'
        });

        await ctx.telegram.sendMessage(userId, `
            \nSilahkan salin pesan di atas dan masukkan ke kolom chat\nkemudian isi sesuai contoh pengisian di bawah ini \n
        `, {
            parse_mode: 'Markdown'
        });

        await ctx.telegram.sendMessage(userId, `
            *Contoh Pengisian* \n\n*Nama Lengkap:* Jhon Doe \n*Lokasi Terakhir :* Terminal Terboyo, Semarang \n*Waktu Hilang(dd/mm/yyyy) :* 25/05/2024 \n
        `, {
            parse_mode: 'Markdown'
        });

        // Update State to 1 (Waiting User Thing's Information Data)
        await setStateUser({
            userId,
            state: 1
        });
    }


}