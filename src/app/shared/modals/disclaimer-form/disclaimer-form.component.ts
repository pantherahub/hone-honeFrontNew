import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CreateDisclaimerResponsePayload, Disclaimer } from 'src/app/models/disclaimer.interface';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { InputErrorComponent } from '../../components/input-error/input-error.component';
import { RadioComponent } from '../../components/radio/radio.component';
import { ModalService } from 'src/app/services/modal/modal.service';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';

@Component({
  selector: 'app-disclaimer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent, RadioComponent],
  templateUrl: './disclaimer-form.component.html',
  styleUrl: './disclaimer-form.component.scss'
})
export class DisclaimerFormComponent implements OnInit {

  @Input({ required: true }) disclaimer!: Disclaimer;
  // @Input() disclaimer!: Disclaimer;

  form!: FormGroup;
  user = this.eventManager.userLogged();
  enableCloseModal: boolean = false;

  constructor(
    private modalRef: ModalComponent,
    private eventManager: EventManagerService,
    private disclaimerService: DisclaimerService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      isApproved: [false, [Validators.required]],
      observations: [null],
    });
  }

  closeModal(): void {
    this.modalRef.close();
  }

  viewFile() {
    if (!this.disclaimer.fileUrl) return;
    this.modalService.open(FileViewerComponent, {
      closable: true,
      customSize: 'max-w-[800px] !gap-2',
    }, {
      title: 'Documento',
      url: this.disclaimer.fileUrl,
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.disclaimer) return;

    const reqData: CreateDisclaimerResponsePayload = {
      ...this.form.value,
      idProvider: this.user.id,
      idDisclaimer: this.disclaimer.idDisclaimer,
    }

    this.disclaimerService.sendDisclaimerResponse(reqData).subscribe({
      next: (res: any) => {
        this.modalRef.close({ submitted: true });
      },
      error: (error: any) => {
        this.enableCloseModal = true;
        this.toastService.error('Algo salió mal.');
      },
    });
  }

}
