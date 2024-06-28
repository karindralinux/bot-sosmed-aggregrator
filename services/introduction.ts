import { Context, Telegraf } from "telegraf";
import { getStateUser } from "../helpers/query";
import db from "../db/init";

export function register(bot: Telegraf) {

    bot.start(async (ctx: Context) => {
        await start(bot, ctx);
    })

    bot.command("mulai", async (ctx: Context) => {
        await start(bot, ctx);
    });

    bot.command("riwayat", async (ctx: Context) => {
        await ctx.reply(`_Melihat Riwayat... (fitur sedang dalam pengembangan)_`, {
            parse_mode: 'Markdown'
        });
    });

    return [
        {
            command: "mulai",
            description: "Memulai menggunakan Got It Bot"
        },
        {
            command: "riwayat",
            description: "Melihat riwayat pencarian sebelumnya"
        }
    ];
}

async function start(bot: Telegraf, ctx: Context) {

    const userId = ctx.message?.from.id.toString() || '';
    const state = await getStateUser({ userId });
    const senderChatId: number = ctx.message?.chat.id || 0;


    await db`UPDATE users SET 
    updated_at = ${new Date().toISOString()},
    state = 0
    WHERE telegram_user_id = ${userId};`;

    await ctx.reply(`_Memulai Percakapan..._`, {
        parse_mode: 'Markdown'
    });

    await ctx.telegram.sendMessage(senderChatId, `Hai, selamat datang di *Got It Chat Bot*. Barang apa yang ingin kamu cari?`, {
        parse_mode: 'Markdown',
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [
                    { text: 'SIM', callback_data: 'SIM' },
                    { text: 'KTP', callback_data: 'KTP' },
                    { text: 'STNK', callback_data: 'STNK' }
                ]
            ]
        }
    });
}