export class API {

    static mode: string;
    static api = {
        "category": {
            "prod": "http://caols.tech/api/category.json",
            "dev": "/assets/category.json"
        },
        "post": {
            "prod": "http://caols.tech/api/post.json",
            "dev": "/assets/post.json"
        },
        "date_index": {
            "prod": "http://caols.tech/api/date_index.json",
            "dev": "/assets/date_index.json"
        },
        "login": {
            "prod": "http://localhost:8080/user_api/user/login",
            "dev": "http://localhost:8080/user_api/user/login"
        }
    };

    static setProductMode(mode: boolean) {
        API.mode = mode ? 'prod' : 'dev';
    }

    static getAPI(name: string) {
        return API.api[name][API.mode];
    }

}