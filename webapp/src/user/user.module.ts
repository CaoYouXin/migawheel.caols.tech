import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";

import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { DaoUtil, RestCode } from '../http';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
  ],
  providers: [DaoUtil, RestCode]
})
export class UserModule { }