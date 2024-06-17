import { Markup, type Context, type Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser, setThingTypeUser } from "../helpers/cache";

export function register(bot: Telegraf, cache: Database) {

    bot.command("mulai", async (ctx: Context) => {

        const userId = ctx.message?.from.id.toString() || '';

        const { state } = getStateUser(cache, userId);

        const senderChatId: number = ctx.message?.chat.id || 0;

        await ctx.reply(`_Memulai Percakapan..._`, {
            parse_mode: 'Markdown'
        });

        await ctx.telegram.sendMessage(senderChatId, `Hai, selamat datang di *Got It Chat Bot*. Barang apa yang ingin kamu cari?`, {
            parse_mode: 'Markdown',
            reply_markup: {
                resize_keyboard: true,
                // keyboard: [
                //     [
                //         {
                //             text: 'KTP'
                //         },
                //         {
                //             text: 'SIM'
                //         },
                //         {
                //             text: 'STNK'
                //         }
                //     ]
                // ]
                inline_keyboard: [
                    [
                        {text: 'SIM', callback_data: 'SIM'},
                        {text: 'KTP', callback_data: 'KTP'},
                        {text: 'STNK', callback_data: 'STNK'}
                    ]
                ]
            }
        });

    });

    bot.command("riwayat", async (ctx: Context) => {
        await ctx.reply(`_Melihat Riwayat..._`, {
            parse_mode: 'Markdown'
        });
    });

    return [
        {
            command: "mulai",
            description: "Mulai menggunakan Got It Bot"
        },
        {
            command: "riwayat",
            description: "Melihat riwayat pencarian sebelumnya"
        }
    ];

}