import { chromium, devices } from "playwright-extra";
import { listenNetworkRequests } from "../helpers/listen-network-request";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { extractTxtFromImg } from "./extract";
import { QUERY_TYPE, type BaseScraperPayloadDto, type KeywordDto, type SearchScraperDto } from "./dto";

export enum QueryFacebookType {
    GROUP = 'group',
    ACCOUNT = 'account',
    SEARCH_PAGE = 'search_page'
}

export interface QueryFacebookDto {
    type: QueryFacebookType;
    query: string;
    accountId?: string;
}

const groups = [
    {
        id: '276774466702481',
        name: 'Media Informasi Kota Semarang',
    },
    {
        id: '279402147597730',
        name: 'MIK Semarang (Media Informasi Kota Semarang)'
    }
]


export class FacebookScraper {

    private email: string;
    private password: string;
    private isLogin: boolean = false;
    private browser: any;
    private context: any;

    BASE_URL = `https://m.facebook.com`

    URL = {
        login: `${this.BASE_URL}/login`
    }

    constructor(data: BaseScraperPayloadDto) {
        this.email = data.email;
        this.password = data.password;
        this.isLogin = true;
    }

    async initBrowser() {
        if (this.context) {
            return
        }

        this.browser = await chromium.launch({ headless: true });

        // TODO : change browser type to mobile device
        // const pixel7 = devices['Pixel 7'];

        this.context = await this.browser.newContext({
            screen: { width: 412, height: 915 },
            // viewport: { width: 412, height: 915 },
            // isMobile: true,
            storageState: {
                cookies: [
                    {
                        name: "locale",
                        value: 'id_ID',
                        domain: ".facebook.com",
                        path: "/",
                        expires: -1,
                        httpOnly: false,
                        secure: true,
                        sameSite: "None",
                    },
                    {
                        name: 'm_pixel_ratio',
                        value: '2.625',
                        domain: ".facebook.com",
                        path: "/",
                        expires: -1,
                        httpOnly: false,
                        secure: true,
                        sameSite: "None",
                    }
                ],
                origins: [],
            },
            // ...pixel7
        });

        return this.context;
    }

    async initPage(): Promise<Page> {

        console.log(`Launch the browser...`)
        await this.initBrowser();

        console.log('Open the new tab...')

        const page = await this.context.newPage();

        page.setDefaultTimeout(60 * 1000);

        console.log('goto facebook login page...')

        await page.goto(this.BASE_URL + '/login')

        listenNetworkRequests(page)

        if (!this.isLogin) {
            await this.login()
            this.isLogin = true
        }

        return page;
    }

    async login() {

        try {

            const page = await this.initPage();

            // Check is alteady login

            if (page.url() === "https://web.facebok.com") {
                this.isLogin = true;
                return
            }

            await page.getByPlaceholder('Email atau Nomor Telepon').fill(this.email)
            await page.getByPlaceholder('Kata Sandi').fill(this.password)

            console.log(await page.content())

            console.log('Submit login form..')

            try {

                await page.getByRole('button', { name: 'Masuk' }).click();
                await page.waitForResponse('https://web.facebook.com', {
                    timeout: 25000
                })

                this.isLogin = true

                console.log(`Successfully Login Facebook..`)

                return

            } catch (e) {
                console.log(e)

                console.log(`Error Login Facebook..`)


                if (page.url().includes('checkpoint')) {

                    console.log('Autentikasi 2FA...')

                    console.log('Open Popup Resent 2FA Token...')

                    await page.getByText('Tidak menerima kode?').click()
                    await page.waitForLoadState();
                    await page.waitForTimeout(20000)

                    console.log('Resent 2FA Token...')

                    await page.getByText('Kirimkan kode masuk lewat pesan teks').click()
                    await page.getByTitle("Tutup").click()


                    const prompt = "Input 2FA: ";
                    let twoFAToken: string = '';
                    process.stdout.write(prompt);

                    for await (const line of console) {
                        twoFAToken = line
                        break;
                    }

                    console.log(`TwoFA Token : `, twoFAToken)

                    await page.getByPlaceholder("Kode masuk").fill(twoFAToken)

                    console.log(`Submitted TwoFA Token...`)

                    await page.getByRole('button', { name: 'Kirim kode' }).click();

                    await page.waitForURL('https://web.facebook.com/')

                    console.log(`Homepage URL : `, page.url())

                    this.isLogin = true;
                    return
                }

            }

            await page.goto('https://web.facebook.com/')
            const data = await page.content()

            return new Response(data).body


        } catch (e) {

            console.error(e)

            console.error(e, 'Facebok: Login Error')

            throw e

        }
    }

    async search(data: SearchScraperDto) {

        console.log(`Preparing scrape on facebook..`);

        let result: string[] = [];

        switch (data.search.type) {
            case QUERY_TYPE.GROUP:
                result = await this.scrapeByGroup(data.keyword);
                break;
            case QUERY_TYPE.SEARCH_PAGE:
                // result = await this.scrapeBySearch(data.keyword)
                break;
        }

        console.log(`Result : `, result);
        console.log(`Finished scrape on twitter..`);
        this.browser.close();
        return result
    }

    async scrapeByGroup(keyword: KeywordDto) {

        const urls = groups.map((group) => `${this.BASE_URL}/groups/${group.id}`)

        const results = await Promise.allSettled(urls.map((url: string) => {
            return this.scrape(url, keyword)
        }))

        const formattedResult: string[] = []

        results.forEach((res) => {
            if (res.status === 'fulfilled') {
                formattedResult.push(...res.value);
            }
        })

        return formattedResult;
    }

    async scrapeBySearch(keyword: KeywordDto) {

        const url = `${this.BASE_URL}/search/top?q=${keyword.thing_type}%20hilang%20ditemukan`
        const results = await this.scrape(url, keyword);

        return results
    }

    async scrape(url: string, keyword: KeywordDto) {

        const page = await this.initPage()

        console.log(`Goto : ${url}`)

        await page.goto(url)

        console.log(`Wait Load State..`)
        await page.waitForLoadState()

        console.log(`Wait timeout..`)
        await page.waitForTimeout(2000)

        // Remove popup login

        const btn = await page.getByRole("button").all()
        console.log(`Buttons : `, btn)
        console.log(`Total Button  : `, btn.length)

        await page.getByRole("dialog").getByLabel('Tutup').click()
        await page.waitForLoadState("domcontentloaded")
        await page.waitForLoadState('networkidle')


        console.log(`Creating screenshoots folder..`)
        await mkdir("./screenshots", { recursive: true });

        await page.screenshot({ path: `./screenshots/home.png` });

        await page.evaluate(() => {
            document.body.style.transform = 'scale(0.67)'
        })


        console.log(`Preparing search on facebook..`)

        const feed = await page.getByRole("feed").textContent()

        console.log(feed)

        const response: string[] = [];

        for (let i = 0; i < 5; i++) {
            const currentId = i + 1;
            const timestamp = new Date().getTime()

            console.log(`Load post ${currentId}-${timestamp}..`)


            await page.waitForLoadState("domcontentloaded")
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(2000)

            await page.evaluate(
                pos => window.scrollTo(pos.x, pos.y),
                { x: 1000, y: currentId * 6000 });

            // TODO: cek kalau ada tombol like / share. kalau belum nemu scroll lagi

            await page.waitForTimeout(2000)
            await page.waitForLoadState('networkidle')

            console.log(`Screenshotinging Page : ${currentId}...`,)

            const nth = currentId === 1 ? 0 : currentId + 5

            const imgBuffer = await page.getByRole('article')
                .nth(nth)
                .screenshot({ path: `./screenshots/screenshot${currentId}-${timestamp}.png` });

            const data = await extractTxtFromImg(imgBuffer)
            
            console.log(`Data : `, data)

            // if (data.includes(keyword.name) || data.includes(keyword.thing_type) || data.includes(keyword.estimated_lost_location)) {
                response.push(data)
            // }
        }

        return response
    }


    // async submitFormLogin(response: any) {

    //     console.log(response)

    //     let submitLoginUrl: string = '' || this.URL.login;

    //     this.rewriter.on("*", {
    //         element(el) {

    //             // switch (el.getAttribute("name")) {
    //             //     case "email":
    //             //         el.setAttribute("value", email);
    //             //         break;
    //             //     case "password":
    //             //         el.setAttribute("value", password)
    //             //         break;
    //             // }

    //             if (el.tagName === "form" && el.getAttribute('data-testid') === 'royal_login_form') {
    //                 submitLoginUrl = el.getAttribute("action") || submitLoginUrl;
    //             }

    //         },
    //     });

    //     await (this.rewriter.transform(new Response(response))).text()

    //     const formData = new FormData()
    //     formData.append("email", this.email)
    //     formData.append("pass", this.password)
    //     formData.append("_fb_noscript", "null")

    //     console.log('Submit Login URL : ', this.BASE_URL + submitLoginUrl)

    //     const responseLogin = await fetch(this.BASE_URL + submitLoginUrl, {
    //         method: 'POST',
    //         body: formData
    //     })

    //     return responseLogin.body
    // }

}