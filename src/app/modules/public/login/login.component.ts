import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [ CommonModule, ReactiveFormsModule, RecaptchaModule, TextInputComponent, InputErrorComponent, ButtonComponent ],

   templateUrl: './login.component.html',
   styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loader: boolean = false;
  isSubmitData: boolean = false;
  passwordVisible: boolean = false;
  captchaValidation: boolean = false;
  showError: boolean = false;
  siteKey = environment.PUBLIC_PASS_KEY;
  loginForm!: FormGroup;

  constructor (
    private authService: AuthService,
    public router: Router,
    private formBuilder: FormBuilder,
    private tutorialService: TutorialService,
    private toastService: ToastService,
    private navigationService: NavigationService,
    private alertService: AlertService,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // console.log('environment prod: ', environment.production);
    this.authService.clearLocalStorage();

    const urlTree = this.router.parseUrl(this.router.url);
    const supportParam = urlTree.queryParams['support'];
    if (supportParam === 'true') {
      if (!this.navigationService.getPreviousUrl()) {
        this.router.navigateByUrl('auth-support');
      } else {
        // Remove support query param without reloading the page
        delete urlTree.queryParams['support'];
        this.router.navigateByUrl(urlTree, { replaceUrl: true });
      }
    }
  }

  createForm() {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: [ '', [ Validators.required ] ],
      password: [ '', [ Validators.required ] ]
    });
  }

  submitRequest() {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (!this.captchaValidation) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.isSubmitData = true;

    const { email, password } = this.loginForm.value;
    const payload: any = {
      email,
      contrasena: password
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.isSubmitData = false;
        this.tutorialService.resetTutorial();
        this.router.navigateByUrl('home');
      },
      error: (err: any) => {
        this.isSubmitData = false;

        if (err.status == 401 || err.status == 403) {
          const msg = err.error?.message;
          this.alertService.error("Ups...", msg || 'Algo salió mal.');
          return;
        }

        this.toastService.error('Algo salió mal.');
      }
    });
  }

  resolved(captchaResponse: any) {
    this.captchaValidation = true;
    this.showError = false;
  }

  errored() {
    this.captchaValidation = false;
    this.showError = true;
    console.warn(`reCAPTCHA error encountered`);
  }

}
