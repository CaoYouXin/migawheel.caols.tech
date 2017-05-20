import {Component, EventEmitter, Output} from "@angular/core";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    showLogin = false;
    showRegister = false;

    info = '去登录';

    infoClicked() {
        if (this.info === '去登录') {
            this.showLogin = true;
        }
    }

    register() {
        this.showLogin=false;
        this.showRegister=true;
    }

}
