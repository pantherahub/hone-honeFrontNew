import { Component, OnInit } from '@angular/core';
import { NgZorroModule } from '../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

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

   loginForm!: FormGroup;
   constructor (
      private authService: AuthService,
      public router: Router,
      private formBuilder: FormBuilder,
      private messageService: NzMessageService
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
      const payload: any = this.loginForm.value;

      setTimeout(() => {
         this.isSubmitData = false;
         this.router.navigateByUrl('home');
      }, 2000);
      // this.authService.login(payload).subscribe({
      //    next: (res: any) => {
      //       this.isSubmitData = false;
      //       this.router.navigateByUrl('home');
      //    },
      //    error: (error: any) => {
      //       this.isSubmitData = false;
      //    },
      //    complete: () => {}
      // });
   }
}
