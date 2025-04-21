import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TemporalLoginData, VerifyEmailReq } from 'src/app/models/auth.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { VerificationCodeFormComponent } from 'src/app/shared/forms/verification-code-form/verification-code-form.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgZorroModule, CommonModule, VerificationCodeFormComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {

  loading: boolean = false;
  isAuthenticated: boolean = false;
  temporalLoginData: TemporalLoginData | null = null;

  constructor(
    private router: Router,
    private messageService: NzMessageService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.temporalLoginData = this.authService.getTemporalLoginData();
    const requiresEmailVerification = localStorage.getItem('requiresEmailVerification');

    if (!this.isAuthenticated && (!requiresEmailVerification || !this.temporalLoginData)) {
      this.onCancel();
      return;
    } else if (this.isAuthenticated && !requiresEmailVerification) {
      this.router.navigate(['/home']);
      return;
    }
  }

  onCancel() {
    this.authService.clearLocalStorage();
    this.router.navigateByUrl('login');
  }

  resendCode(callback: () => void) {
    if (this.isAuthenticated) {
      this.resendCodeNoAuth(callback);
      return;
    }

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
        callback();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.error('Error reenviando el código');
        this.loading = false;
        // callback();
      },
    });
  }

  resendCodeNoAuth(callback: () => void) {
    this.messageService.success('Código reenviado');
    this.loading = false;
    callback();
  }

  onSubmit(code: string) {
    if (this.isAuthenticated) {
      this.submitAuth(code);
      return;
    }
    this.submitNoAuth(code);
  }

  submitNoAuth(code: string) {
    if (!this.temporalLoginData) {
      this.onCancel();
      return;
    }

    const { apiKey, remember } = this.temporalLoginData;
    const verifyEmailReq: VerifyEmailReq = {
      apiKey,
      remember,
      code
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

  submitAuth(code: string) {
    // Temporal
    this.messageService.create('success', 'Correo verificado.');
    localStorage.removeItem('resendTimestamp');
    localStorage.removeItem('requiresEmailVerification');
    this.router.navigateByUrl('home');
  }

}
