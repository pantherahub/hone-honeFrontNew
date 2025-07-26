import { Component, HostListener, OnInit } from '@angular/core';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ProviderTicketLoginComponent } from 'src/app/shared/modals/provider-ticket-login/provider-ticket-login.component';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [ NgZorroModule, CommonModule, RecaptchaModule, TextInputComponent, InputErrorComponent, ButtonComponent ],

   templateUrl: './login.component.html',
   styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loader: boolean = false;
  isSubmitData: boolean = false;
  passwordVisible: boolean = false;
  captchaValidation: boolean = false;
  showError: boolean = false;
  siteKey = environment.PUBLIC_PASS_KEY;
  loginForm!: FormGroup;

  constructor (
    private authService: AuthService,
    public router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NzNotificationService,
    private modalService: NzModalService,
    private tutorialService: TutorialService,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    console.log('environment prod: ', environment.production);
    localStorage.clear();

    const hasSupportParam = this.router.url.includes('?support=true');
    if (hasSupportParam) this.openTicketModal();
  }

  //  Crea e Inicializa el formulario
  createForm () {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: [ '', [ Validators.required ] ],
      password: [ '', [ Validators.required ] ]
    });
  }

  //  Envia peticion al servicio de login para obtener el token de acceso
  submitRequest () {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    if (!this.captchaValidation) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.isSubmitData = true;

    const { email, password } = this.loginForm.value;
    const payload: any = {
      email,
      contrasena: password
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.isSubmitData = false;
        this.tutorialService.resetTutorial();
        this.router.navigateByUrl('home');
      },
      error: (error: any) => {
        this.isSubmitData = false;

        if (error.status == 401) {
          this.createNotificacion('error', 'Error', error.error.message);
          return;
        }

        this.createNotificacion('error', 'Error', 'Lo sentimos, hubo un error en el servidor.');
      },
      complete: () => {}
    });
  }

  /**
  * Crea una notificacion de alerta
  * @param type - string recibe el tipo de notificacion (error, success, warning, info)
  * @param title - string recibe el titulo de la notificacion
  * @param message - string recibe el mensaje de la notificacion
  */
  createNotificacion (type: string, title: string, message: string) {
    this.notificationService.create(type, title, message);
  }

  resolved (captchaResponse: any) {
    this.captchaValidation = true;
    this.showError = false;
  }

  errored () {
    this.captchaValidation = false;
    this.showError = true;
    console.warn(`reCAPTCHA error encountered`);
  }

  /**
  * Abre una ventana modal para solicitar ticket por inicio de sesión erroneous
  */
  openTicketModal(): void {
    const modal = this.modalService.create<ProviderTicketLoginComponent, any>({
      nzContent: ProviderTicketLoginComponent,
      nzCentered: true,
      nzClosable: true,
      // nzFooter: null
      nzMaskClosable: false, // Para evitar que se cierre al hacer clic fuera del modal
    });
    const instance = modal.getContentComponent();

    // instance.message = message;

    // Return a result when opened
    modal.afterOpen.subscribe(() => { });
    // Return a result when closed
    modal.afterClose.subscribe((result: any) => {
      if (result) {
      }
    });
  }

}
