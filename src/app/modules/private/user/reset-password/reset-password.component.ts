import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { NewPasswordFormComponent } from 'src/app/shared/forms/new-password-form/new-password-form.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, NewPasswordFormComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: NzMessageService,
  ) { }

  ngOnInit() {
    const requiresPasswordReset = localStorage.getItem('requiresPasswordReset');
    if (!requiresPasswordReset) this.router.navigate(['/home']);
  }

  onPasswordSubmitted(event: { newPassword: string, confirmPassword: string }) {
    const newPassword = event.newPassword;
    const confirmPassword = event.confirmPassword;

    this.authService.updatePasswordAuth({ password: newPassword }).subscribe({
      next: (res: any) => {
        this.messageService.success('Contraseña actualizada con éxito');
        localStorage.removeItem('requiresPasswordReset');
        this.router.navigate(['/home']);
      },
      error: () => this.messageService.error('Error actualizando la contraseña'),
    });
  }

  onCancel() {
    this.authService.logout();
  }

}
