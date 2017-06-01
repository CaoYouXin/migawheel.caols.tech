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
