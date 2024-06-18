import { Markup, Context, Telegraf } from "telegraf";
import { Database } from "bun:sqlite";
import { getStateUser, setThingTypeUser } from "../helpers/query";

export function register(bot: Telegraf) {

    bot.command("mulai", async (ctx: Context) => {

        const userId = ctx.message?.from.id.toString() || '';

        const state = await getStateUser({ userId });

        const senderChatId: number = ctx.message?.chat.id || 0;

        await ctx.reply(`_Memulai Percakapan..._`, {
            parse_mode: 'Markdown'
        });

        await ctx.telegram.sendMessage(senderChatId, `Hai, selamat datang di *Got It Chat Bot*. Barang apa yang ingin kamu cari?`, {
            parse_mode: 'Markdown',
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: [
                    [
                        {text: 'SIM', callback_data: 'SIM'},
                        {text: 'KTP', callback_data: 'KTP'},
                        {text: 'STNK', callback_data: 'STNK'}
                    ]
                ]
            }
        });

        await ctx.telegram.sendMessage(senderChatId, `Di platform mana anda ingin mencari barang anda?`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Facebook', callback_data: 'facebook' }],
                    [{ text: 'Twitter', callback_data: 'twitter' }],
                    [{ text: 'Instagram', callback_data: 'instagram' }]
                ]
            }
        });

    });

    bot.action("facebook", async (ctx: Context) => {
        await startScraping(ctx, 'facebook');
    });

    bot.action("twitter", async (ctx: Context) => {
        await startScraping(ctx, 'twitter');
    });

    bot.action("instagram", async (ctx: Context) => {
        await startScraping(ctx, 'instagram');
    });

    bot.command("riwayat", async (ctx: Context) => {
        await ctx.reply(`_Melihat Riwayat..._`, {
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

async function startScraping(ctx: Context, media: string) {
    const userId = ctx.message?.from.id.toString() || '';

    const state = await getStateUser({ userId });

    
    await setThingTypeUser({ userId, thingType: media });

    await ctx.reply(`Baik, kamu memilih ${media} ya, mohon tunggu sebentar...`, {
        parse_mode: 'Markdown'
    });


    switch (media) {
        case 'facebook':
            await scrapeFacebook(ctx);
            break;
        case 'twitter':
            await scrapeTwitter(ctx);
            break;
        case 'instagram':
            await scrapeInstagram(ctx);
            break;
    }
}

async function scrapeFacebook(ctx: Context) {
    await ctx.reply('Proses ini akan memakan waktu +- 5 menit');
}

async function scrapeTwitter(ctx: Context) {
    await ctx.reply('Proses ini akan memakan waktu +- 5 menit');
}

async function scrapeInstagram(ctx: Context) {
    await ctx.reply('Proses ini akan memakan waktu +- 5 menit');
}
