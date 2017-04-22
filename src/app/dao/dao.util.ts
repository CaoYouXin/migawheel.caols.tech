import {Http, Response, Headers} from "@angular/http";
import {Observable} from "rxjs/Rx"
import {Injectable} from "@angular/core";

@Injectable()
export class DaoUtil {

    constructor(private http: Http) {}

    get(url: string): Observable<any> {
        return this.http.get(url, {headers: this.getHeader()});
    }

    post(url: string, data: Object): Observable<any> {
        return this.http.post(url, data, {headers: this.getHeader()});
    }

    private getHeader(): Headers {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        return headers;
    }

}
