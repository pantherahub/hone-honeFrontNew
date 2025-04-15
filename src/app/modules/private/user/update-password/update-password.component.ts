import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { NewPasswordFormComponent } from 'src/app/shared/forms/new-password-form/new-password-form.component';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, RouterModule, NewPasswordFormComponent],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: NzMessageService,
  ) { }

  ngOnInit() { }

  onPasswordSubmitted(event: { newPassword: string, confirmPassword: string }) {
    const newPassword = event.newPassword;
    const confirmPassword = event.confirmPassword;
    console.log('Nueva contraseña:', newPassword);

    this.authService.updatePasswordAuth({ password: newPassword }).subscribe({
      next: (res: any) => {
        this.messageService.success('Contraseña actualizada con éxito');
        // Close modal
        this.router.navigate(['/home']);
      },
      error: () => this.messageService.error('Error actualizando la contraseña'),
    });
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
