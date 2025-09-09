import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LANGUAGES } from 'src/app/constants/languages';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { PopoverComponent } from 'src/app/shared/components/popover/popover.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';

@Component({
  selector: 'app-provider-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent, SelectComponent, PopoverComponent],
  templateUrl: './provider-form.component.html',
  styleUrl: './provider-form.component.scss'
})
export class ProviderFormComponent {

  @Input() form!: FormGroup;
  @Input() providerFormFields: string[] = [];
  @Input() identificationTypes: any[] = [];

  @Output() next = new EventEmitter<void>();

  languageList: any[] = LANGUAGES;

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get languages() { return this.form.get('languages'); }
  get idTypeDocument() { return this.form.get('idTypeDocument'); }

  emailInfoMessage: string[] = [
    "Correo único corporativo o personal del prestador.",
    "En caso de que administres o gestiones mas de un prestador, asegúrate de que el correo electrónico registrado sea el personal o corporativo correspondiente a cada uno de ellos."
  ];

  customErrorMessagesMap: { [key: string]: any } = {
    dv: {
      invalidDigit: (error: string) => error
    },
  };

  constructor(
    private alertService: AlertService,
  ) { }

  goNext() {
    this.providerFormFields.forEach(field => {
      const control = this.form.get(field);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
    const invalidFields = this.providerFormFields.filter(
      field => this.form.get(field)?.invalid
    );
    if (invalidFields.length > 0) {
      this.alertService.warning(
        'Datos incompletos',
        'Por favor completa todos los campos requeridos antes de continuar.'
      );
      return;
    }

    this.next.emit();
  }

  openEmailInfo() {
    this.alertService.info(
      this.emailInfoMessage[0],
      this.emailInfoMessage[1],
    );
  }

}
