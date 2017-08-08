import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BlogIndexComponent } from './index.c';
import { DaoUtil, RestCode } from '../http';

@NgModule({
  declarations: [
    BlogIndexComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [DaoUtil, RestCode]
})
export class BlogModule { }