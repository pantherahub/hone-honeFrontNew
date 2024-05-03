import { Component, AfterContentChecked, Input, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { TicketsService } from '../../../services/tickets/tickets.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { mailRegexpValidation } from '../../../utils/constant';

@Component({
   selector: 'app-contact-ticket',
   standalone: true,
   imports: [NgZorroModule, CommonModule],
   templateUrl: './contact-ticket.component.html',
   styleUrl: './contact-ticket.component.scss'
})
export class ContactTicketComponent implements AfterContentChecked, OnInit {
   loader: boolean = false;
   requestForm!: FormGroup;

   loadedFile: any;
  
   @Input() message?: string;

   user = this.eventManager.userLogged();
   clientSelected: any = this.eventManager.clientSelected();

   readonly #modal = inject(NzModalRef);
   readonly nzModalData: any = inject(NZ_MODAL_DATA);

   constructor(
      private formBuilder: FormBuilder,
      private notificationService: NzNotificationService,
      private eventManager: EventManagerService,
      private ticketService: TicketsService
   ) {
      this.createForm();
   }
   ngOnInit(): void {
     
   }

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
         identification: ['', [Validators.required]],
         email: ['', [Validators.required, Validators.pattern(mailRegexpValidation)]],
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
      const payload = new FormData();

      const data: Object = {
         tipoSolicitud: 1,
         nombreSolicitud: 'Solicitud prestador',
         observaciones: this.getObservations(),
         idusuarios: this.user.id,
         email: this.user.email,
         fechaSolicitud: new Date().toISOString(),
         fechaMaxima: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };

      for (const [key, value] of Object.entries(data)) {
         if (value != null && value.toString().trim() != '') {
            payload.append(key, value);
         }
      }

      this.postTicket(payload);
   }

   /**
    * realiza consumo del api crear ticket
    * @param payload - recibe el objeto tipo formData
    */
   postTicket(payload: any) {
      this.loader = true;
      const idRole = this.user ? this.user.roles!.idRoles : 0;
      this.ticketService.postTicket(idRole, payload).subscribe({
         next: (res: any) => {
            this.loader = false;
            this.createNotificacion('success', 'Ticket creado', 'El ticket se creó correctamente.');
            this.#modal.destroy();
         },
         error: (error: any) => {
            this.loader = false;
            this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
         },
         complete: () => { }
      });
   }

   /**
    * Mapea y retorna el formulario en una sola cadena de string
    */
   getObservations(): string {
      const { name, lastname, identification, email, phone, address, observation } = this.requestForm.value;

      const observaciones = `
      Información del usuario que genera caso:  Nombre: ${this.clientSelected.razonSocial} ,   identificacion: ${this.clientSelected.identificacion} ,   cliente: ${this.clientSelected.clientHoneSolutions}
      <br>
      Datos reportados del usuario:
      <br> Nombre: ${name},  <br> Apellido: ${lastname},  <br> Identificación: ${identification},  <br> Teléfono: ${phone},  
      <br> Email: ${email}, <br> Dirección: ${address},  <br> Observaciones: ${observation}, <br>
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
}
