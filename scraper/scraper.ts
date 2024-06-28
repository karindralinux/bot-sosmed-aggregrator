import { FacebookScraper } from "./facebook";
import { QUERY_TYPE, SCRAPER_PLATFORM, type InitScraperDto, type KeywordDto } from "./dto";
import { crawl } from "./twitter";
// import { TwitterScraper } from "./twitter";

export class ScraperPlatform {

    private email: string;
    private password: string;
    private platform: string;
    private scraper: FacebookScraper;

    constructor(payload: InitScraperDto) {
        this.email = payload.email;
        this.password = payload.password;
        this.platform = payload.platform;

        switch (this.platform) {
            case SCRAPER_PLATFORM.FACEBOOK:
                this.scraper = new FacebookScraper({ email: this.email, password: this.password });
                break;
            case SCRAPER_PLATFORM.X:
                // this.scraper = new TwitterScraper({ email: this.email, password: this.password })
                this.scraper = new FacebookScraper({ email: this.email, password: this.password });
                break;
            default:
                throw new Error('Scraper Not Found');
        }
    }

    async search(keyword: KeywordDto) {

        // await this.scraper.login();

        // const searchResults = await Promise.allSettled([
        //     this.scraper.search({
        //         keyword,
        //         search: {
        //             type: QUERY_TYPE.SEARCH_PAGE
        //         }
        //     }),
        //     this.scraper.search({
        //         keyword,
        //         search: {
        //             type: QUERY_TYPE.GROUP
        //         }
        //     })
        // ]);

        // const results: string[] = [];

        // searchResults.forEach((res) => {
        //     if (res.status === 'fulfilled') {
        //         results.push(...res.value);
        //     }
        // });

        const results =
            crawl({
                ACCESS_TOKEN: "53988181d71b628b52ee6993c5ce42447ec73293",
                SEARCH_KEYWORDS: `Gibran`,
                // TWEET_THREAD_URL: "https://x.com/pangeransiahaan/status/1690590234009112576",
                TARGET_TWEET_COUNT: 100,
                OUTPUT_FILENAME: "gibran.csv",
                DELAY_EACH_TWEET_SECONDS: 0,
                DELAY_EVERY_100_TWEETS_SECONDS: 0,
                SEARCH_TAB: "LATEST",
                CSV_INSERT_MODE: "REPLACE",
            });

        return results
    }

}