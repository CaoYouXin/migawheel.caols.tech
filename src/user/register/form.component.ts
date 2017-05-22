import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {DaoUtil} from "../../app/dao/dao.util";
import {API} from "../../const/api.const";
import "rxjs/add/operator/map";
import {LocalStorageKeys} from "../../const/localstorage.const";

@Component({
    selector: 'register-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css', '../form.component.css'],
    providers: [DaoUtil]
})
export class RegisterFormComponent implements OnInit{

    private validColor = '#C5FFA6';
    private invalidColor = 'red';
    private defaultText = '获取验证码';
    private disabled = false;

    usernameValidColor = '#fff';
    passwordValidColor = '#fff';
    confirmValidColor = '#fff';
    phoneValidColor = '#fff';

    captchaImage: string;
    getCaptchaBtnText = this.defaultText;

    username = '';
    password = '';
    confirm = '';
    phone = '';
    captcha = '';
    token: string;

    @Output()
    eventOccur = new EventEmitter();

    constructor(private dao: DaoUtil) {}

    ngOnInit() {
        this.getImageCaptcha();
    }

    checkUserNameValid() {
        this.checkUserName(function () {
        });
    }

    checkUserName(cb: Function) {
        if (!this.username.match(/[a-zA-Z0-9_-]+/)) {
            this.usernameValidColor = this.invalidColor;
            return cb(false);
        }

        const self = this;
        this.dao.get(API.getAPI('CheckUserName')(this.username))
            .map(res => res.json())
            .subscribe(ret => {
                if (ret.code === 20000) {
                    if (ret.body) {
                        self.usernameValidColor = self.validColor;
                        cb(true);
                    } else {
                        self.usernameValidColor = self.invalidColor;
                        cb(false);
                    }
                } else {
                    console.log(ret);
                }
            });
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

    checkPhone() {
        if (!this.phone.match(/\d{11}/)) {
            this.phoneValidColor = this.invalidColor;
            return false;
        }

        this.phoneValidColor = this.validColor;
        return true;
    }

    register() {
        const self = this;
        this.checkUserName(function (ret) {
            if (ret && self.checkPassword()
                && self.checkConfirm()
                && self.checkPhone()) {
                self.dao.post(API.getAPI("register"), {
                    userName: self.username,
                    password: window['md5'](self.password),
                    phone: self.phone,
                    captcha: self.captcha,
                    token: self.token
                }).map(res => res.json())
                    .subscribe(ret => {
                        if (ret.code === 50202) {
                            alert("验证码错误！");
                            self.getImageCaptcha();
                        } else if (ret.code === 50203) {
                            alert("该手机号已注册");
                        } else if (ret.code !== 20000) {
                            alert(ret.body);
                        } else {
                            localStorage.setItem(LocalStorageKeys.User, JSON.stringify(ret.body));
                            self.eventOccur.emit(ret.body.userView.userName);
                        }
                    });
            }
        })
    }

    getCaptcha() {
        if (this.disabled) {
            return;
        }

        if (!this.checkPhone()) {
            return;
        }

        const self = this;
        this.dao.get(API.getAPI("captcha")(this.phone))
            .map(res => res.json())
            .subscribe(ret => {
                console.log(ret);
                if (ret.code === 20000) {
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
            });
    }

    getImageCaptcha() {
        this.token = window['md5'](new Date());
        this.captchaImage = API.getAPI("CaptchaImage")(this.token);
    }

}
