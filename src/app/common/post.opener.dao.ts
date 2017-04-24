import {Injectable} from "@angular/core";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs/Observable";

@Injectable()
export class PostOpenerDao {

    constructor(private dao: DaoUtil) {}

    post(title: string): Observable<any> {
        return new Observable<any>(observer => {
            this.dao.get('/assets/post.json')
                .map(res => res.json())
                .subscribe(ret => {
                    observer.next(ret[title]);
                    observer.complete();
                });
        });
    }

}
