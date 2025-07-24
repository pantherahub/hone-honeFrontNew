import { Component } from '@angular/core';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TextInputComponent, InputErrorComponent, ModalComponent, SelectComponent, CheckboxComponent, ButtonComponent],
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.scss'
})
export class TestsComponent {

  constructor (
    private toastService: ToastService,
  ) { }

  exampleList: string[] = ['Primera opción', 'Segunda opción', 'Tercera opción', 'Cuarta opción']
  selectedCountry: any;
  selectedCountry2: any;

  options: any[] = [
    {label: "Opcion 1", value: "Opcion 1 Value"},
    {label: "Opcion 2", value: "Opcion 2 Value"},
    {label: "Opcion 3", value: "Opcion 3 Value"},
    {label: "Opcion 4", value: "Opcion 4 Value"},
  ];

  checkboxStatus: boolean = false;

  onClickTest() {
    // this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
    // this.toastService.success('Datos guardados correctamente');
    this.toastService.success('Documentos subidos');
  }

}
