import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';
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
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    const requiresPasswordReset = localStorage.getItem('requiresPasswordReset');
    if (!requiresPasswordReset) this.router.navigate(['/home']);
  }

  onPasswordSubmitted(event: { newPassword: string, confirmPassword: string }) {
    const newPassword = event.newPassword;
    const confirmPassword = event.confirmPassword;

    // if (newPassword !== confirmPassword) {
    //   alert('Las contraseñas no coinciden');
    //   return;
    // }

    // this.alertService.success('Actualizada', 'Contraseña actualizada con éxito');

    console.log('Nueva contraseña:', newPassword);
    localStorage.removeItem('requiresPasswordReset');
    this.router.navigate(['/home']);
  }

}
