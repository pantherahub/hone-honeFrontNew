import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { SurveysService } from 'src/app/services/surveys/surveys.service';
import { ButtonComponent } from '../../../ui/buttons/button/button.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TooltipComponent } from '../../../ui/overlays/tooltip/tooltip.component';
import { TextInputComponent } from '../../../ui/forms/text-input/text-input.component';
import { InputErrorComponent } from '../../../ui/forms/input-error/input-error.component';
import { RadioComponent } from '../../../ui/forms/radio/radio.component';
import { Subject, takeUntil } from 'rxjs';
import { ModalComponent } from '../../../ui/overlays/modal/modal.component';

@Component({
  selector: 'app-feedback-fivestars',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TooltipComponent, TextInputComponent, InputErrorComponent, RadioComponent],
  templateUrl: './feedback-fivestars.component.html',
  styleUrl: './feedback-fivestars.component.scss'
})
export class FeedbackFivestarsComponent implements OnDestroy {

  form: FormGroup;
  user = this.eventManager.userLogged();
  enableCloseModal: boolean = false;

  hoverRating = 0;
  // stars = Array(5);
  stars = ['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'];

  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  constructor(
    private modalRef: ModalComponent,
    private formUtils: FormUtilsService,
    private eventManager: EventManagerService,
    private surveysService: SurveysService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {
    this.form = this.fb.group({
      rating: [null, [Validators.required]],
      comments: [null],
      canContact: [false],
      phoneNumber: [null]
    });

    this.form.get('rating')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        const commentsControl = this.form.get('comments');
        if (value != null && value < 5) {
          commentsControl?.setValidators([Validators.required]);
        } else {
          commentsControl?.clearValidators();
        }
        commentsControl?.updateValueAndValidity();
      });

    this.form.get('canContact')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: boolean) => {
        const phoneControl = this.form.get('phoneNumber');
        if (value) {
          phoneControl?.setValidators([Validators.required, this.formUtils.numeric]);
        } else {
          phoneControl?.clearValidators();
          phoneControl?.reset();
        }
        phoneControl?.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedRating() {
    return this.form.get('rating')?.value;
  }

  setRating(value: number) {
    this.form.get('rating')?.setValue(value);
  }

  closeModal(): void {
    this.modalRef.close();
  }

  onSubmit(): void {
    this.formUtils.trimFormStrControls(this.form);
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.user.doesNeedSurvey) return;

    const reqData = {
      ...this.form.value,
      idProvider: this.user.id
    }

    this.surveysService.sendFeedback(reqData).subscribe({
      next: (res: any) => {
        const user = this.user;
        user.doesNeedSurvey = false;
        this.authService.saveUserLogged(user);
        this.modalRef.close({ submitted: true });
      },
      error: (error: any) => {
        this.enableCloseModal = true;
        this.toastService.error('Algo salió mal.');
      },
    });
  }

}
