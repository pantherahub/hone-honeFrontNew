import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { REGEX_PATTERNS } from 'src/app/constants/regex-patterns';

@Component({
  selector: 'app-assistance-providers',
  standalone: true,
  imports: [NgZorroModule, CommonModule, NzModalModule, NzCheckboxModule, ReactiveFormsModule],
  templateUrl: './assistance-providers.component.html',
  styleUrl: './assistance-providers.component.scss'
})
export class AssistanceProvidersComponent implements OnInit {

  assistanceProviderForm!: FormGroup;
  checkedProvider_new : number = 0;
  checkedProvider_attached : number = 0;
  checkedAttended : boolean = false;
  radioValue = 0;
  provider_new: number | null = null;
  provider_attached: number | null = null;
  updating: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.createForm();
  }

  ngOnInit() {  }

  /**
   * Crea e Inicializa el formulario
   */
  createForm() {
    this.assistanceProviderForm = this.formBuilder.nonNullable.group({
      identification: ['', [Validators.required]],
      nameProvider: ['', [Validators.required]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.email)]],
      phone: ['', [Validators.required]],
      provider_new: [null, [Validators.required]],
      provider_attached: [null, [Validators.required]],
      attended_previus: ['', [Validators.required]],
      speciality: ['', [Validators.required]],
      city: ['', [Validators.required]],
      nameAssistante: [''],
      idProvider : [''],
      idOfficeProvider : [''],
      idClientHoneSolutions: [''],
      dateAssistance: [''],
    });
  }
  /**
   * cambio de evento para el check, donde selecciona uno y descomenta el otro chekc, ademas
   * de enviar tipo de dato number segun el boolean
   * @param type -boolean
   * @param value - 1 for TRUE, OR 0 for FALSE
   */
  onRadioChange(type: string, value: number) {
    if (this.updating) return;
    this.updating = true;
    if (type === 'new') {
      this.provider_new = value;
      this.provider_attached = 0;
      this.assistanceProviderForm.controls['provider_attached'].setValue('0', { emitEvent: false });
    } else if (type === 'attached') {
      this.provider_attached = value;
      this.provider_new = 0;
      this.assistanceProviderForm.controls['provider_new'].setValue('0', { emitEvent: false });
    }
    this.cdr.detectChanges();
    this.updating = false;
  }

  /**
   * @message deshabilitacion de campos del fomulario
   * @data Cuando la url tiene datos
   * @param controlsToDisable
   */
  disableFormControls(controlsToDisable: string[]) {
    controlsToDisable.forEach(controlName => {
      if (this.assistanceProviderForm.controls[controlName]) {
        this.assistanceProviderForm.controls[controlName].disable();
      }
    });
  }
}
