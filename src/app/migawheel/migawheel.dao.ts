import {Injectable} from "@angular/core";
import {AnalysisResult, Period} from "./migawheel.search";
import {Configs} from "./migawheel.core";
import {DaoUtil} from "../dao/dao.util";
import {Observable} from "rxjs";
import "rxjs/add/operator/map";

@Injectable()
export class MigaWheelDao {

    constructor(private dao: DaoUtil) {
    }

    categories(): Observable<string[]> {
        // return ['Demo', 'APP', '学习笔记', '生活纪实', '感言', '灵感', '知识总结'];
        return this.dao.get('/assets/category.json')
            .map(res => Object.keys(res.json()));
    }

    posts(category: string): Observable<string[]> {
        return this.dao.get('/assets/post.json')
            .map(res => {
                let o = res.json();
                return Object.keys(o).filter(k => o[k].category === category)
                    .map(k => k + '[]' + o[k].create + '||' + o[k].update);
            });
    }

    private isNullObj(obj: any): boolean {
        for (let keys = Object.keys(obj), i = 0;
             i < keys.length; i++) {
            if (obj[keys[i]]) {
                return false;
            }
        }
        return true;
    }

    private isUseDateIndex(analysis: AnalysisResult[]): boolean {
        for (let i = 0; i < analysis.length; i++) {
            for (let keys = Object.keys(analysis[i]),
                     j = 0; j < keys.length; j++) {
                if ('mode' !== keys[j] && 'keyWords' !== keys[j]) {
                    if (!this.isNullObj(analysis[i][keys[j]])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private pickAnalysisResult(mode: string, analysis: AnalysisResult[]): AnalysisResult {
        for (let i = 0; i < analysis.length; i++) {
            if (mode === analysis[i].mode) {
                return analysis[i];
            }
        }
        return null;
    }

    private generateExamFn(period: Period): Function {
        if (!period.start) {
            return function () {
                return true;
            }
        }

        if (!period.end) {
            return function (toExam: number) {
                return toExam === period.start;
            }
        }

        return function (toExam: number) {
            return toExam >= period.start && toExam <= period.end;
        }
    }

    private exam(obj: any, examSeed: any, cb: Function) {
        Object.keys(obj).forEach(key => {
            let examFn = this.generateExamFn(examSeed);
            if (examFn(key)) {
                cb(obj[key]);
            }
        });
    }

    search(analysis: AnalysisResult[]): Observable<string[]> {
        let dateIndex: Observable<any>,
            categories: Observable<any>,
            posts: Observable<any>,
            isUseIndex = this.isUseDateIndex(analysis),
            categoryAnalysis = this.pickAnalysisResult(Configs.CategoryMode, analysis),
            postAnalysis = this.pickAnalysisResult(Configs.PostMode, analysis),
            categoryNames: string[] = [],
            postTitles: string[] = [];

        if (isUseIndex) {
            dateIndex = this.dao.get('/assets/date_index.json')
                .map(res => res.json());
        }

        if (categoryAnalysis) {
            categories = this.dao.get('/assets/category.json')
                .map(res => res.json());
        }

        if (postAnalysis) {
            posts = this.dao.get('/assets/post.json')
                .map(res => res.json());

            if (isUseIndex) {
                if (categoryAnalysis) {
                    return new Observable<string[]>(observer => {
                        dateIndex.subscribe(dateIndexRet => {
                            categories.subscribe(categoryRet => {
                                posts.subscribe(postRet => {
                                    this.exam(dateIndexRet, categoryAnalysis.year, passedYear =>
                                        this.exam(passedYear, categoryAnalysis.month, passedMonth =>
                                            this.exam(passedMonth, categoryAnalysis.day, passedDay =>
                                                categoryNames = categoryNames.concat(passedDay.categories)
                                            )
                                        )
                                    );

                                    categoryNames = categoryNames.filter(cn =>
                                        categoryAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                            p && cn.indexOf(v) !== -1
                                            , true));

                                    this.exam(dateIndexRet, postAnalysis.year, passedYear =>
                                        this.exam(passedYear, postAnalysis.month, passedMonth =>
                                            this.exam(passedMonth, postAnalysis.day, passedDay =>
                                                postTitles = postTitles.concat(passedDay.posts)
                                            )
                                        )
                                    );

                                    observer.next(postTitles.filter(pt =>
                                        categoryNames.reduce((p: boolean, cn: string) =>
                                        p || cn === postRet[pt].category, false)
                                    ).filter(pt =>
                                        postAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                            p && pt.indexOf(v) !== -1
                                            , true)
                                    ).map(pt => pt + '[]' + postRet[pt].create + '||' + postRet[pt].update));
                                    observer.complete();
                                });
                            });
                        });
                    });
                } else {
                    return new Observable<string[]>(observer => {
                        dateIndex.subscribe(dateIndexRet => {
                            posts.subscribe(postRet => {
                                this.exam(dateIndexRet, postAnalysis.year, passedYear =>
                                    this.exam(passedYear, postAnalysis.month, passedMonth =>
                                        this.exam(passedMonth, postAnalysis.day, passedDay =>
                                            postTitles = postTitles.concat(passedDay.posts)
                                        )
                                    )
                                );

                                observer.next(postTitles.filter(pt =>
                                    postAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                        p && pt.indexOf(v) !== -1
                                        , true))
                                    .map(pt => pt + '[]' + postRet[pt].create + '||' + postRet[pt].update));
                                observer.complete();
                            });
                        });
                    });
                }
            } else {
                if (categoryAnalysis) {
                    return new Observable<string[]>(observer => {
                        categories.subscribe(categoryRet => {
                            posts.subscribe(postRet => {
                                observer.next(Object.keys(categoryRet).reduce((pts: string[], cn: string) => {
                                    if (categoryAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                            p && cn.indexOf(v) !== -1
                                            , true)) {
                                        return pts.concat(categoryRet[cn].posts);
                                    } else {
                                        return pts;
                                    }
                                }, []).filter(pt =>
                                    postAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                        p && pt.indexOf(v) !== -1
                                        , true))
                                    .map(pt => pt + '[]' + postRet[pt].create + '||' + postRet[pt].update));
                                observer.complete();
                            });
                        });
                    });
                } else {
                    return posts.map(ret => Object.keys(ret).filter(pt =>
                        postAnalysis.keyWords.reduce((p: boolean, v: string) =>
                            p && pt.indexOf(v) !== -1
                            , true))
                        .map(pt => pt + '[]' + ret[pt].create + '||' + ret[pt].update));
                }
            }
        } else {
            if (categoryAnalysis) {
                if (isUseIndex) {
                    return dateIndex.map(ret => {
                        this.exam(ret, categoryAnalysis.year, passedYear =>
                            this.exam(passedYear, categoryAnalysis.month, passedMonth =>
                                this.exam(passedMonth, categoryAnalysis.day, passedDay =>
                                    categoryNames = categoryNames.concat(passedDay.categories)
                                )
                            )
                        );
                        return categoryNames.filter(cn =>
                            categoryAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                p && cn.indexOf(v) !== -1
                                , true));
                    });
                } else {
                    return categories.map(ret => {
                        return Object.keys(ret).filter(cn =>
                            categoryAnalysis.keyWords.reduce((p: boolean, v: string) =>
                                p && cn.indexOf(v) !== -1
                                , true));
                    });
                }
            }
        }

        return new Observable<string[]>(observer => observer.complete());
    }

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