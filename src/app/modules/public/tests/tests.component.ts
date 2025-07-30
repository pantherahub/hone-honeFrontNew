import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalService } from 'src/app/services/modal/modal.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TextInputComponent, InputErrorComponent, ModalComponent, SelectComponent, CheckboxComponent, ButtonComponent],
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.scss'
})
export class TestsComponent implements OnInit, AfterViewInit {

  @ViewChild('videoModalTemplate', { static: false }) videoModalTemplate!: TemplateRef<any>;
  @ViewChild('customModal', { static: false }) customModal!: TemplateRef<any>;
  @ViewChild('customTpl', { static: false }) customTpl!: TemplateRef<any>;

  constructor (
    private toastService: ToastService,
    private modalService: ModalService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // this.modalService.open(this.videoModalTemplate, { title: 'Hola' }, { myInput: 'value' })
    //   .onClose.subscribe((result) => {
    //     console.log('Modal cerrado con:', result);
    //   });

    // this.modalService.open(this.videoModalTemplate, { title: 'Hola' })
    //   .onClose.subscribe((result) => {
    //     console.log('Modal cerrado con:', result);
    //   });

  }

  openCustomModal() {
    this.modalService.open(this.customModal, { title: 'customModal' })
      .onClose.subscribe((result) => {
        console.log('Custom modal cerrado con:', result);
      });
  }

  onOpenAlert() {
    let html = `
      <p>
        Para <strong>IPS</strong>, el valor mínimo requerido de la póliza es equivalente a
        <strong>2 SMLV</strong>
        (<strong>2 x $1.122.312 = $1.122.312</strong>)
      </p>
      <p>
        Para <strong>IPS</strong>, el valor mínimo requerido de la póliza es equivalente a
        <strong>2 SMLV</strong>
        (<strong>2 x $1.122.312 = $1.122.312</strong>)
      </p>
    `;
    html += `<p class="mt-3">Por favor verifica este monto.</p>`;
    this.alertService.showAlert({
      title: 'Información sobre valores de póliza',
      message: this.customTpl,
      // messageHTML: html,
      variant: 'info',
      isConfirmation: true,
      customSize: 'max-w-lg',
    }).subscribe((confirmed) => {
      console.log("confirmed", confirmed);
    });
    // this.alertService.showAlert({
    //   title: '¿Estás seguro?',
    //   message: 'Esto no se puede deshacer',
    //   variant: 'warning',
    //   isConfirmation: true,
    // }).subscribe((confirmed) => {
    //   if (confirmed) {
    //     // Acción confirmada
    //   }
    // });
  }

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
