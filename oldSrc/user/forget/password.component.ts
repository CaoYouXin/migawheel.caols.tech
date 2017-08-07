import {Component, EventEmitter, Output} from "@angular/core";
import {DaoUtil} from "../../app/dao/dao.util";
import {API} from "../../const/api.const";
import "rxjs/add/operator/map";
import {LocalStorageKeys} from "../../const/localstorage.const";

@Component({
    selector: 'forget-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.css', '../form.component.css'],
    providers: [DaoUtil]
})
export class ForgetPasswordComponent {

    private validColor = '#C5FFA6';
    private invalidColor = 'red';

    phoneValidColor = '#fff';

    phone = '';

    @Output()
    eventOccur = new EventEmitter();

    constructor(private dao: DaoUtil) {}

    forgetPwd() {
        if (this.checkPhone()) {
            const self = this;
            this.dao.get(API.getAPI("FindPassword")(this.phone))
                .map(res => res.json())
                .subscribe(ret => {
                    if (ret.code === 50200) {
                        alert("该手机号未注册");
                    } else if (ret.code === 20000) {
                        localStorage.setItem(LocalStorageKeys.UserFindPwd, JSON.stringify(ret.body));
                        self.eventOccur.emit(1);
                    } else {
                        alert(ret.body);
                    }
                });
        }
    }

    checkPhone() {
        if (!this.phone.match(/\d{11}/)) {
            this.phoneValidColor = this.invalidColor;
            return false;
        }

        this.phoneValidColor = this.validColor;
        return true;
    }

}
