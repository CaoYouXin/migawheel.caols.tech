import {environment} from "../environments/environment";

export class API {

    static mode = environment.production ? 'prod' : 'dev';

    static api = {
        "categories": {
            "prod": `http://server.caols.tech:9003/category/list`,
            "dev": `http://${document.domain}:8080/blog_api/category/list`
        },
        "category": {
            "prod": function (name) {
                return `http://server.caols.tech:9003/category/fetch_by_name?name=${name}`;
            },
            "dev": function (name) {
                return `http://${document.domain}:8080/blog_api/category/fetch_by_name?name=${name}`;
            }
        },
        "posts": {
            "prod": function (category) {
                return `http://server.caols.tech:9003/post/list_by_category?platform=All,Pc,Mobile&category=${category}`;
            },
            "dev": function (category) {
                return `http://${document.domain}:8080/blog_api/post/list_by_category?platform=All,Pc,Mobile&category=${category}`;
            }
        },
        "post": {
            "prod": function (name) {
                return `http://server.caols.tech:9003/post/fetch_by_name?name=${name}`;
            },
            "dev": function (name) {
                return `http://${document.domain}:8080/blog_api/post/fetch_by_name?name=${name}`;
            }
        },
        "like": {
            "prod": function (postId) {
                return `http://server.caols.tech:9003/feedback/like?postId=${postId}`;
            },
            "dev": function (postId) {
                return `http://${document.domain}:8080/blog_api/feedback/like?postId=${postId}`;
            }
        },
        "FetchComments": {
            "prod": function (postId) {
                return `http://server.caols.tech:9003/feedback/comment/list?postId=${postId}`;
            },
            "dev": function (postId) {
                return `http://${document.domain}:8080/blog_api/feedback/comment/list?postId=${postId}`;
            }
        },
        "CommentPost": {
            "prod": `http://server.caols.tech:9003/feedback/comment/post`,
            "dev": `http://${document.domain}:8080/blog_api/feedback/comment/post`
        },
        "CommentComment": {
            "prod": function(postId) {
                return `http://server.caols.tech:9003/feedback/comment/comment?postId=${postId}`;
            },
            "dev": function (postId) {
                return `http://${document.domain}:8080/blog_api/feedback/comment/comment?postId=${postId}`;
            }
        },
        "login": {
            "prod": `http://server.caols.tech:9001/user/login`,
            "dev": `http://${document.domain}:8080/user_api/user/login`
        },
        "register": {
            "prod": `http://server.caols.tech:9001/user/register`,
            "dev": `http://${document.domain}:8080/user_api/user/register`
        },
        "CheckUserName": {
            "prod": function (username) {
                return `http://server.caols.tech:9001/username/check?username=${username}`;
            },
            "dev": function (username) {
                return `http://${document.domain}:8080/user_api/username/check?username=${username}`;
            }
        },
        "captcha": {
            "prod": function (phone) {
                return `http://server.caols.tech:9001/captcha?phone=${phone}`;
            },
            "dev": function (phone) {
                return `http://${document.domain}:8080/user_api/captcha?phone=${phone}`;
            }
        },
        "FindPassword": {
            "prod": function (phone) {
                return `http://server.caols.tech:9001/password/find?phone=${phone}`;
            },
            "dev": function (phone) {
                return `http://${document.domain}:8080/user_api/password/find?phone=${phone}`;
            }
        },
        "ResetPassword": {
            "prod": `http://server.caols.tech:9001/password/reset`,
            "dev": `http://${document.domain}:8080/user_api/password/reset`
        },
        "CaptchaImage": {
            "prod": function (token) {
                return `url(/user_api/captcha/image?token=${token})`;
            },
            "dev": function (token) {
                return `url(http://${document.domain}:8080/user_api/captcha/image?token=${token})`;
            }
        },
        "PreviousPost": {
            "prod": `http://server.caols.tech:9003/post/previous`,
            "dev": `http://${document.domain}:8080/blog_api/post/previous`
        },
        "NextPost": {
            "prod": `http://server.caols.tech:9003/post/next`,
            "dev": `http://${document.domain}:8080/blog_api/post/next`
        },
        "Top5Posts": {
            "prod": `http://server.caols.tech:9003/post/list_top_5`,
            "dev": `http://${document.domain}:8080/blog_api/post/list_top_5`
        },
        "SearchCategory": {
            "prod": `http://server.caols.tech:9003/search/category`,
            "dev": `http://${document.domain}:8080/blog_api/search/category`
        },
        "SearchPost": {
            "prod": `http://server.caols.tech:9003/search/post`,
            "dev": `http://${document.domain}:8080/blog_api/search/post`
        },
        "SearchPostWithCategory": {
            "prod": `http://server.caols.tech:9003/search/post_with_category`,
            "dev": `http://${document.domain}:8080/blog_api/search/post_with_category`
        }
    };

    static getAPI(name: string) {
        return API.api[name][API.mode];
    }

}