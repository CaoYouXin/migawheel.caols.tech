import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DaoUtil, RestCode, API, UserService } from "../../http";
import { Md5 } from "ts-md5/dist/md5"; 

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['../util/form.basic.css', './login.component.css']
})
export class LoginComponent {

  model: any = {};
  loading: boolean = false;

  form: FormGroup;
  formErrors = {
    'UserName': '',
    'UserPassword': ''
  };
  validationMessages = {
    'UserName': {
      'required': '用户名是必填项.',
      'minlength': '用户名最短6个字符.',
      'maxlength': '用户名最长24个字符.',
    },
    'UserPassword': {
      'required': '密码是必填项.',
      'minlength': '密码最短6个字符.',
      'maxlength': '密码最长24个字符.',
    }
  };

  constructor(private fb: FormBuilder,
    private router: Router,
    private dao: DaoUtil,
    private rest: RestCode) {
  }

  login(): void {
    if (!this.form.valid) {
      return;
    }

    this.loading = true;
    let data = Object.assign({}, this.form.value);
    data.UserPassword = Md5.hashStr(data.UserPassword);

    const self = this;
    this.dao.postJSON(API.getAPI("login"), data).subscribe(
      ret => {
        self.loading = false;
        self.rest.checkCode(ret, retBody => {
          UserService.store(retBody);
          location.href = this.rest.getLoginRetUrl() || `${location.protocol}//${document.domain}:${location.port}`;
        });
      },
      err => {
        self.loading = false;
        DaoUtil.logError(err);
      }
    );
  }

  toRegister() {
    this.router.navigate(['/register']);
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      'UserName': [this.model.UserName, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(24)
      ]],
      'UserPassword': [this.model.UserPassword, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(24)
      ]],
    });

    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const form = this.form;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

}