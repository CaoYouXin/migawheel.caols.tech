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
        },
        "register": {
            "prod": "http://localhost:8080/user_api/user/register",
            "dev": "http://localhost:8080/user_api/user/register"
        },
        "CheckUserName": {
            "prod": function (username) {
                return `http://localhost:8080/user_api/username/check?username=${username}`;
            },
            "dev": function (username) {
                return `http://localhost:8080/user_api/username/check?username=${username}`;
            }
        },
        "captcha": {
            "prod": function (phone) {
                return `http://localhost:8080/user_api/captcha?phone=${phone}`;
            },
            "dev": function (phone) {
                return `http://localhost:8080/user_api/captcha?phone=${phone}`;
            }
        },
        "FindPassword": {
            "prod": function (phone) {
                return `http://localhost:8080/user_api/password/find?phone=${phone}`;
            },
            "dev": function (phone) {
                return `http://localhost:8080/user_api/password/find?phone=${phone}`;
            }
        },
        "ResetPassword": {
            "prod": "http://localhost:8080/user_api/password/reset",
            "dev": "http://localhost:8080/user_api/password/reset"
        },
        "CaptchaImage": {
            "prod": function (token) {
                return `url(http://localhost:8080/user_api/captcha/image?token=${token})`;
            },
            "dev": function (token) {
                return `url(http://localhost:8080/user_api/captcha/image?token=${token})`;
            }
        }
    };

    static setProductMode(mode: boolean) {
        API.mode = mode ? 'prod' : 'dev';
    }

    static getAPI(name: string) {
        return API.api[name][API.mode];
    }

}