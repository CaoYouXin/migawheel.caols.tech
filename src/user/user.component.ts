import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {LocalStorageKeys} from "../const/localstorage.const";

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit{

    private defaultInfo = '去登录';

    showLogin = false;
    showRegister = false;
    showForgetPwd = false;
    showResetPwd = false;

    info = this.defaultInfo;

    ngOnInit(): void {
        let user = JSON.parse(localStorage.getItem(LocalStorageKeys.User) || '{}');
        if (user.token) {
            this.info = user.userView.userName;
        }
    }

    infoClicked() {
        if (this.info === this.defaultInfo) {
            this.showLogin = true;
        }
    }

    register() {
        this.showLogin=false;
        this.showRegister=true;
    }

    loginFormMsg(msg) {
        switch (msg) {
            case 1:
                this.register();
                break;
            case 2:
                this.showLogin = false;
                this.showForgetPwd = true;
                break;
            case -1:
                this.showLogin = false;
                break;
            default:
                console.log('unknown msg ' + msg);
                break;
        }
    }

    loginSuccess(info) {
        this.info = info;
        this.showLogin=false;
    }

    finishRegister(info) {
        this.info = info || this.defaultInfo;
        this.showRegister = false;
    }

    forgetPwdMsg(msg) {
        switch (msg) {
            case 1:
                this.showForgetPwd = false;
                this.showResetPwd = true;
                break;
            case -1:
                this.showForgetPwd = false;
                break;
            default:
                console.log('unknown msg ' + msg);
                break;
        }
    }

    finishResetPwd(info) {
        this.info = info || this.defaultInfo;
        this.showResetPwd = false;
    }

}
