import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { AssistanceProvidersComponent } from '../../../shared/forms/assistance-forms/assistance-providers/assistance-providers.component';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderAsisstService } from '../../../services/assist-provider/provider-asisst.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-provider-assistancess',
  standalone: true,
  imports: [AssistanceProvidersComponent, NgZorroModule, CommonModule, NzModalModule],
  templateUrl: './provider-assistancess.component.html',
  styleUrl: './provider-assistancess.component.scss'
})
export class ProviderAssistancessComponent implements AfterViewInit,  OnInit {

  @ViewChild(AssistanceProvidersComponent) assistanceProvidersComponent!: AssistanceProvidersComponent;

  idClientHoneSolutions: any = 0;
  showForm: boolean = false;
  loader: boolean = false;
  constructor(
    private route: ActivatedRoute,    
    private asistProviderService : ProviderAsisstService,
    private notificationService: NzNotificationService,
  ) { }

  /**
   * Path page-form-assistance?x_client=8
   */
  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      let paramsObject: any = { ...params };
      if (paramsObject['params'].x_client != null && paramsObject['params'].x_client != '') {
        this.showForm = true;
        this.idClientHoneSolutions = paramsObject['params'].x_client;
      }
    });

  }

  ngAfterViewInit() {
    console.log(this.assistanceProvidersComponent.assistanceProviderForm.value);
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
      idClientHoneSolutions: this.idClientHoneSolutions,
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
        this.createNotificacion('success', 'Notificación', data.msg);    
        this.showForm = false;   
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
