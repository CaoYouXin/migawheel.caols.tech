import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {DaoUtil} from "../../app/dao/dao.util";
import {API} from "../../const/api.const";
import "rxjs/add/operator/map";
import {LocalStorageKeys} from "../../const/localstorage.const";

@Component({
    selector: 'reset-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.css', '../form.component.css'],
    providers: [DaoUtil]
})
export class ResetPasswordComponent implements OnInit{

    private validColor = '#C5FFA6';
    private invalidColor = 'red';
    private defaultText = '获取验证码';
    private disabled = false;

    getCaptchaBtnText = this.defaultText;

    passwordValidColor = '#fff';
    confirmValidColor = '#fff';

    username = '';
    phone = '';
    password = '';
    confirm = '';
    captcha = '';

    @Output()
    eventOccur = new EventEmitter();

    constructor(private dao: DaoUtil) {}

    ngOnInit() {
        this.disableCaptchaBtn();

        let userFindPwd = JSON.parse(localStorage.getItem(LocalStorageKeys.UserFindPwd));
        this.username = userFindPwd.userName;
        this.phone = userFindPwd.phone;
    }

    checkPassword(): boolean {
        if (this.password === '') {
            this.passwordValidColor = this.invalidColor;
            return false;
        }

        this.passwordValidColor = this.validColor;
        return true;
    }

    checkConfirm() {
        if (!this.checkPassword()) {
            this.confirmValidColor = this.invalidColor;
            return false;
        }

        if (this.password !== this.confirm) {
            this.confirmValidColor = this.invalidColor;
            return false;
        }

        this.confirmValidColor = this.validColor;
        return true;
    }

    resetPwd() {
        if (!this.checkConfirm()) {
            return;
        }

        const self = this;
        this.dao.post(API.getAPI("ResetPassword"), {
            userName: this.username,
            phone: this.phone,
            password: window['md5'](this.password),
            captcha: this.captcha
        }).map(res => res.json())
            .subscribe(ret => {
                if (ret.code === 20000) {
                    localStorage.setItem(LocalStorageKeys.User, JSON.stringify(ret.body));
                    self.eventOccur.emit(ret.body.userView.userName);
                } else if (ret.code === 50202) {
                    alert("验证码不正确！");
                } else {
                    alert(ret.body);
                }
            });
    }

    getCaptcha() {
        if (this.disabled) {
            return;
        }

        const self = this;
        this.dao.get(API.getAPI("captcha")(this.phone))
            .map(res => res.json())
            .subscribe(ret => {
                if (ret.code === 20000) {
                    self.disableCaptchaBtn();
                } else {
                    alert(ret.body);
                }
            });
    }

    disableCaptchaBtn() {
        const self = this;
        self.disabled = true;
        let handler = function (count) {
            clearTimeout(timeout);

            self.getCaptchaBtnText = '('+count+')';

            if (count > 0) {
                timeout = setTimeout(handler, 1000, count - 1);
            } else {
                self.disabled = false;
                self.getCaptchaBtnText = self.defaultText;
            }
        };
        let timeout = setTimeout(handler, 1000, 60);
    }

}
