import {Http, Headers, Response} from "@angular/http";
import {Observable} from "rxjs/Rx"
import {Injectable} from "@angular/core";

@Injectable()
export class DaoUtil {

    constructor(private http: Http) {}

    get(url: string): Observable<Response> {
        return this.http.get(url, {headers: this.getHeader()});
    }

    post(url: string, data: Object): Observable<Response> {
        return this.http.post(url, data, {headers: this.getHeader()});
    }

    private getHeader(): Headers {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

    static logError(err) {
        console.log('sth wrong when fetching data. ' + err);
    }

    static process(ret, cb) {
        if (ret.code !== 20000) {
            alert(ret.body);
            return;
        }

        cb(ret.body);
    }
}
