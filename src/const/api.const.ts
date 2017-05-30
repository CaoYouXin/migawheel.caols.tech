import {environment} from "../environments/environment";

export class API {

    static mode = environment.production ? 'prod' : 'dev';

    static api = {
        "categories": {
            "prod": "/blog_api/category/list",
            "dev": "http://localhost:8080/blog_api/category/list"
        },
        "category": {
            "prod": function (name) {
                return `/blog_api/category/fetch_by_name?name=${name}`;
            },
            "dev": function (name) {
                return `http://localhost:8080/blog_api/category/fetch_by_name?name=${name}`;
            }
        },
        "posts": {
            "prod": function (category) {
                return `/blog_api/post/list_by_category?platform=All,Pc,Mobile&category=${category}`;
            },
            "dev": function (category) {
                return `http://localhost:8080/blog_api/post/list_by_category?platform=All,Pc,Mobile&category=${category}`;
            }
        },
        "post": {
            "prod": function (name) {
                return `/blog_api/post/fetch_by_name?name=${name}`;
            },
            "dev": function (name) {
                return `http://localhost:8080/blog_api/post/fetch_by_name?name=${name}`;
            }
        },
        "date_index": {
            "prod": "http://caols.tech/api/date_index.json",
            "dev": "http://caols.tech/api/date_index.json"
        },
        "login": {
            "prod": "/user_api/user/login",
            "dev": "http://localhost:8080/user_api/user/login"
        },
        "register": {
            "prod": "/user_api/user/register",
            "dev": "http://localhost:8080/user_api/user/register"
        },
        "CheckUserName": {
            "prod": function (username) {
                return `/user_api/username/check?username=${username}`;
            },
            "dev": function (username) {
                return `http://localhost:8080/user_api/username/check?username=${username}`;
            }
        },
        "captcha": {
            "prod": function (phone) {
                return `/user_api/captcha?phone=${phone}`;
            },
            "dev": function (phone) {
                return `http://localhost:8080/user_api/captcha?phone=${phone}`;
            }
        },
        "FindPassword": {
            "prod": function (phone) {
                return `/user_api/password/find?phone=${phone}`;
            },
            "dev": function (phone) {
                return `http://localhost:8080/user_api/password/find?phone=${phone}`;
            }
        },
        "ResetPassword": {
            "prod": "/user_api/password/reset",
            "dev": "http://localhost:8080/user_api/password/reset"
        },
        "CaptchaImage": {
            "prod": function (token) {
                return `url(/user_api/captcha/image?token=${token})`;
            },
            "dev": function (token) {
                return `url(http://localhost:8080/user_api/captcha/image?token=${token})`;
            }
        }
    };

    static getAPI(name: string) {
        return API.api[name][API.mode];
    }

}