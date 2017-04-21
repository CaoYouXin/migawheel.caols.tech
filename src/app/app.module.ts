import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppRoutingModule} from "./route/app-routing.module"
import {AppComponent} from "./app.component";
import {IndexComponent} from "./index/index.component";
import {MigaWheelPcComponent} from "./migawheel/pc.component";
import {ArticleComponent} from "./article/article.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        IndexComponent,
        MigaWheelPcComponent,
        ArticleComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
