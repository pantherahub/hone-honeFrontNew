import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-validate-password-content',
  standalone: true,
  imports: [NgZorroModule, CommonModule, RouterModule],
  templateUrl: './validate-password-content.component.html',
  styleUrl: './validate-password-content.component.scss'
})
export class ValidatePasswordContentComponent implements OnInit {

  @Input() isModal = true;
  // @Output() modalClose = new EventEmitter<'success' | 'cancel'>();

  loading: boolean = false;
  passwordForm!: FormGroup;
  passwordVisible: boolean = false;

  returnUrl: string = '/home';

  constructor(
    private modal: NzModalRef,
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

    if (!this.isModal) {
      const state = this.location.getState() as { returnUrl?: string };
      if (!state?.returnUrl) {
        this.onCancel();
        return;
      }
      this.returnUrl = state.returnUrl;
    }
  }

  forgotPassword() {
    if (this.isModal) this.modal.close('cancel');
    this.router.navigate(['/forgot-password']);
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.passwordForm);
    if (this.passwordForm.invalid) return;

    const currentPassword = this.passwordForm.value.currentPassword;
    console.log('Contraseña:', currentPassword);

    // this.router.navigate(['/home']);
    if (this.isModal) {
      this.modal.close('success');
      return;
    }
    this.authService.setTwoFactorAuthenticated(true);
    this.router.navigate([this.returnUrl]);
  }

  onCancel() {
    if (this.isModal) {
      this.modal.close('cancel');
      return;
    }
    this.router.navigate(['/home']);
  }

}
