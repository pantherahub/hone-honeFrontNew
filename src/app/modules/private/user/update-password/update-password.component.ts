import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';
import { NewPasswordFormComponent } from 'src/app/shared/forms/new-password-form/new-password-form.component';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, NewPasswordFormComponent],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss'
})
export class UpdatePasswordComponent implements OnInit {

  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]]
    });
  }

  onPasswordSubmitted(event: { newPassword: string, confirmPassword: string }) {
    if (this.passwordForm.valid) {
      const currentPassword = this.passwordForm.value.currentPassword;
      const newPassword = event.newPassword;
      const confirmPassword = event.confirmPassword;

      // if (newPassword !== confirmPassword) {
      //   alert('Las contraseñas no coinciden');
      //   return;
      // }

      this.alertService.success('Actualizada', 'Contraseña actualizada con éxito');

      console.log('Contraseña actual:', currentPassword);
      console.log('Nueva contraseña:', newPassword);

      this.router.navigate(['/home']);
    }
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
