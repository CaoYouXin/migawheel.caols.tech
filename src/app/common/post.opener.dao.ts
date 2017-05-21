import {Injectable} from "@angular/core";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs/Observable";
import {API} from "../../const/api.const";

@Injectable()
export class PostOpenerDao {

    constructor(private dao: DaoUtil) {}

    post(title: string): Observable<any> {
        return new Observable<any>(observer => {
            this.dao.get(API.getAPI('post'))
                .map(res => res.json())
                .subscribe(ret => {
                    observer.next(ret[title]);
                    observer.complete();
                });
        });
    }

}
