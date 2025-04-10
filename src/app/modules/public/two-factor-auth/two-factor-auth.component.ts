import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TemporalLoginData, VerifyEmailReq } from 'src/app/models/auth.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-two-factor-auth',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './two-factor-auth.component.html',
  styleUrl: './two-factor-auth.component.scss'
})
export class TwoFactorAuthComponent implements OnInit {

  loading: boolean = false;
  temporalLoginData: TemporalLoginData | null = null;
  codeForm!: FormGroup;

  returnUrl: string = '/home';

  constructor(
    private router: Router,
    private messageService: NzMessageService,
    private authService: AuthService,
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    const isAuthenticated = this.authService.isAuthenticated();
    this.temporalLoginData = this.authService.getTemporalLoginData();
    const requires2fa = localStorage.getItem('requires2fa');
    const state = this.location.getState() as { returnUrl?: string };

    // No authentication and no login data
    if (!isAuthenticated && (!requires2fa || !this.temporalLoginData)) {
      this.onCancel();
      return;
    }

    // With authentication (2fa protected routes)
    if (isAuthenticated) {
      if (state?.returnUrl) {
        this.returnUrl = state.returnUrl;
      } else {
        this.onCancel();
      }
    }
  }

  onlyNumbers(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
      event.preventDefault();
    }
  }

  onCancel() {
    if (!this.authService.isAuthenticated()) {
      this.authService.clearLocalStorage();
      this.router.navigateByUrl('login');
      return;
    }
    this.router.navigateByUrl('home');
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.codeForm);
    if (this.codeForm.invalid) return;

    if (this.authService.isAuthenticated()) {
      this.submitAuth();
      return;
    }
    this.submitNoAuth();
  }

  submitNoAuth() {
    if (!this.temporalLoginData) {
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
    this.authService.twoFactorAuth(verifyEmailReq).subscribe({
      next: (res: any) => {
        const authData = res.data;
        this.messageService.create('success', 'Autenticado.');
        localStorage.removeItem('requires2fa');
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

  submitAuth() {
    // Temporal
    this.authService.setTwoFactorAuthenticated(true);
    this.router.navigate([this.returnUrl]);
  }

}
