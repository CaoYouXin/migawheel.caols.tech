import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {DaoUtil} from "../dao/dao.util";
import "rxjs/add/operator/map";
import {SafeStyle} from "@angular/platform-browser";
import {PostType} from "../../const/post.type.const";
import {API} from "../../const/api.const";

@Injectable()
export class CategoryDao {

    constructor(private dao: DaoUtil) {}

    category(categoryName: string): Observable<Category> {
        let category = this.dao.get(API.getAPI('category'))
            .map(res => res.json())
            .map(ret => ret[Object.keys(ret).filter(k => k === categoryName)[0]]);

        let self = this;
        return new Observable<Category>(observer => {
            category.subscribe(cate => {
                self.posts().subscribe(ret => {
                    let imageList = [], noneImageList = [];
                    cate.posts.forEach(pt => {
                        switch (ret[pt].type) {
                            case PostType.APP:
                                imageList.push(new ListItem(pt, null, ret[pt].imageSrc));
                                break;
                            case PostType.ARTICLE:
                                noneImageList.push(new ListItem(pt, ret[pt].brief, null));
                                break;
                            default:break;
                        }
                    });

                    this.dao.get(cate.url)
                        .map(res => res.text())
                        .subscribe(content => {
                            observer.next(
                                new Category(content, cate.script, cate.create, cate.update, imageList, noneImageList)
                            );
                            observer.complete();
                        });
                });
            });
        });
    }

    posts(): Observable<any> {
        return this.dao.get(API.getAPI('post'))
            .map(res => res.json());
    }

}

export class Category {
    create: string;
    update: string;
    content: string;
    script: string;
    imageList: ListItem[];
    noneImageList: ListItem[];

    constructor(content: string,
                script: string,
                create: string,
                update: string,
                imageList: ListItem[],
                noneImageList: ListItem[]) {
        this.content = content;
        this.script = script;
        this.create = create;
        this.update = update;
        this.imageList = imageList;
        this.noneImageList = noneImageList;
    }
}

export class ListItem {
    title: string;
    brief: string;
    _imageSrc: string;
    imageSrc: SafeStyle;

    constructor(title: string, brief: string, imageSrc: string) {
        this.title = title;
        this.brief = brief;
        this._imageSrc = imageSrc;
    }
}
