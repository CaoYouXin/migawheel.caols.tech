import {Injectable} from "@angular/core";

@Injectable()
export class PostUnload {

    unload(params: Array<any>): void {
        let unloadFn = (window['handlers'] || {unload: null}).unload || function() {};
        unloadFn.apply(null, params);
    }

}
