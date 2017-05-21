import {Injectable} from "@angular/core";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";
import {API} from "../const/api.const";

@Injectable()
export class ArticleDao {

    constructor(private dao: DaoUtil) {}

    post(title: string): Observable<Post> {
        let post = this.dao.get(API.getAPI('post'))
            .map(res => res.json())
            .map(ret => ret[Object.keys(ret).filter(k => k === title)[0]]);

        return new Observable<Post>(observer => {
            post.subscribe(ret => {
                this.dao.get(ret.url)
                    .map(res => res.text())
                    .subscribe(content => {
                        observer.next(new Post(content, ret.script, ret.create, ret.update, ret.category));
                        observer.complete();
                    });
            });
        });
    }

}

export class Post {
    content: string;
    script: string;
    create: string;
    update: string;
    category: string;

    constructor(content: string,
                script: string,
                create: string,
                update: string,
                category: string) {
        this.content = content;
        this.script = script;
        this.create = create;
        this.update = update;
        this.category = category;
    }
}
