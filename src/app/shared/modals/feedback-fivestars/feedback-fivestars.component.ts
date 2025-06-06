import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { SurveysService } from 'src/app/services/surveys/surveys.service';

@Component({
  selector: 'app-feedback-fivestars',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './feedback-fivestars.component.html',
  styleUrl: './feedback-fivestars.component.scss'
})
export class FeedbackFivestarsComponent {

  tooltips = ['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'];
  form: FormGroup;
  user = this.eventManager.userLogged();
  enableCloseModal: boolean = false;

  private fb = inject(FormBuilder);
  private modal = inject(NzModalRef);

  constructor(
    private formUtils: FormUtilsService,
    private eventManager: EventManagerService,
    private surveysService: SurveysService,
    private notificationService: NzNotificationService,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      rating: [null, [Validators.required]],
      comments: [null],
      canContact: [false],
      phoneNumber: [null]
    });

    this.form.get('canContact')?.valueChanges.subscribe((value: boolean) => {
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

  closeModal(): void {
    this.modal.destroy();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.user.doesNeedSurvey) return;

    const reqData = {
      ...this.form.value,
      idProvider: this.user.id
    }
    console.log(this.form.value);

    this.surveysService.sendFeedback(reqData).subscribe({
      next: (res: any) => {
        const user = this.user;
        user.doesNeedSurvey = false;
        this.authService.saveUserLogged(user);
        this.notificationService.create('success', 'Enviado', 'Comentarios enviados satisfactoriamente');
        this.modal.close();
      },
      error: (error: any) => {
        this.enableCloseModal = true;
        this.notificationService.create('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
      },
    });
  }

}
