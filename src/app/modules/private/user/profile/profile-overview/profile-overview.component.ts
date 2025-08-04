import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserState } from 'src/app/models/user-state.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss'
})
export class ProfileOverviewComponent implements OnInit {

  loading: boolean = false;
  userData: UserState | null = null;
  identificationTypes: any[] = [];
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private authService: AuthService,
    private clientProviderService: ClientProviderService,
    private router: Router,
    private messageService: NzMessageService,
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.getIdentificationTypes();
    this.getUserData();
  }

  initializeForm() {
    this.form = this.fb.group({
      names: [null, [Validators.required]],
      lastNames: [null, [Validators.required]],
      idTypeDocument: [null, [Validators.required]],
      identification: [null, [Validators.required, this.formUtils.numeric]],
      birthDate: [null, [Validators.required]],
      phone1: [null, [Validators.required, this.formUtils.numeric, Validators.minLength(6), Validators.maxLength(15)]],
      phone2: [null, [this.formUtils.numeric, Validators.minLength(6), Validators.maxLength(15)]],
    });
  }

  disableFutureDates = (current: Date): boolean => {
    return current > new Date();
  }

  getIdentificationTypes() {
    this.clientProviderService.getIdentificationTypes().subscribe({
      next: (res: any) => {
        this.identificationTypes = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getUserData() {
    this.loading = true;
    this.authService.loadUser().subscribe({
      next: (resp: any) => {
        this.loading = false;
        const user = resp.data.User;
        this.userData = { // Optional
            idUser: user.idUser,
            names: user.names,
            lastNames: user.lastNames,
            fullName: `${user.names} ${user.lastNames}`,
            idTypeDocument: user.idTypeDocument,
            identification: user.identification,
            dv: user.dv,
            repsEnableCode: user.repsEnableCode,
            email: resp.data.email,
            avatar: user.avatar,
            birthDate: user.birthDate,
            phone1: user.phone1,
            phone2: user.phone2,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
        this.form.patchValue({
          names: user.names,
          lastNames: user.lastNames,
          idTypeDocument: user.idTypeDocument,
          identification: user.identification,
          birthDate: user.birthDate,
          phone1: user.phone1,
          phone2: user.phone2,
        });
        console.log("useData:", this.userData);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al cargar el usuario:', err);
        this.messageService.error('No se pudo cargar la información del usuario.');
        this.router.navigateByUrl('home');
      },
    });
  }

  updateUserData() {
    this.formUtils.trimFormStrControls(this.form);
    if (this.form.invalid) {
      this.formUtils.markFormTouched(this.form);
      return;
    }
    this.messageService.success('Información actualizada correctamente.');

    const birthDate = this.form.get('birthDate')?.value;
    this.form.patchValue({
      birthDate: `${format(birthDate, 'yyyy-MM-dd')}T00:00:00`
    });

    // const data = this.form.value;
    // this.clientProviderService.updateUserProfile(data).subscribe({
    //   next: () => {
    //     this.messageService.success('Información actualizada correctamente.');
    //     this.getUserData(); // Refrescar datos
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.messageService.error('Hubo un error al actualizar la información.');
    //   }
    // });
  }

}
