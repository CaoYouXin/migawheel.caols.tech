import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
import {environment} from "./environments/environment";
import {AppModule} from "./app/app.module";

if (environment.production) {
    enableProdMode();
}

// if (environment.base !== null) {
//     document.getElementsByTagName('base').item(0).setAttribute('href', environment.base);
// }

platformBrowserDynamic().bootstrapModule(AppModule);
