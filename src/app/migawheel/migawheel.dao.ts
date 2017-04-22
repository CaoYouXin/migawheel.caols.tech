import {Injectable} from "@angular/core";
import {AnalysisResult} from "./migawheel.search";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs";
import {Response} from "@angular/http";
import 'rxjs/add/operator/map';

@Injectable()
export class MigaWheelDao {

    constructor(private dao: DaoUtil) {}

    categories(): Observable<string[]> {
        // return ['Demo', 'APP', '学习笔记', '生活纪实', '感言', '灵感', '知识总结'];
        return this.dao.get('/assets/category.json')
            .map(res => Object.keys(res.json().categories));
    }

    search(analysis: AnalysisResult[]): string[] {

        return null;
    }

}
