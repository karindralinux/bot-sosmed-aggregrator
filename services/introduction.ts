import type { Context, Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser } from "../helpers/cache";

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
                keyboard: [
                    [
                        {
                            text: 'KTP'
                        },
                        {
                            text: 'SIM'
                        },
                        {
                            text: 'STNK'
                        }
                    ]
                ]
            }
        });

    });

    return [
        {
            command: "mulai",
            description: "Mulai menggunakan Got It Bot"
        }
    ];

}