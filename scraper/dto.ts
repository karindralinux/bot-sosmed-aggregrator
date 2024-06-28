export enum SCRAPER_PLATFORM {
    FACEBOOK = 'facebook',
    X = 'x',
    INSTAGRAM = 'instagram'
}

export enum QUERY_TYPE {
    GROUP = 'group',
    ACCOUNT = 'account',
    SEARCH_PAGE = 'search_page'
}

export interface BaseScraperPayloadDto {
    email: string;
    password: string;
}

export interface InitScraperDto extends BaseScraperPayloadDto {
    platform: string;
}

export interface SearchScraperDto {
    keyword: KeywordDto
    search: SearchQueryDto
}

export interface KeywordDto {
    name: string
    thing_type: string;
    estimated_lost_location: string;
    estimated_lost_time: string;
    search_keyword?: string;
}

export interface SearchQueryDto {
    type: QUERY_TYPE;
    query?: string;
    accountId?: string;
}
