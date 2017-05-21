import {Component} from "@angular/core";
import {DaoUtil} from "../../app/dao/dao.util";

@Component({
    selector: 'login-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css'],
    providers: [DaoUtil]
})
export class LoginFormComponent {

    username = '';
    password = '';

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

        // this.dao.post()
    }

    register() {

    }

    forgetPwd() {

    }

    back(){

    }

}
