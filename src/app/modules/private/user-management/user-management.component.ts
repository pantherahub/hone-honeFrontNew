import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {

  @ViewChild('passwordModalContent', { static: true }) passwordModal!: TemplateRef<any>;
  @ViewChild('userModalContent', { static: true }) userModal!: TemplateRef<any>;

  loading: boolean = false;
  users: any[] = [];

  page: number = 1;
  pageSize: number = 10;
  totalData: number = 0;
  loadingPage: boolean = false;

  passwordForm!: FormGroup;
  passwordModalRef!: NzModalRef;

  userForm!: FormGroup;
  userModalRef!: NzModalRef;
  selectedUserToUpdate: any = null;

  constructor(
    private location: Location,
    private alertService: AlertService,
    private modalService: NzModalService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.createChangePassowrdForm();
    this.createUserForm();
  }

  goBack(): void {
    this.location.back();
  }

  createChangePassowrdForm() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  createUserForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      identification: ['', Validators.required]
    });
  }

  loadData(): void {
    // this.loadingPage = true;
    // this.subscribe((res) => {
    //     this.listOfData = res.data;
    //     this.total = res.total;
    //     this.loadingPage = false;
    //   });
    this.users = [
      {
        name: "Testname1",
        email: "testname@gmail.com",
        identification: "12312312323"
      },
      {
        name: "Testname2",
        email: "testname@gmail.com",
        identification: "12312312323"
      }
    ];
    this.totalData = this.users.length;
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.page = pageIndex;
    this.pageSize = pageSize;
    this.loadData();
  }

  openPasswordModal() {
    this.passwordForm.reset();
    this.passwordModalRef = this.modalService.create({
      nzTitle: 'Cambiar Contraseña',
      nzContent: this.passwordModal,
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;
    this.alertService.success('Actualizada', 'Contraseña actualizada con éxito');
  }

  openUserModal(index: number | null = null) {
    if (index !== null) {
      this.selectedUserToUpdate = { ...this.users[index] };
      this.userForm.patchValue(this.selectedUserToUpdate);
    } else {
      this.selectedUserToUpdate = null;
      this.userForm.reset();
    }

    this.userModalRef = this.modalService.create({
      nzTitle: this.selectedUserToUpdate ? 'Actualizar Usuario' : 'Agregar Usuario',
      nzContent: this.userModal,
    });
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    if (this.selectedUserToUpdate) {
      const index = this.users.findIndex(user => user.email === this.selectedUserToUpdate.email);
      if (index !== -1) {
        this.users[index] = { ...this.userForm.value };
      }
    } else {
      this.users.push({ ...this.userForm.value });
    }
  }

  async deleteUser(index: number) {
    const confirmed = await this.alertService.confirmDelete(
      '¿Eliminar sede?',
      'Eliminar sede del listado'
    );
    if (!confirmed) return;
  }

}
