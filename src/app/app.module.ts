import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppRoutingModule} from "./route/app-routing.module"
import {AppComponent} from "./app.component";
import {IndexComponent} from "./index/index.component";
import {MigaWheelPcComponent} from "./migawheel/pc.component";
import {ArticleComponent} from "./article/article.component";
import {CategoryComponent} from "./category/category.component";
import {MenuComponent} from "./menu/menu.component";
import {ContentComponent} from "./content/content.component";
import {PagerComponent} from "./pager/pager.component";
import {LoginComponent} from "./login/login.component";

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
        ArticleComponent,
        CategoryComponent,
        MenuComponent,
        ContentComponent,
        PagerComponent,
        LoginComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
