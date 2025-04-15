import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { of } from 'rxjs';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AlertService } from 'src/app/services/alerts/alert.service';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {

  @ViewChild('userModalContent', { static: false }) userModal!: TemplateRef<any>;

  loading: boolean = false;
  users: any[] = [];
  identificationTypes: any[] = [];

  page: number = 1;
  pageSize: number = 10;
  totalData: number = 0;
  loadingPage: boolean = false;

  userForm!: FormGroup;
  userModalRef!: NzModalRef;
  selectedUserToUpdate: any = null;
  defaultAvatar: string = "https://www.w3schools.com/howto/img_avatar.png";

  avatarUrl: string | null = null;

  constructor(
    private location: Location,
    private alertService: AlertService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private clientProviderService: ClientProviderService,
    private formUtils: FormUtilsService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getIdentificationTypes();
    this.loadData();
    this.createUserForm();
  }

  goBack(): void {
    this.location.back();
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

  /* Avatar */
  getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
  });
  beforeUpload = (file: NzUploadFile): boolean => {
    const fileObj = file as unknown as File;
    if (!fileObj || !fileObj.type.startsWith('image/')) {
      this.alertService.warning('Aviso', 'Solo se permiten imágenes.');
      return false;
    }
    this.getBase64(fileObj).then(base64 => {
      this.avatarUrl = base64 as string;
      this.userForm.patchValue({ avatar: this.avatarUrl });
    });
    return false; // Avoid automatic upload
  };
  customUpload = (item: NzUploadXHRArgs) => {
    // No auto-loading, just refresh the form
    return of(null).subscribe();
  };

  createUserForm() {
    this.userForm = this.fb.group({
      avatar: [null],
      names: ['', Validators.required],
      lastNames: ['', Validators.required],
      email: ['', [Validators.required, this.formUtils.emailValidator]],
      idTypeDocument: ['', [Validators.required]],
      identification: ['', [Validators.required, this.formUtils.numeric]],
      birthDate: [null],
      phone1: [null, [this.formUtils.numeric, Validators.minLength(6), Validators.maxLength(15)]],
      phone2: [null, [this.formUtils.numeric, Validators.minLength(6), Validators.maxLength(15)]],
    });
  }

  disableFutureDates = (current: Date): boolean => {
    return current > new Date();
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
        idTypeDocument: 1,
        identification: "12312312323",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        name: "Testname2",
        email: "testname@gmail.com",
        idTypeDocument: 2,
        identification: "12312312323",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg"
      },
      {
        name: "Testname3",
        email: "testname3@gmail.com",
        idTypeDocument: 2,
        identification: "12312231",
        // avatar: null
      },
    ];
    this.totalData = this.users.length;
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.page = pageIndex;
    this.pageSize = pageSize;
    this.loadData();
  }

  openUserModal(user: any | null = null) {
    this.avatarUrl = null;
    if (user != null) {
      this.selectedUserToUpdate = { ...user };
      this.userForm.patchValue(this.selectedUserToUpdate);
      this.avatarUrl = user.avatar || null;
    } else {
      this.selectedUserToUpdate = null;
      this.userForm.reset();
      // this.avatarUrl = this.defaultAvatar;
      // this.userForm.get('avatar')?.setValue(this.defaultAvatar);
    }

    this.userModalRef = this.modalService.create({
      nzTitle: this.selectedUserToUpdate ? 'Actualizar Usuario' : 'Agregar Usuario',
      nzCentered: true,
      nzContent: this.userModal,
    });
  }

  handleUploadChange(info: any): void {
    if (info.file.status === 'done') {
      this.userForm.patchValue({ avatar: info.file.thumbUrl });
    }
  }

  saveUser(): void {
    this.formUtils.trimFormStrControls(this.userForm);
    if (this.userForm.invalid) {
      this.formUtils.markFormTouched(this.userForm);
      return;
    }
    const birthDate = this.userForm.get('birthDate')?.value;
    if (birthDate) {
      this.userForm.patchValue({
        birthDate: `${format(birthDate, 'yyyy-MM-dd')}T00:00:00`
      });
    }

    this.loading = true;
    this.loading = false;

    if (this.selectedUserToUpdate) {
      const index = this.users.findIndex(user => user.email === this.selectedUserToUpdate.email);
      if (index !== -1) {
        this.users[index] = { ...this.userForm.value };
        // this.users[index].avatar = this.avatarUrl;
      }
    } else {
      this.users.push({ ...this.userForm.value });
    }
    this.userModalRef.destroy();
    this.loadData();
  }

  async deleteUser(user: any) {
    const confirmed = await this.alertService.confirmDelete(
      '¿Eliminar usuario?',
      'Eliminar usuario existente.'
    );
    if (!confirmed) return;

    this.loading = true;
    this.loading = false;
  }

}
