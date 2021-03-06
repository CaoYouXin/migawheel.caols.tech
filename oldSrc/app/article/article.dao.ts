import {Injectable} from "@angular/core";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";
import {API} from "../../const/api.const";
import {LocalStorageKeys} from "../../const/localstorage.const";

@Injectable()
export class ArticleDao {

    constructor(private dao: DaoUtil) {}

    post(title: string): Observable<Post> {
        let post = this.dao.get(API.getAPI("post")(title))
            .map(res => res.json())
            .map(ret => {
                if (ret.code !== 20000) {
                    alert(ret.body);
                    return;
                }

                return ret.body;
            });

        return new Observable<Post>(observer => {
            post.subscribe(ret => {
                this.dao.get(ret.url)
                    .map(res => res.text())
                    .subscribe(content => {
                        observer.next(new Post(ret.id, content, ret.script, ret.create, ret.update, ret.categoryName, ret.like));
                        observer.complete();
                    });
            }, error => DaoUtil.logError(error));
        });
    }

    like(postId: number) :Observable<any> {
        return this.dao.get(API.getAPI("like")(postId))
            .map(res => res.json());
    }

    fetchComments(postId: number): Observable<any> {
        return this.dao.get(API.getAPI("FetchComments")(postId))
            .map(res => res.json());
    }

    commentPost(postId: number, content: string): Observable<any> {
        return this.dao.post(API.getAPI("CommentPost"), {
            idWhatEver: postId,
            userName: JSON.parse(localStorage.getItem(LocalStorageKeys.User)).userView.userName,
            content: content
        }).map(res => res.json());
    }

    commentComment(postId: number, commentId: number, atUserName: string, content: string): Observable<any> {
        return this.dao.post(API.getAPI("CommentComment")(postId), {
            idWhatEver: commentId,
            userName: JSON.parse(localStorage.getItem(LocalStorageKeys.User)).userView.userName,
            content: content,
            atUserName: atUserName,
        }).map(res => res.json());
    }

    previous(date): Observable<string> {
        let previousPost = this.dao.post(API.getAPI("PreviousPost"), {
            date: date
        }).map(res => res.json());

        return new Observable<string>(observer => {
            previousPost.subscribe(ret =>
                DaoUtil.process(ret, function (post) {
                    observer.next(post.name);
                    observer.complete();
                }), error => DaoUtil.logError(error)
            );
        });
    }

    next(date): Observable<string> {
        let nextPost = this.dao.post(API.getAPI("NextPost"), {
            date: date
        }).map(res => res.json());

        return new Observable<string>(observer => {
            nextPost.subscribe(ret =>
                DaoUtil.process(ret, function (post) {
                    observer.next(post.name);
                    observer.complete();
                }), error => DaoUtil.logError(error)
            );
        });
    }

    top5(): Observable<Array<string>> {
        let top5Posts = this.dao.get(API.getAPI("Top5Posts")).map(res => res.json());

        return new Observable<Array<string>>(observer => {
            top5Posts.subscribe(ret =>
                DaoUtil.process(ret, function (posts) {
                    let top5 = [];
                    posts.forEach(post => top5.push(post.name));
                    observer.next(top5);
                    observer.complete();
                }), error => DaoUtil.logError(error)
            );
        });
    }

}

export class Post {
    postId: number;
    content: string;
    script: string;
    create: string;
    update: string;
    categoryName: string;
    articleLikeCount: number;

    constructor(postId: number,
                content: string,
                script: string,
                create: string,
                update: string,
                category: string,
                articleLikeCount: number) {
        this.postId = postId;
        this.content = content;
        this.script = script;
        this.create = create;
        this.update = update;
        this.categoryName = category;
        this.articleLikeCount = articleLikeCount;
    }
}
