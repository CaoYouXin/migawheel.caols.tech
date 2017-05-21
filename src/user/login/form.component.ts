import {Component, EventEmitter, Output} from "@angular/core";
import {DaoUtil} from "../../app/dao/dao.util";
import {API} from "../../const/api.const";
import "rxjs/add/operator/map";
import {LocalStorageKeys} from "../../const/localstorage.const";

@Component({
    selector: 'login-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css', '../form.component.css'],
    providers: [DaoUtil]
})
export class LoginFormComponent {

    username = '';
    password = '';

    @Output()
    eventOccur = new EventEmitter();

    @Output()
    suc = new EventEmitter();

    constructor(private dao: DaoUtil) {}

    login() {
        if (this.username === '') {
            alert("用户名不能为空！");
            return ;
        }

        if (this.password === '') {
            alert("密码不能为空");
            return;
        }

        let self = this;
        this.dao.post(API.getAPI('login'), {
            userName: this.username,
            password: window['md5'](this.password)
        }).map(res => res.json())
            .subscribe(ret => {
                if (ret.code === 50200) {
                    alert("未注册！");
                    self.register();
                } else if (ret.code === 50201) {
                    alert("密码错误！");
                } else if (ret.code !== 20000) {
                    alert(ret.body);
                } else {
                    localStorage.setItem(LocalStorageKeys.User, JSON.stringify(ret.body));
                    self.suc.emit(ret.body.userView.userName);
                }
            });
    }

    register() {
        this.eventOccur.emit(1);
    }

    forgetPwd() {
        this.eventOccur.emit(2);
    }

    back(){
        this.eventOccur.emit(-1);
    }

}
