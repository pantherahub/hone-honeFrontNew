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
export class ProviderAssistancessComponent implements AfterViewInit, OnInit {

  @ViewChild(AssistanceProvidersComponent) assistanceProvidersComponent!: AssistanceProvidersComponent;

  idClientHoneSolutions: any = 0;
  idOfficeProvider: any;
  idProvider: any;
  nameProvider: any;
  email: any;
  identification: any;
  city: any;
  showForm: boolean = false;
  loader: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private asistProviderService: ProviderAsisstService,
    private notificationService: NzNotificationService,
  ) { }

  /**
   * http://localhost:4200/page-form-assistance?x_client=4&idOfficeProviderClient=2975&provider=5926&user=Fauner&email=faunerramirez@outlook.com&id=1061692138&city=Armenia
   * Path page-form-assistance?x_client=8
  https://honesolutionsprovider.azurewebsites.net/page-form-assistance?x_client=4?{this.idOfficeProvider}?{this.idProvider}?{this.userName}?{this.email}?{this.identificacion}
  https://honesolutionsprovider.azurewebsites.net/page-form-assistance?x_client=4&office=12344&provider=5926&user=Fauner&email=faunerramirez@outlook.com&id=1061692138&city=Armenia
  https://honesolutionsprovider.azurewebsites.net/page-form-assistance?x_client=4&idOfficeProviderClient=154088&provider=174151&user=Juan Tobar&email=juansetonog@gmail.com&id=1085346541&city=Cravo Norte
   */


  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      let paramsObject: any = { ...params };

      if (paramsObject['params'].x_client != null && paramsObject['params'].x_client != '') {
        this.showForm = true;
        this.idClientHoneSolutions = paramsObject['params'].x_client;
        this.idOfficeProvider = paramsObject['params'].idOfficeProviderClient;
        this.idProvider = paramsObject['params'].provider;
        this.nameProvider = paramsObject['params'].user;
        this.identification = paramsObject['params'].id;
        this.city = paramsObject['params'].city;
        this.email = paramsObject['params'].email;
        
      }
    });
   
  
  }

  ngAfterViewInit() {
    console.log(this.assistanceProvidersComponent.assistanceProviderForm.value);
    // Usamos setTimeout para asegurarnos de que los cambios se apliquen en el siguiente ciclo de detección de cambios.
    //Movemos la lógica de llenado del formulario al ciclo de vida ngAfterViewInit para asegurarnos de que el componente hijo y 
    //su formulario estén completamente inicializados.

    setTimeout(() => {
      this.patchFormValues();
    });
  }

  patchFormValues() {
    if (this.assistanceProvidersComponent && this.assistanceProvidersComponent.assistanceProviderForm) {
      this.assistanceProvidersComponent.assistanceProviderForm.patchValue({
        idClientHoneSolutions: this.idClientHoneSolutions,
        idOfficeProvider: this.idOfficeProvider,
        idProvider: this.idProvider,
        nameProvider: this.nameProvider,
        identification: this.identification,
        city: this.city,
        email: this.email
      });
      // Deshabilitamos solo los campos del formulario que necesitamos cuando la data se llene con los valores de la url y
      // llamamos la funcion que tenemos en el componente hijito this.assistanceProvidersComponent.disableFormControls();
      this.assistanceProvidersComponent.disableFormControls([
        'idClientHoneSolutions',
        'idOfficeProvider',
        'idProvider',
        'nameProvider',
        'identification',
        'city',
        'email'
      ]);
    }
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
      dateAssistance: new Date().toISOString(),
      idOfficeProvider: this.idOfficeProvider,
      idProvider: this.idProvider,
      nameProvider: this.nameProvider,
      identification: this.identification,
      city: this.city,
      email: this.email

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
        // this.router.navigate(['/new-url']); navegar a otra ruta en caso de ser necessario
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
