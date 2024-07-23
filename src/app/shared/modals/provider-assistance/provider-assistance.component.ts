import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { AssistanceProvidersComponent } from '../../forms/assistance-forms/assistance-providers/assistance-providers.component';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ProviderAsisstService } from '../../../services/assist-provider/provider-asisst.service';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-provider-assistance',
  standalone: true,
  imports: [AssistanceProvidersComponent, NgZorroModule, CommonModule, NzModalModule],
  templateUrl: './provider-assistance.component.html',
  styleUrl: './provider-assistance.component.scss'
})
export class ProviderAssistanceComponent implements AfterViewInit {
  readonly #modal = inject(NzModalRef);
  @ViewChild(AssistanceProvidersComponent) assistanceProvidersComponent!: AssistanceProvidersComponent;
  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loader: boolean = false;
  constructor(
    private modalService: NzModalService,
    private asistProviderService : ProviderAsisstService,
    private eventManager: EventManagerService,    
    private notificationService: NzNotificationService,
  ) {}

  /**
   * Captura del formulario global
   */
  ngAfterViewInit(){    
    console.log("parametros del formulario",this.assistanceProvidersComponent.assistanceProviderForm.value );
    console.log(this.clientSelected.idClientHoneSolutions);
  }

  submitForm() {
    const formGroup = this.assistanceProvidersComponent.assistanceProviderForm;

    if (formGroup.invalid) {
      Object.values(formGroup.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loader = true;
    const formValue = formGroup.value;    
    const payload: any = {
      ...formValue,
      idClientHoneSolutions: this.clientSelected.idClientHoneSolutions,
      dateAssistance :new Date().toISOString()
   };
   
    this.postProviderAssist(payload);
    
  }
  /**
  * realiza consumo del api crear asistencia del prestador
  * @param payload - recibe el objeto tipo formData
  */
  postProviderAssist(payload: any) {
    this.loader = true;
    this.asistProviderService.addAsistenceProvider(payload).subscribe({
      next: (data: any) => {
        this.loader = false;        
        this.createNotificacion('success', 'Notificación',data.msg);
        this.#modal.destroy();
     },
     error: (error: any) => {
        this.loader = false;          
        this.createNotificacion('error', 'Error', error.msg);
     },
     complete: () => { }
    });
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


}
