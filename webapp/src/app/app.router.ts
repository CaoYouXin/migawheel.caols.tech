import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { FallbackComponent } from "./fallback.component";

export const routes: Routes = [
  // {path: '', redirectTo: '/index', pathMatch: 'full'},
  // {path: 'index', component: IndexComponent, data: {name: 'index'}},
  // {path: 'article', component: ArticleComponent, data: {name: 'article'}},
  // {path: 'category', component: CategoryComponent, data: {name: 'category'}},

  { path: '**', component: FallbackComponent, data: { name: '看上去，你是迷路了吧？', color: '#EADFCB' } }
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, {useHash: true})],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}