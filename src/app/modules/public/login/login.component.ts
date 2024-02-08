import { Component, OnInit } from '@angular/core';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [ NgZorroModule, CommonModule ],
   templateUrl: './login.component.html',
   styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
   loader: boolean = false;
   isSubmitData: boolean = false;
   passwordVisible: boolean = false;

   loginForm!: FormGroup;
   constructor (
      private authService: AuthService,
      public router: Router,
      private formBuilder: FormBuilder,
      private messageService: NzMessageService,
      private eventManager: EventManagerService
   ) {
      this.createForm();
   }

   ngOnInit (): void {}

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
      this.isSubmitData = true;

      const { email, password } = this.loginForm.value;
      const payload: any = {
         email,
         contrasena: password
      };

      this.authService.login(payload).subscribe({
         next: (res: any) => {
            this.isSubmitData = false;
            this.eventManager.showMenu.set(true);
            this.router.navigateByUrl('home');
         },
         error: (error: any) => {
            this.isSubmitData = false;
         },
         complete: () => {}
      });
   }
}
