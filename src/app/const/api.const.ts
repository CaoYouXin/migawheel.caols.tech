export class API {

    static DevMode: boolean;

    static setDevMode(devMode: boolean) {
        API.DevMode = devMode;

        if (devMode) {
            API.CategoryJson = API.CategoryJsonDevMode;
            API.PostJson = API.PostJsonDevMode;
            API.DateIndexJson = API.DateIndexJsonDevMode;
        } else {
            API.CategoryJson = API.CategoryJsonProductMode;
            API.PostJson = API.PostJsonProductMode;
            API.DateIndexJson = API.DateIndexJsonProductMode;
        }
    }

    static CategoryJson: string = API.CategoryJsonProductMode;
    static PostJson: string = API.PostJsonProductMode;
    static DateIndexJson: string = API.DateIndexJsonProductMode;

    private static CategoryJsonProductMode = 'http://caols.tech/api/category.json';
    private static PostJsonProductMode = 'http://caols.tech/api/post.json';
    private static DateIndexJsonProductMode = 'http://caols.tech/api/date_index.json';

    private static CategoryJsonDevMode = '/assets/category.json';
    private static PostJsonDevMode = '/assets/post.json';
    private static DateIndexJsonDevMode = '/assets/date_index.json';

}