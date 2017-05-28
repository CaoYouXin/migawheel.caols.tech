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
        return new Observable<Post>(observer => {
            let ret = JSON.parse(localStorage.getItem(LocalStorageKeys.OpenedPost));

            this.dao.get(ret.url)
                .map(res => res.text())
                .subscribe(content => {
                    observer.next(new Post(content, ret.script, ret.create, ret.update, ret.categoryName));
                    observer.complete();
                });
        });
    }

}

export class Post {
    content: string;
    script: string;
    create: string;
    update: string;
    categoryName: string;

    constructor(content: string,
                script: string,
                create: string,
                update: string,
                category: string) {
        this.content = content;
        this.script = script;
        this.create = create;
        this.update = update;
        this.categoryName = category;
    }
}
