import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { BlogIndexComponent } from './index.c';
import { ArticleComponent } from './article';
import { CategoryComponent } from './category';
import { ContentComponent } from './content';
import { SafeHtmlPipe } from './util';
import { DaoUtil, RestCode } from '../http';

@NgModule({
  declarations: [
    SafeHtmlPipe,
    BlogIndexComponent,
    ArticleComponent,
    CategoryComponent,
    ContentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [DaoUtil, RestCode]
})
export class BlogModule { }