import type { Context, Telegraf } from "telegraf";
import { getStateUser } from "../helpers/query";
import { ScraperPlatform } from "../scraper/scraper";
import { link } from "telegraf/format";

export function register(bot: Telegraf) {

    bot.action("facebook", async (ctx: Context) => {
        await startScraping(ctx, 'facebook');
    });

    bot.action("twitter", async (ctx: Context) => {
        await startScraping(ctx, 'x');
    });

    bot.action("instagram", async (ctx: Context) => {
        await startScraping(ctx, 'instagram');
    });

    bot.action("lihat", async (ctx: Context) => {
        await showLink(ctx);
    });

    bot.action("ulang", async (ctx: Context) => {
        await getEmptyLilnk(ctx);
    });


    return []
}

async function startScraping(ctx: Context, media: string) {
    const userId = ctx?.from?.id.toString() || '';
    const { state } = await getStateUser({ userId });

    await ctx.reply(`Baik, kamu memilih ${media} ya, mohon tunggu sebentar...`, {
        parse_mode: 'Markdown'
    });

    await ctx.reply('Proses pencarian memakan waktu ⏳± 5 menit');

    console.log(`Facebook Email : `)

    const scraper = new ScraperPlatform({
        email: Bun.env.FACEBOOK_EMAIL || '',
        password: Bun.env.FACEBOOK_PASSWORD || '',
        platform: media,
    });

    const links = await scraper.search({
        name: 'Gunardi',
        thing_type: 'STNK',
        estimated_lost_location: 'Karangrejo kec. Boyolangu ',
        estimated_lost_time: '18-06-2024',
        search_keyword: 'stnk hilang gunardi'
    });

    await ctx.reply('Berikut linknya : ' + links?.[0]);
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
async function getEmptyLilnk(ctx: Context) {
    await ctx.reply(`Maaf, link tidak tersedia, silahkan coba masukkan keyword lain`);
}


async function getLink(ctx: Context) {

    const userId = ctx?.from?.id.toString() || '';

    await ctx.reply("Ada 5 postingan yang mirip sama kriteria barangmu nih");
    await ctx.telegram.sendMessage(userId, `Ada 5 postingan yang mirip sama kriteria barangmu nih`, {
        parse_mode: 'Markdown',
        reply_markup: {
            resize_keyboard: true,
            inline_keyboard: [
                [{ text: 'Lihat Hasilnya', callback_data: 'lihat' }],
                [{ text: '🔍 Cari ulang', callback_data: 'ulang' }]
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


// function search() {
//     const name = '';
//     const thing_type = '';
//     const estimation_lost_location = '';
//     const estimation_lost_date = '';

//     // TODO: add enabled platform for X & Instagram
//     const selected_platform = [
//         SCRAPER_PLATFORM.FACEBOOK
//     ];

//     selected_platform.forEach((platform: string) => {



//     })

// }