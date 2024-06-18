import type { Context, Telegraf } from "telegraf";
import { getStateUser } from "../helpers/query";

export function register(bot: Telegraf) {

    bot.on('message', async (ctx: Context) => {

        const userId = ctx.message?.from.id.toString() || '';
        const { state } = await getStateUser({ userId });
        const senderChatId: number = ctx.message?.chat.id || 0;

        if (state == 1) {

            await ctx.telegram.sendMessage(senderChatId, "Kamu yakin sudah benar?🧐", {
                parse_mode: 'Markdown',
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{ text: '👍 Sudah Benar', callback_data: 'save' }],
                        [{ text: '📝 Edit Informasi', callback_data: 'edit' }]
                    ]
                }
            });
        }
    })


    bot.action("save", async (ctx: Context) => {

        const userId = ctx?.from?.id.toString() || '';
    
        const { state } = await getStateUser({ userId });

        // TODO: save information string

        if (state == 1) {
            await ctx.reply(`_Tunggu Sebentar..._`, {
                parse_mode: 'Markdown'
            });

            // TODO: update state ke 2 (Pilih Platform)

            await ctx.telegram.sendMessage(userId, `Di platform mana anda ingin mencari barang anda?`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Facebook', callback_data: 'facebook' }],
                        [{ text: 'Twitter (Coming Soon)', callback_data: 'twitter' }],
                        [{ text: 'Instagram (Coming Soon)', callback_data: 'instagram' }],
                        [{ text: 'Semuanya (Coming Soon)', callback_data: 'all' }]

                    ]
                }
            });
        }


    });


    bot.action("edit", async (ctx: Context) => {
        await ctx.reply(`_Silahkan edit dan kirim kembali informasi yang benar..._`, {
            parse_mode: 'Markdown'
        });
    });

    return []
}