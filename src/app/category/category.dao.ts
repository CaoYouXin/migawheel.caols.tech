import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {DaoUtil} from "../dao/dao.util";
import "rxjs/add/operator/map";

@Injectable()
export class CategoryDao {

    constructor(private dao: DaoUtil) {}

    html(url: string): Observable<string> {
        return this.dao.get(url).map(res => res.text());
    }

}
