import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-validate-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, RouterModule],
  templateUrl: './validate-password.component.html',
  styleUrl: './validate-password.component.scss'
})
export class ValidatePasswordComponent implements OnInit {

  loading: boolean = false;
  passwordForm!: FormGroup;
  passwordVisible: boolean = false;

  returnUrl: string = '/home';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private formUtils: FormUtilsService,
    private location: Location,
  ) { }

  ngOnInit() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]]
    });

    const state = this.location.getState() as { returnUrl?: string };
    if (!state?.returnUrl) {
      this.onCancel();
      return;
    }
    this.returnUrl = state.returnUrl;
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.passwordForm);
    if (this.passwordForm.invalid) return;

    const currentPassword = this.passwordForm.value.currentPassword;
    console.log('Contraseña:', currentPassword);

    // this.router.navigate(['/home']);
    this.authService.setTwoFactorAuthenticated(true);
    this.router.navigate([this.returnUrl]);
  }

  onCancel() {
    this.router.navigate(['/home']);
  }

}
