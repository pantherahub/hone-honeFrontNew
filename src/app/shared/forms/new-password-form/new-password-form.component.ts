import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgZorroModule } from 'src/app/ng-zorro.module';

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

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  cancelForm() {
    this.cancel.emit();
  }

  onSubmit() {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    this.submitPassword.emit(this.passwordForm.value);
  }
}
