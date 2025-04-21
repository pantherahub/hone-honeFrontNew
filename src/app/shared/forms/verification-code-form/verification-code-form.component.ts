import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Observable, Subscription } from 'rxjs';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-verification-code-form',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './verification-code-form.component.html',
  styleUrl: './verification-code-form.component.scss'
})
export class VerificationCodeFormComponent implements OnInit, OnDestroy {

  @Input() showResend = false;
  @Input() loading = false;
  @Input() resendDelay = 30; // default 30s
  @Input() resendKey = 'resendTimestamp'; // localStorage key
  @Input() confirmButton = 'Continuar';

  @Output() submitCode = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() resend = new EventEmitter<() => void>(); // with callback

  codeForm!: FormGroup;
  countdown = 0;
  isResendDisabled = false;

  private countdownSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit(): void {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    if (this.showResend) {
      this.initCountdownFromStorage();
    }
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  onlyNumbers(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Enter') {
      event.preventDefault();
    }
  }

  initCountdownFromStorage(): void {
    const lastResendTime = localStorage.getItem(this.resendKey);
    const now = Date.now();

    if (lastResendTime) {
      const elapsedTime = Math.floor((now - Number(lastResendTime)) / 1000);
      if (elapsedTime < this.resendDelay) {
        this.countdown = this.resendDelay - elapsedTime;
        this.isResendDisabled = true;
        this.startCountdown();
        return;
      }
      localStorage.removeItem(this.resendKey);
    }

    this.isResendDisabled = false;
    this.countdown = 0;
  }

  startCountdown(): void {
    this.isResendDisabled = true;
    this.countdownSub?.unsubscribe();

    this.countdownSub = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.isResendDisabled = false;
        this.countdownSub?.unsubscribe();
        localStorage.removeItem(this.resendKey);
      }
    });
  }

  onResend(): void {
    if (!this.isResendDisabled && !this.loading) {
      // Emit a callback
      this.resend.emit(() => {
        localStorage.setItem(this.resendKey, Date.now().toString());
        this.countdown = this.resendDelay;
        this.startCountdown();
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    this.formUtils.markFormTouched(this.codeForm);
    if (this.codeForm.invalid) return;

    this.submitCode.emit(this.codeForm.value.code);
  }

}
