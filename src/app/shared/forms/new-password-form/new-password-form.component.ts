import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-new-password-form',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './new-password-form.component.html',
  styleUrl: './new-password-form.component.scss'
})
export class NewPasswordFormComponent implements OnInit {
  passwordForm!: FormGroup;

  @Input() showCancelButton: boolean = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() submitPassword = new EventEmitter<{ newPassword: string, confirmPassword: string }>();
  @Output() validationFailed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService
  ) { }

  ngOnInit() {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    const newPasswordControl = form.get('newPassword');
    const confirmPasswordControl = form.get('confirmPassword');
    if (confirmPasswordControl?.errors && !confirmPasswordControl.errors['passwordMismatch']) {
      return null;
    }

    if (newPasswordControl?.value !== confirmPasswordControl?.value) {
      confirmPasswordControl?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  cancelForm() {
    this.cancel.emit();
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.passwordForm);
    this.passwordForm.updateValueAndValidity();
    if (this.passwordForm.invalid) {
      this.validationFailed.emit();
      return;
    }
    this.submitPassword.emit(this.passwordForm.value);
  }
}
