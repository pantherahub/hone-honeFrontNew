import { AfterContentChecked, Component, inject, Input, OnInit } from '@angular/core';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ResponseCreateTicketComponent } from '../response-create-ticket/response-create-ticket.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { TicketsService } from '../../../services/tickets/tickets.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { REGEX_PATTERNS } from 'src/app/constants/regex-patterns';
import { sanitizeString } from 'src/app/utils/string-utils';

@Component({
  selector: 'app-provider-ticket-login',
  standalone: true,
  imports: [NgZorroModule, CommonModule, NzModalModule],
  templateUrl: './provider-ticket-login.component.html',
  styleUrl: './provider-ticket-login.component.scss'
})
export class ProviderTicketLoginComponent implements AfterContentChecked, OnInit {

  loader: boolean = false;
  requestForm!: FormGroup;

  loadedFile: any;

  @Input() message?: string;

  userId: number = 4130;
  idClientHoneSolution: number = 7;
  emailAdmin: string = '';
  role: number = 4;

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  constructor(
    private formBuilder: FormBuilder,
    private formUtils: FormUtilsService,
    private notificationService: NzNotificationService,
    private eventManager: EventManagerService,
    private ticketService: TicketsService,
    private modalService: NzModalService,
  ) {
    this.createForm();
  }

  ngOnInit(): void { }

  ngAfterContentChecked(): void { }

  destroyModal(): void {
    this.#modal.destroy();
  }

  /**
   * Crea e Inicializa el formulario
   */
  createForm() {
    this.requestForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      identification: ['', [Validators.required, this.formUtils.numeric]],
      email: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.email)]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      observation: ['', [Validators.required]]
    });
  }

  /**
   * realiza el envio de la peticion de crear ticket
   */

  submitData() {
    if (this.requestForm.invalid) {
      Object.values(this.requestForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.loader = true;
    this.emailAdmin = this.requestForm.get("email")?.value;
    const data: Object = {
      requestName: 'Ingreso erroneo prestador',
      employeeCode: this.userId,
      description: this.getObservations(),
      typeRequest: 15,
      userId: this.userId,
      email: this.emailAdmin,
      idClientHone: this.idClientHoneSolution,
      requestDate: new Date().toISOString(),
      maxDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      idRole: this.role,
      userLogged: this.userId
    };

    this.postTicket(data);
  }

  /**
   * realiza consumo del api crear ticket
   * @param payload - recibe el objeto tipo formData
   */
  postTicket(payload: any) {
    this.loader = true;
    const idRole = this.role;
    this.ticketService.postTicket(idRole, payload).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.openSuccessModal();
        this.#modal.destroy();
      },
      error: (error: any) => {
        this.loader = false;
        this.openErrorModal();
      },
      complete: () => { }
    });
  }

  /**
   * Mapea y retorna el formulario en una sola cadena de string
   */
  getObservations(): string {
    const sanitize = (value: any): string => {
      return typeof value === 'string'
        ? sanitizeString(value.trim())
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
        : value;
    };
    const { name, lastname, identification, email, phone, address, observation } = this.requestForm.value;

    const observaciones = `<strong>Datos reportados del usuario:</strong>
      Nombre: ${sanitize(name)}
      Apellido: ${sanitize(lastname)}
      Identificación: ${sanitize(identification)}
      Email: ${sanitize(email)}
      Teléfono: ${sanitize(phone)}
      Dirección: ${sanitize(address)}
      Observaciones: ${sanitize(observation)}
      `;
    return observaciones;
  }

  /**
   * Crea una notificacion de alerta
   * @param type - string recibe el tipo de notificacion (error, success, warning, info)
   * @param title - string recibe el titulo de la notificacion
   * @param message - string recibe el mensaje de la notificacion
   */
  createNotificacion(type: string, title: string, message: string) {
    this.notificationService.create(type, title, message);
  }


  /**
  * Funcion que permite escribir solo numeros y el simbolo + en el input
  */
  keyPressCode(event: any) {
    const charCode = event.keyCode;
    if (charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57)) { return false; }
    return true;
  }
  /**
  * abre el modal con la notificación de que el ticket fue creado con exito
  */
  openSuccessModal() {
    const modal = this.modalService.create<ResponseCreateTicketComponent, any>({
      nzContent: ResponseCreateTicketComponent,
      nzCentered: true,
      nzClosable: false,
      nzFooter: null,  // Para ocultar los botones por defecto del modal
      nzMaskClosable: false, // Para evitar que se cierre al hacer clic fuera del modal
      // nzOnOk: () => console.log('OK'),
      // nzOnCancel: () => console.log('Cancelar') // Maneja el evento de cancelación
    });
  }
  /**
  * abre el modal con la notificación de que hubo error al crear el ticket
  */
  openErrorModal() {
    this.modalService.create({
      // nzTitle: 'Error',
      nzContent: `<p>Lo sentimos, hubo un error en el servidor.</p>`,
      nzFooter: null  // Para ocultar los botones por defecto del modal
    });
  }


}
