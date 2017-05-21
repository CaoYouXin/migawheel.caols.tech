import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {UserComponent} from "./user.component";
import {LoginFormComponent} from "./login/form.component";
import {RegisterFormComponent} from "./register/form.component";
import {ForgetPasswordComponent} from "./forget/password.component";
import {ResetPasswordComponent} from "./reset/password.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
    ],
    declarations: [
        UserComponent,
        LoginFormComponent,
        RegisterFormComponent,
        ForgetPasswordComponent,
        ResetPasswordComponent
    ],
    exports: [
        UserComponent
    ]
})
export class UserModule {}
