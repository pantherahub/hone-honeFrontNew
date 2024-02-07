import { Component, inject, AfterContentChecked, Input } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from '../../../../ng-zorro.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

// interface IModalData {
//    labelRedirectButton: string;
//    labelRedirectButton2: string;
//    labelReturnButton: string;
// }

@Component({
   selector: 'app-modal-edit-document',
   standalone: true,
   imports: [ NgZorroModule, CommonModule ],
   templateUrl: './modal-edit-document.component.html',
   styleUrl: './modal-edit-document.component.scss'
})
export class ModalEditDocumentComponent implements AfterContentChecked {
   loader: boolean = false;
   documentForm!: FormGroup;

   loadedFile: any;

   @Input() message?: string;
   @Input() documentType?: any;

   readonly #modal = inject(NzModalRef);
   readonly nzModalData: any = inject(NZ_MODAL_DATA);

   ngAfterContentChecked (): void {}

   destroyModal (redirect: boolean, option: any = 0): void {
      this.#modal.destroy({ redirect, option });
   }

   constructor (private formBuilder: FormBuilder, private messageService: NzMessageService) {
      this.createForm();
   }

   //  Crea e Inicializa el formulario
   createForm () {
      this.documentForm = this.formBuilder.nonNullable.group({
         email: [ '' ],
         password: [ '' ]
      });
   }

   /**
    * Carga un archivo y lo envia al api de carga de documentos
    * @param event - evento del input que contiene el archivo para cargar
    * @param item - elemento de la lista para saber cual documento de carga ej (cedula, nit, rethus)
    */
   loadFile (event: any) {
      if (event.target.files.length > 0) {
         const file: FileList = event.target.files[0];

         this.loadedFile = file;

         console.log('loadedFile: ', this.loadedFile);
      }
   }

   //  Envia peticion al servicio de login para obtener el token de acceso
   submitRequest () {
      if (this.documentForm.invalid) {
         Object.values(this.documentForm.controls).forEach(control => {
            if (control.invalid) {
               control.markAsDirty();
               control.updateValueAndValidity({ onlySelf: true });
            }
         });
         return;
      }
      const { email, password } = this.documentForm.value;
      const payload: any = {
         email,
         contrasena: password
      };
   }
}
