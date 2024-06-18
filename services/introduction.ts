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

        bot.on('message', async (ctx) => {
            await ctx.telegram.sendMessage(senderChatId, "Kamu yakin sudah benar?🧐", {
                parse_mode: 'Markdown',
                reply_markup: {
                    resize_keyboard: true,
                    inline_keyboard: [
                        [{text: '👍 Sudah Benar', callback_data: 'save'}],
                        [{text: '📝 Edit Informasi', callback_data: 'edit'}]
                    ]
                }
            });
        })

        bot.action("save", async (ctx: Context) => {
            await ctx.reply(`_Tunggu Sebentar..._`, {
                parse_mode: 'Markdown'
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

        bot.action("edit", async (ctx: Context) => {
            await ctx.reply(`_Silahkan edit dan kirim kembali informasi yang benar..._`, {
                parse_mode: 'Markdown'
            });
        });

        // await ctx.telegram.sendMessage(senderChatId, `Di platform mana anda ingin mencari barang anda?`, {
        //     parse_mode: 'Markdown',
        //     reply_markup: {
        //         inline_keyboard: [
        //             [{ text: 'Facebook', callback_data: 'facebook' }],
        //             [{ text: 'Twitter', callback_data: 'twitter' }],
        //             [{ text: 'Instagram', callback_data: 'instagram' }]
        //         ]
        //     }
        // });

    });

    // bot.action("SAVE", async (ctx: Context) => {
    //     await ctx.reply(`_Tunggu Sebentar..._`, {
    //         parse_mode: 'Markdown'
    //     });

    //     await ctx.telegram.sendMessage(senderChatId, `Di platform mana anda ingin mencari barang anda?`, {
    //         parse_mode: 'Markdown',
    //         reply_markup: {
    //             inline_keyboard: [
    //                 [{ text: 'Facebook', callback_data: 'facebook' }],
    //                 [{ text: 'Twitter', callback_data: 'twitter' }],
    //                 [{ text: 'Instagram', callback_data: 'instagram' }]
    //             ]
    //         }
    //     });
    // });

    // bot.action("EDIT", async (ctx: Context) => {
    //     await ctx.reply(`_Silahkan edit dan kirim kembali informasi yang benar..._`, {
    //         parse_mode: 'Markdown'
    //     });
    // });

    bot.action("facebook", async (ctx: Context) => {
        await startScraping(ctx, 'facebook');
    });

    bot.action("twitter", async (ctx: Context) => {
        await startScraping(ctx, 'twitter');
    });

    bot.action("instagram", async (ctx: Context) => {
        await startScraping(ctx, 'instagram');
    });

    bot.action("lihat", async (ctx: Context) => {
        await showLink(ctx);
    });

    bot.action("ulang", async (ctx: Context) => {
        await getLink(ctx);
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
    await ctx.reply('Proses pencarian memakan waktu ⏳± 5 menit');
    await getLink(ctx);
}

async function scrapeTwitter(ctx: Context) {
    await ctx.reply('Proses pencarian memakan waktu ⏳± 5 menit');
}

async function scrapeInstagram(ctx: Context) {
    await ctx.reply('Proses pencarian memakan waktu ⏳± 5 menit');
}


async function getLink(ctx: Context) {

    const userId = ctx?.from?.id.toString() || '';

    await ctx.reply("Ada 5 postingan yang mirip sama kriteria barangmu nih");
    await ctx.telegram.sendMessage(userId, `Ada 5 postingan yang mirip sama kriteria barangmu nih`, {
        parse_mode: 'Markdown',
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [{text: 'Lihat Hasilnya', callback_data: 'lihat'}],
                [{text: '🔍 Cari ulang', callback_data: 'ulang'}]
            ]
        }
    });
}

const links: string[] = [
    'https://www.facebook.com/photo/?fbid=993526008810150&set=a.818611916301561',
    'https://www.facebook.com/photo/?fbid=993526008810150&set=a.818611916301562',
    'https://www.facebook.com/photo/?fbid=993526008810150&set=a.818611916301563',
    'https://www.facebook.com/photo/?fbid=993526008810150&set=a.818611916301564',
    'https://www.facebook.com/photo/?fbid=993526008810150&set=a.818611916301565'
];

async function showLink(ctx: Context) {
    const userId = ctx?.from?.id.toString() || '';

    let message = 'Berikut adalah link yang ditemukan:\n\n';
    links.forEach(link => {
        message += `${link}\n`;
    });

    await ctx.telegram.sendMessage(userId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔍 Cari ulang', callback_data: 'ulang' }]
            ]
        }
    });
}