import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {IndexComponent} from "../index/index.component";
import {ArticleComponent} from "../article/article.component";
import {CategoryComponent} from "../category/category.component";

export const routes: Routes = [
    {path: '', redirectTo: '/index', pathMatch: 'full'},
    {path: 'index', component: IndexComponent, data: {name: 'index'}},
    {path: 'article', component: ArticleComponent, data: {name: 'article'}},
    {path: 'category', component: CategoryComponent, data: {name: 'category'}},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
