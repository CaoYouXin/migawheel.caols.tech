import {Injectable} from "@angular/core";

@Injectable()
export class PostUnload {

    unload(): void {
        let unloadFn = (window['handlers'] || {unload: null}).unload || function() {};
        console.log('unload', unloadFn.toString());
        unloadFn();
    }

}
