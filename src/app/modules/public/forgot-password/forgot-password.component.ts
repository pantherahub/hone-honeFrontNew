import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { NewPasswordFormComponent } from 'src/app/shared/forms/new-password-form/new-password-form.component';
import { VerificationCodeFormComponent } from 'src/app/shared/forms/verification-code-form/verification-code-form.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, VerificationCodeFormComponent, NewPasswordFormComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {

  step: number = 0;
  emailForm!: FormGroup;
  loading: boolean = false;

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

  verifyCode(code: string) {
    // console.log('Código ingresado:', code);
    const reqData = {
      apiKey: this.apiKey,
      code
    };
    this.loading = true;
    this.authService.forgotVerifyCode(reqData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.apiKey = res.data.apiKey;
        this.messageService.success('Código verificado.');
        this.step = 2;
      },
      error: () => {
        this.loading = false;
        this.messageService.error('Código incorrecto');
      }
    });
  }

  resendCode(callback: () => void) {
    this.authService.forgotResendCode({ apiKey: this.apiKey }).subscribe({
      next: (res: any) => {
        this.apiKey = res.data.apiKey;
        this.messageService.success('Código reenviado');
        callback();
      },
      error: () => {
        this.messageService.error('Error reenviando el código');
        // callback();
      }
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
