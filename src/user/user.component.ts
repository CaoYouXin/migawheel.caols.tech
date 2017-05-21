import {Component, EventEmitter, Output} from "@angular/core";

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent {

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
