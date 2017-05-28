import {Injectable} from "@angular/core";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs/Observable";
import {API} from "../../const/api.const";
import {LocalStorageKeys} from "../../const/localstorage.const";

@Injectable()
export class PostOpenerDao {

    constructor(private dao: DaoUtil) {}

    post(title: string): Observable<any> {
        return new Observable<any>(observer => {
            this.dao.get(API.getAPI('post')(title))
                .map(res => res.json())
                .subscribe(ret => {
                    if (ret.code !== 20000) {
                        alert(ret.body);
                        return;
                    }

                    localStorage.setItem(LocalStorageKeys.OpenedPost, JSON.stringify(ret.body));
                    observer.next(ret.body);
                    observer.complete();
                });
        });
    }

}
