import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BlogModule } from '../blog';
import { AppRoutingModule } from './app.router';
import { AppComponent } from './app.component';
import { FallbackComponent } from './fallback.component';

@NgModule({
  declarations: [
    AppComponent,
    FallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BlogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
