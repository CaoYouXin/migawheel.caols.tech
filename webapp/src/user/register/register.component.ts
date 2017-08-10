import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DaoUtil, RestCode, API } from "../../http";
import { Md5 } from "ts-md5/dist/md5";

const matchingPasswords = (passwordKey: string, confirmPasswordKey: string) => {
  return (group: FormGroup): { [key: string]: any } => {
    let password = group.controls[passwordKey];
    let confirmPassword = group.controls[confirmPasswordKey];

    if (password.value !== confirmPassword.value) {
      return {
        mismatchedPasswords: true
      };
    }
  }
}

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['../util/form.basic.css', './register.component.css']
})
export class RegisterComponent {

  model: any = {};
  loading: boolean = false;
  captchaImage: string;
  captchaImageToken: string;

  form: FormGroup;
  rootError = '';
  formErrors = {
    'UserName': '',
    'UserPassword': ''
  };
  validationMessages = {
    'rootError': {
      'mismatchedPasswords': '两次输入的密码不一致'
    },
    'UserName': {
      'required': '用户名是必填项.',
      'minlength': '用户名最短6个字符.',
      'maxlength': '用户名最长24个字符.',
    },
    'UserPassword': {
      'required': '密码是必填项.',
      'minlength': '密码最短6个字符.',
      'maxlength': '密码最长24个字符.',
    },
    'UserPasswordConfirmed': {
      'required': '密码是必填项.',
      'minlength': '密码最短6个字符.',
      'maxlength': '密码最长24个字符.',
    },
    'ImageCaptcha': {
      'required': '密码是必填项.',
    }
  };

  constructor(private fb: FormBuilder,
    private router: Router,
    private dao: DaoUtil,
    private rest: RestCode) {
  }

  getImageCaptcha() {
    this.captchaImageToken = Md5.hashStr(new Date().toISOString()).toString();
    this.captchaImage = API.getAPI("CaptchaImage")(190, 30, this.captchaImageToken);
  }

  register(): void {
    if (!this.form.valid) {
      return;
    }

    this.loading = true;
    let data = this.form.value;
    data.UserPassword = Md5.hashStr(data.UserPassword);
    data.UserPasswordConfirmed = Md5.hashStr(data.UserPasswordConfirmed);
    data.ImageCaptchaToken = this.captchaImageToken;

    const self = this;
    this.dao.postJSON(API.getAPI("register"), data).subscribe(
      ret => {
        self.loading = false;
        self.rest.checkCode(ret, retBody => {
          if (retBody) {
            self.toLogin();
          } else {
            alert('注册未成功！'); 
          }
        });
      },
      err => {
        self.loading = false;
        DaoUtil.logError(err);
      }
    );
  }

  toLogin() {
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.buildForm();
    this.getImageCaptcha();
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
      'UserPasswordConfirmed': [this.model.UserPasswordConfirmed, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(24)
      ]],
      'ImageCaptcha': [this.model.ImageCaptcha, [
        Validators.required
      ]],
    }, { validator: matchingPasswords('UserPassword', 'UserPasswordConfirmed') });

    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }
    const form = this.form;

    this.rootError = '';
    if (form.dirty && !form.valid) {
      for (const key in form.errors) {
        this.rootError += this.validationMessages['rootError'][key] + ' ';
      }
    }

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