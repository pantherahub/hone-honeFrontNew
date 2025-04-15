import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { NewPasswordFormComponent } from 'src/app/shared/forms/new-password-form/new-password-form.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, NewPasswordFormComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {

  step = 0;
  emailForm!: FormGroup;
  codeForm!: FormGroup;
  loading: boolean = false;

  countdown: number = 30;
  isResendDisabled: boolean = false;
  private countdownInterval: any;

  apiKey: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: NzMessageService,
    private authService: AuthService,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required]],
    });
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  onlyNumbers(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
      event.preventDefault();
    }
  }

  sendEmail() {
    this.formUtils.markFormTouched(this.emailForm);
    if (this.emailForm.invalid) return;
    this.authService.forgotSendCode(this.emailForm.value).subscribe({
      next: (res: any) => {
        this.apiKey = res.data.apiKey;
        this.messageService.success('Código enviado al correo.');
        this.step = 1;
      },
      error: () => this.messageService.error('Error enviando el código'),
    });
  }

  verifyCode() {
    // console.log("verifyCode", this.codeForm.value);
    this.formUtils.markFormTouched(this.codeForm);
    if (this.codeForm.invalid) return;
    const code = this.codeForm.value.code;
    // console.log('Código ingresado:', code);

    this.authService.forgotVerifyCode(this.codeForm.value).subscribe({
      next: (res: any) => {
        this.apiKey = res.data.apiKey;
        this.messageService.success('Código verificado.');
        this.step = 2;
      },
      error: () => this.messageService.error('Código incorrecto'),
    });
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.isResendDisabled = false;
        this.countdown = 30;
      }
    }, 1000);
  }

  resendCode() {
    this.isResendDisabled = true;
    this.startCountdown();

    this.authService.forgotResendCode({ email: this.emailForm.value.email }).subscribe({
      next: (res: any) => {
        this.apiKey = res.data.apiKey;
        this.messageService.success('Código reenviado');
      },
      error: () => this.messageService.error('Error reenviando el código'),
    });
  }

  resetPassword(event: { newPassword: string, confirmPassword: string }) {
    const newPassword = event.newPassword;
    const confirmPassword = event.confirmPassword;

    const reqData = {
      apiKey: this.apiKey,
      password: newPassword
    };
    this.authService.updatePasswordNoAuth(reqData).subscribe({
      next: (res: any) => {
        this.messageService.success('Contraseña actualizada con éxito');
        this.onCancel();
      },
      error: () => this.messageService.error('Error actualizando la contraseña'),
    });
  }

  onCancel() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }
    this.router.navigate(['/login']);
  }

}
