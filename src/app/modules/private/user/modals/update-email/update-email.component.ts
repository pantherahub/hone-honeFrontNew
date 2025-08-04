import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AuthUserState } from 'src/app/models/user-state.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
// import { VerificationCodeFormComponent } from 'src/app/shared/forms/verification-code-form/verification-code-form.component';

@Component({
  selector: 'app-update-email',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './update-email.component.html',
  styleUrl: './update-email.component.scss'
})
export class UpdateEmailComponent implements OnInit {

  step: number = 0;
  emailForm!: FormGroup;
  userData: AuthUserState | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: NzMessageService,
    private formUtils: FormUtilsService,
    private modal: NzModalRef,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, this.formUtils.email]],
    });
    this.userData = this.authService.getUserData();
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.emailForm);
    if (this.emailForm.invalid || !this.userData) return;

    const currentEmail = this.userData.email;
    if (currentEmail === this.emailForm.value.email) {
      this.alertService.warning('Aviso', 'Actualiza el correo.');
      return;
    }
    this.messageService.success('Correo actualizado.');
    this.modal.close('success');
  }

  onCancel() {
    this.modal.close('cancel');
  }

}
