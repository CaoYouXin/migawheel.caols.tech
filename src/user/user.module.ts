import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {UserComponent} from "./user.component";
import {LoginFormComponent} from "./login/form.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
    ],
    declarations: [
        UserComponent,
        LoginFormComponent
    ],
    exports: [
        UserComponent
    ]
})
export class UserModule {}
