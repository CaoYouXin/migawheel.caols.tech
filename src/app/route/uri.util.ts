// import {Injectable} from "@angular/core";
//
// @Injectable()
export class URIUtil {

    static getParam(url: string, ps: Array<string>): any {
        let decodedURI = window['decodeURIComponent'](url);
        return decodedURI.split(/;|=/).reduce((p, v) => {
            if (ps.some((param) => param === v)) {
                p[v] = null;
            } else {
                Object.keys(p).forEach((param) => {
                    if (null === p[param]) {
                        p[param] = v;
                    }
                });
            }
            return p;
        }, {});
    }

}
