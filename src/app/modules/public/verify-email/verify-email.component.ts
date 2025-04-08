import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TemporalLoginData, VerifyEmailReq } from 'src/app/models/auth.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {

  loading: boolean = false;
  temporalLoginData: TemporalLoginData | null = null;
  codeForm!: FormGroup;

  countdown: number = 30;
  isResendDisabled: boolean = false;
  private countdownInterval: any;

  constructor(
    private router: Router,
    private messageService: NzMessageService,
    private authService: AuthService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit(): void {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    this.temporalLoginData = this.authService.getTemporalLoginData();
    const requiresEmailVerification = localStorage.getItem('requiresEmailVerification');
    if (!requiresEmailVerification || !this.temporalLoginData) {
      this.onCancel();
      return;
    }

    // Reset the counter if there is a timestamp in localStorage
    const lastResendTime = localStorage.getItem('resendTimestamp');
    if (lastResendTime) {
      const elapsedTime = Math.floor((Date.now() - Number(lastResendTime)) / 1000);
      if (elapsedTime < this.countdown) {
        this.countdown = this.countdown - elapsedTime;
        this.isResendDisabled = true;
        this.startCountdown();
      } else {
        localStorage.removeItem('resendTimestamp');
        this.isResendDisabled = false;
      }
    }
  }

  onlyNumbers(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
      event.preventDefault();
    }
  }

  onCancel() {
    this.authService.clearLocalStorage();
    this.router.navigateByUrl('login');
  }

  startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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
    if (!this.temporalLoginData) {
      this.onCancel();
      return;
    }
    const remember = this.temporalLoginData.remember;
    this.loading = true;
    this.authService.verifyEmailResendCode(this.temporalLoginData).subscribe({
      next: (res: any) => {
        this.temporalLoginData = {
          apiKey: res.data.apiKey,
          remember
        };
        this.authService.saveTemporalLoginData(this.temporalLoginData);
        this.messageService.success('Código reenviado');
        this.loading = false;
        this.isResendDisabled = true;

        localStorage.setItem('resendTimestamp', Date.now().toString());
        this.startCountdown();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.error('Error reenviando el código');
        this.loading = false;
        this.isResendDisabled = true;
        this.startCountdown();
      },
    });
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.codeForm);
    if (this.codeForm.invalid) return;
    else if (!this.temporalLoginData) {
      this.onCancel();
      return;
    }

    const { apiKey, remember } = this.temporalLoginData;
    const verifyEmailReq: VerifyEmailReq = {
      apiKey,
      remember,
      code: this.codeForm.value.code
    };

    this.loading = true;
    this.authService.verifyEmail(verifyEmailReq).subscribe({
      next: (res: any) => {
        const authData = res.data;
        this.messageService.create('success', 'Correo verificado.');
        localStorage.removeItem('requiresEmailVerification');
        localStorage.removeItem('resendTimestamp');
        localStorage.removeItem('temporalLoginData');

        this.authService.loadUser().subscribe({
          next: (resp: any) => {
            this.loading = false;
            if (authData.renewPassword) {
              this.router.navigateByUrl('reset-password');
            } else {
              this.router.navigateByUrl('home');
            }
          },
          error: (err: any) => {
            this.loading = false;
            console.error('Error al cargar el usuario:', err);
            this.messageService.error('No se pudo cargar la información del usuario.');
            this.authService.logout();
          },
        });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.error(err.error.message || 'Error verificando el código');
        this.loading = false;
      },
    });
  }

}
