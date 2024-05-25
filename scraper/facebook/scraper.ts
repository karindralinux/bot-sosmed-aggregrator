import { chromium, devices } from "playwright-extra";
import { listenNetworkRequests } from "../../helpers/listen-network-request";
import type { Browser, Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { extractTxtFromImg } from "./extract";

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


export class FacebookScraper {

    private email: string;
    private password: string;
    private isLogin: boolean = false;
    private page: any;

    BASE_URL = `https://m.facebook.com`

    URL = {
        login: `${this.BASE_URL}/login`
    }

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
        this.isLogin = true;
    }

    async initPage(): Promise<[Browser, Page]> {

        console.log(`Launch the browser...`)
        const browser = await chromium.launch({ headless: true });

        // TODO : change browser type to mobile device
        // const pixel7 = devices['Pixel 7'];

        const context = await browser.newContext({
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


        console.log('Open the new tab...')

        const page = await context.newPage();

        this.page = page

        page.setDefaultTimeout(60 * 1000);

        console.log('goto facebook login page...')

        await page.goto(this.BASE_URL + '/login')

        listenNetworkRequests(page)

        if (!this.isLogin) {
            await this.login()
        }

        return [browser, page];
    }

    async login() {

        try {

            await this.initPage();

            // Check is alteady login

            if (this.page.url() === "https://web.facebok.com") {
                this.isLogin = true;
                return
            }

            await this.page.getByPlaceholder('Email atau Nomor Telepon').fill(this.email)
            await this.page.getByPlaceholder('Kata Sandi').fill(this.password)

            console.log('Submit login form..')

            try {

                this.page.getByRole('button', { name: 'Masuk' }).click();
                this.page.waitForResponse('https://web.facebook.com', {
                    timeout: 5000
                })

                this.isLogin = true

                return

            } catch (e) {

                if (this.page.url().includes('checkpoint')) {

                    console.log('Autentikasi 2FA...')

                    console.log('Open Popup Resent 2FA Token...')

                    await this.page.getByText('Tidak menerima kode?').click()
                    await this.page.waitForLoadState();
                    await this.page.waitForTimeout(2000)

                    console.log('Resent 2FA Token...')

                    await this.page.getByText('Kirimkan kode masuk lewat pesan teks').click()
                    await this.page.getByTitle("Tutup").click()


                    const prompt = "Input 2FA: ";
                    let twoFAToken: string = '';
                    process.stdout.write(prompt);

                    for await (const line of console) {
                        twoFAToken = line
                        break;
                    }

                    console.log(`TwoFA Token : `, twoFAToken)

                    await this.page.getByPlaceholder("Kode masuk").fill(twoFAToken)

                    console.log(`Submitted TwoFA Token...`)

                    await this.page.getByRole('button', { name: 'Kirim kode' }).click();

                    await this.page.waitForURL('https://web.facebook.com/')

                    console.log(`Homepage URL : `, this.page.url())

                    this.isLogin = true;
                    return
                }

            }

            await this.page.goto('https://web.facebook.com/')
            const data = await this.page.content()

            return new Response(data).body


        } catch (e) {

            console.error(e)

            console.error(e, 'Facebok: Login Error')

            throw e

        }
    }

    async search(data: QueryFacebookDto) {

        const [browser, page] = await this.initPage()

        console.log(`Preparing search on facebook..`)

        let url = this.BASE_URL

        switch (data.type) {
            case QueryFacebookType.ACCOUNT:
                // url += 
                break;
            case QueryFacebookType.GROUP:
                url += `/groups/${data.accountId}`
                break;
            case QueryFacebookType.SEARCH_PAGE:
                url += `/search/posts/?q=${data.query}`
                break;
            default:
                throw Error('Query Type Not Found');
        }

        console.log(`Goto : ${url}`)

        await page.goto(url)
        
        console.log(`Wait Load State..`)
        await page.waitForLoadState()

        console.log(`Wait timeout..`)
        await page.waitForTimeout(2000)

        // Remove popup login

        const btn = await page.getByRole("button").all()
        console.log(`Buttons : `, btn)
        console.log(`Total Button  : `,btn.length)

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

        const response: string[] = [];

        for (let i = 0; i < 5; i++) {
            let currentId = i + 1;

            console.log(`Load post ${currentId}..`)


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

            let nth = currentId === 1 ? 0 : currentId + 5

            const imgBuffer = await page.getByRole('article')
                .nth(nth)
                .screenshot({ path: `./screenshots/screenshot${currentId}.png` });

            const data = await extractTxtFromImg(imgBuffer)

            response.push(data)
        }

        console.log('Closing the browser..')

        await browser.close()

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