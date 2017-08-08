import {Injectable} from "@angular/core";
import {Configs as Cfgs} from "./migawheel.core";

class Configs {
    static NoItemError: string = '没有找到合适的...';
    static MonthError: string = '搜索串有误：月份超出地球月范围。';
    static DayError: string = '搜索串有误：日期超出地球日范围。';
    static TimeOrderError: string = '搜索串有误：时间顺序[key]错误。';

    static RegExpStr = {
        year: 'Y(\\d{4}|\\d{2})(?:-(\\d{4}|\\d{2}))?',
        month: 'M(\\d{2}|\\d)(?:-(\\d{2}|\\d))?',
        day: 'D(\\d{2}|\\d)(?:-(\\d{2}|\\d))?',
    };
}

@Injectable()
export class MigaWheelSearch {

    errorMsg: string = Configs.NoItemError;

    private _analysis(mode: string, str: string): AnalysisResult {

        let ret = new AnalysisResult(mode), keys = Object.keys(Configs.RegExpStr);

        let splitRegItems = [' +'];
        for (let index = 0; index < keys.length; index++) {
            let i, key = keys[index], reg = Configs.RegExpStr[key];
            let matched = str.match(new RegExp(reg));
            if (matched) {

                let retProp = ret[key];
                for (i = 1; i < matched.length; i++) {

                    if (matched[i] === undefined) {
                        continue;
                    }

                    if (key === 'year' && matched[i].length === 2) {
                        matched[i] = '20' + matched[i];
                    }

                    let parsed = parseInt(matched[i]);

                    if (key === 'month' && (parsed < 1 || parsed > 12)) {
                        this.errorMsg = Configs.MonthError;
                        return null;
                    }
                    if (key === 'day' && (parsed < 1 || parsed > 31)) {
                        this.errorMsg = Configs.DayError;
                        return null;
                    }

                    retProp[i === 1 ? 'start' : 'end'] = parsed;
                }

                if (!!retProp.end && retProp.end < retProp.start) {
                    this.errorMsg = Configs.TimeOrderError.replace('key', key);
                    return null;
                }

                matched = str.match(new RegExp(reg, 'g'));
                if (matched) {
                    for (i = 0; i < matched.length; i++) {
                        splitRegItems.push(matched[i]);
                    }
                }
            }
        }

        ret.keyWords = str.split(new RegExp(splitRegItems.join('|'))).filter(function (kw) {
            return kw !== '';
        }).reduce(function (p, v) {
            for (let i = 0; i < p.length; i++) {
                if (p[i] === v) {
                    return p;
                }
            }
            p.push(v);
            return p;
        }, []);

        return ret;
    }

    analysis(searchStr: string): AnalysisResult[] {

        let ret: AnalysisResult[] = [], result;

        let cateAndArticle = searchStr.split(':');

        if (cateAndArticle[0] !== 'A') {
            result = this._analysis(Cfgs.CategoryMode, cateAndArticle[0]);
            if (null === result) {
                return null;
            }
            ret.push(result);
        }

        if (cateAndArticle.length > 1) {
            result = this._analysis(Cfgs.PostMode, cateAndArticle[1]);
            if (null === result) {
                return null;
            }
            ret.push(result);
        }

        return ret;
    }

}

export class AnalysisResult {
    mode: string;
    year: Period = new Period();
    month: Period = new Period();
    day: Period = new Period();
    keyWords: string[];

    constructor(mode: string) {
        this.mode = mode;
    }
}

export class Period {
    start: number = null;
    end: number = null;
}
