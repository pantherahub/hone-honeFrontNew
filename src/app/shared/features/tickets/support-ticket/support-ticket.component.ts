import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../../ui/buttons/button/button.component';
import { TextInputComponent } from '../../../ui/forms/text-input/text-input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { InputErrorComponent } from '../../../ui/forms/input-error/input-error.component';
import { Router } from '@angular/router';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { sanitizeString } from 'src/app/utils/string-utils';
import { AuthService } from 'src/app/services/auth.service';
import { REGEX_PATTERNS } from 'src/app/constants/regex-patterns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { FileDropDirective } from 'src/app/directives/file-drop.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { CreateTicketPayload, TicketRequestType } from 'src/app/interfaces/ticket.interface';
import { DrawerComponent } from '../../../ui/overlays/drawer/drawer.component';
import { IdentificationType } from 'src/app/interfaces/identification-type.interface';
import { SelectComponent } from '../../../ui/forms/select/select.component';
import { FileItemComponent } from 'src/app/shared/ui/display/file-item/file-item.component';
import { ClientProviderService } from 'src/app/services/client-provider/client-provider.service';
import { ClientInterface } from 'src/app/interfaces/client.interface';
import { Subject, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

const MAX_FILES = 10;

@Component({
  selector: 'app-support-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent, FileDropDirective, FileSelectDirective, PipesModule, SelectComponent, DrawerComponent, FileItemComponent],
  templateUrl: './support-ticket.component.html',
  styleUrl: './support-ticket.component.scss'
})
export class SupportTicketComponent implements OnInit, OnDestroy {

  ticketForm!: FormGroup;
  ticketSearchForm!: FormGroup;
  loading: boolean = false;
  loadingTicketSearch: boolean = false;
  maxFiles: number = MAX_FILES;

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  isLogged: boolean = false;

  identificationTypes: IdentificationType[] = [];
  requestTypes: TicketRequestType[] = [];
  clientList: ClientInterface[] = [];
  showClientSelect: boolean = false;

  private destroy$ = new Subject<void>();

  @ViewChild('ticketSearchDrawer') ticketSearchDrawer!: DrawerComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private formBuilder: FormBuilder,
    private formUtils: FormUtilsService,
    private router: Router,
    private eventManager: EventManagerService,
    private authService: AuthService,
    private ticketService: TicketService,
    private catalogService: CatalogService,
    private toastService: ToastService,
    private alertService: AlertService,
    private location: Location,
    private clientService: ClientProviderService,
  ) {
    this.isLogged = this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.createForm();
    this.createTicketSearchForm();

    this.getIdentificationTypes();
    this.getRequestTypes();

    if (this.isLogged) {
      this.getClientList();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.location.back();
  }

  goToTickets() {
    this.router.navigateByUrl('tickets');
  }

  getIdentificationTypes() {
    this.catalogService.getDocTypes().subscribe({
      next: (res: any) => {
        this.identificationTypes = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getRequestTypes() {
    if (this.isLogged) {
      this.ticketService.getRequestTypes().subscribe({
        next: (res: any) => {
          this.requestTypes = res.data;
          this.syncClientSelectVisibility();
        },
        error: (err: any) => {
          console.error(err);
        }
      });
      return;
    }

    // Request types for anonymous users (not logged in)
    this.requestTypes = [
      {
        idTiposolicitud: 15,
        nameSolicitud: 'Recuperación de contraseña',
        isTicket: true,
        withClient: false,
        isProvider: false
      },
      {
        idTiposolicitud: 24,
        nameSolicitud: 'PQRS',
        isTicket: true,
        withClient: false,
        isProvider: true
      }
    ];
  }

  /**
   * Gets the list of clients of the provider who logs in
   */
  getClientList() {
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: ClientInterface[]) => {
        this.clientList = [...res];
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  openTicketSearchDrawer() {
    this.ticketSearchForm.reset();
    this.ticketSearchDrawer.open();
  }

  createTicketSearchForm() {
    this.ticketSearchForm = this.formBuilder.nonNullable.group({
      identification: ['', [Validators.required, this.formUtils.numeric]],
      idTicket: ['', [Validators.required, this.formUtils.numeric]],
    });
  }

  searchTicket() {
    this.formUtils.trimFormStrControls(this.ticketSearchForm);
    if (this.ticketSearchForm.invalid) {
      this.formUtils.markFormTouched(this.ticketSearchForm);
      return;
    }

    const { identification, idTicket } = this.ticketSearchForm.value;
    const cleanIdentification = String(identification).trim();
    const ticketId = Number(idTicket);

    this.loadingTicketSearch = true;
    this.ticketService.getTicketByCreator(ticketId, cleanIdentification).subscribe({
      next: (res: any) => {
        this.loadingTicketSearch = false;
        const ticket = res?.data ?? null;

        if (!ticket?.idTickets) {
          this.alertService.error('Ups...', 'No encontramos un ticket con los datos ingresados.');
          return;
        }

        this.ticketSearchDrawer.close();
        this.router.navigate(['ticket', ticket.idTickets], {
          queryParams: {
            identification: cleanIdentification,
          },
        });
      },
      error: (err: any) => {
        this.loadingTicketSearch = false;
        if (err.status === 404) {
          this.alertService.error('Ups...', 'No encontramos un ticket con los datos ingresados.');
          return;
        }
        const msg = err.error?.message;
        this.alertService.error(
          'Ups...',
          msg || 'Lo sentimos, hubo un error en el servidor.'
        );
      }
    });
  }

  createForm() {
    const requiredIfAnonymous = this.isLogged ? [] : [Validators.required];
    const emailValidators = this.isLogged ? [] : [Validators.required, this.formUtils.email];
    const phoneValidators = this.isLogged
      ? []
      : [Validators.required, Validators.pattern(REGEX_PATTERNS.telNumberWithIndicative)];

    this.ticketForm = this.formBuilder.nonNullable.group({
      name: ['', requiredIfAnonymous],
      lastname: ['', requiredIfAnonymous],
      idTypeDocument: [null, requiredIfAnonymous],
      identification: ['', [...requiredIfAnonymous, this.formUtils.numeric]],
      email: ['', emailValidators],
      phone: ['', phoneValidators],
      idRequestType: [this.isLogged ? null : 15, [Validators.required]],
      idMessageClient: [null],
      requestName: ['', [Validators.required]],
      message: ['', [Validators.required]],
      files: [null],
    });

    this.syncRequestName();

    this.ticketForm.get('idRequestType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.syncClientSelectVisibility();
        this.syncRequestName();
      });
  }

  get isPasswordRecovery(): boolean {
    return Number(this.ticketForm.get('idRequestType')?.value) === 15;
  }

  private syncClientSelectVisibility(): void {
    const clientControl = this.ticketForm.get('idMessageClient');
    const selectedRequestType = this.getSelectedRequestType();
    this.showClientSelect = !!selectedRequestType?.withClient;

    if (this.showClientSelect) {
      clientControl?.setValidators([Validators.required]);
    } else {
      clientControl?.setValue(null, { emitEvent: false });
      clientControl?.clearValidators();
    }

    clientControl?.updateValueAndValidity({ emitEvent: false });
  }

  private syncRequestName(): void {
    const requestNameControl = this.ticketForm.get('requestName');
    const idRequestType = this.ticketForm.get('idRequestType')?.value;

    if (Number(idRequestType) === 15) {
      requestNameControl?.setValue('Recuperación de contraseña', { emitEvent: false });
      requestNameControl?.clearValidators();
    } else {
      requestNameControl?.setValue('', { emitEvent: false });
      requestNameControl?.setValidators([Validators.required]);
    }

    requestNameControl?.updateValueAndValidity({ emitEvent: false });
  }

  private getSelectedRequestType(): TicketRequestType | null {
    const selectedRequestTypeId = this.ticketForm.get('idRequestType')?.value;
    if (selectedRequestTypeId == null) return null;

    return this.requestTypes.find(requestType =>
      this.getRequestTypeId(requestType) === Number(selectedRequestTypeId)
    ) ?? null;
  }

  private getRequestTypeId(requestType: TicketRequestType): number {
    return requestType.idRequestType ?? requestType.idTiposolicitud;
  }

  get selectedFormFiles(): File[] | null {
    return this.ticketForm.get('files')?.value ?? null;
  }

  get selectedFiles(): File[] {
    const selectedFile = this.selectedFormFiles;
    if (!selectedFile) return [];

    const files = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
    return files;
  }

  updateFiles(files: File[] | null): void {
    this.ticketForm.patchValue({ files });
    this.ticketForm.get('files')?.markAsDirty();
    this.ticketForm.get('files')?.markAsTouched();

    if (!files && this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearFiles(): void {
    this.updateFiles(null);
  }

  onFileChange(file: File[] | null) {
    const newFiles = this.normalizeSelectedFiles(file);
    let finalFiles: File[] | null = newFiles;

    const filesControl = this.ticketForm.get('files');

    if (newFiles) {
      const currentFiles = Array.isArray(filesControl?.value)
        ? filesControl!.value
        : (filesControl?.value ? [filesControl.value] : []);
      finalFiles = [...currentFiles, ...newFiles];
    }

    if (this.exceedsFileLimit(finalFiles?.length ?? 0)) {
      this.alertService.showAlert({
        title: 'Límite de archivos excedido',
        message: `Puedes cargar hasta ${this.maxFiles} archivos.`,
        confirmBtnText: 'Aceptar',
        variant: 'warning',
      });
      return;
    }

    this.updateFiles(finalFiles);
  }

  removeFile(index: number) {
    const currentFiles = this.selectedFormFiles;
    if (!currentFiles) return;

    const filesArray = Array.isArray(currentFiles) ? currentFiles : [currentFiles];
    const updatedFiles = (filesArray as File[]).filter((_, i) => i !== index);

    this.updateFiles(updatedFiles.length ? updatedFiles : null);
  }

  private normalizeSelectedFiles(file: File[] | null): File[] | null {
    if (!file) return null;

    if (Array.isArray(file)) {
      return file.length ? file : null;
    }
    return [file];
  }

  private exceedsFileLimit(filesCount: number): boolean {
    return filesCount > this.maxFiles;
  }

  private hasValidFileLimit(): boolean {
    const exceedsLimit = this.exceedsFileLimit(this.selectedFiles.length);
    return !exceedsLimit;
  }

  private getMessageWithClientPrefix(message: string): string {
    if (!this.isLogged || !this.showClientSelect) return message;

    const idMessageClient = this.ticketForm.get('idMessageClient')?.value;
    const selectedClient = this.clientList.find(client =>
      Number(client.idClientHoneSolutions) === Number(idMessageClient)
    );

    if (!selectedClient?.clientHoneSolutions) return message;

    return `Aseguradora: ${selectedClient.clientHoneSolutions}\n${message}`;
  }

  onSubmit() {
    this.formUtils.trimFormStrControls(this.ticketForm);
    if (!this.hasValidFileLimit()) {
      return;
    }

    if (this.ticketForm.invalid) {
      this.formUtils.markFormTouched(this.ticketForm);
      return;
    }

    const {
      name,
      lastname,
      idTypeDocument,
      identification,
      email,
      phone,
      idRequestType,
      requestName,
      message,
    } = this.ticketForm.value;
    const messageWithClientPrefix = this.getMessageWithClientPrefix(message);

    const now = new Date();
    const idClientHone = 7; // Hone Solutions
    const idProviderManager = 4130; // Admin
    const maxDays = 2;
    const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Format YYYY-MM-DD

    let data: CreateTicketPayload;

    if (this.isLogged) {
      data = {
        createdBy: 'Provider',
        idProviderManager: idProviderManager,
        idProviderLogin: this.user.id,
        idProvider: this.user.id,
        idClientHoneSolutions: idClientHone,
        idRequestType,
        // requestName: 'Solicitud prestador',
        requestName: requestName,
        message: messageWithClientPrefix,
        dateMax: maxDate,
        archivo: this.selectedFormFiles || [],
      };
    } else {
      data = {
        createdBy: 'AnonimProvider',
        idProviderManager: idProviderManager,
        idClientHoneSolutions: idClientHone,
        idRequestType,
        // requestName: 'Ingreso erroneo prestador',
        requestName: requestName,
        message: message,
        dateMax: maxDate,
        dataCreator: {
          name: name,
          lastname: lastname,
          email: email,
          phone: phone,
          idTypeDocument: idTypeDocument,
          identification: identification,
        },
      };
    }

    const payload = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value == null) return;

      if (Array.isArray(value)) {
        value.forEach(fileItem => {
          if (fileItem instanceof File) {
            payload.append(key, fileItem, fileItem.name);
          }
        });
        return;
      }

      if (value instanceof File) {
        payload.append(key, value, value.name);
        return;
      }

      let formattedValue: string;
      if (typeof value === 'string') {
        formattedValue = value.trim();
        if (formattedValue === '') return;
      } else if (typeof value === 'object') {
        formattedValue = JSON.stringify(value);
      } else {
        formattedValue = String(value);
      }
      payload.append(key, formattedValue);
    });

    this.loading = true;
    this.ticketService.createTicket(payload).subscribe({
      next: (res: HttpResponse<any>) => {
        this.loading = false;
        const resBody = res.body ?? {};

        if (res.status === 200) {
          this.alertService.showAlert({
            title: '¡Solicitud recibida!',
            variant: 'success',
            message: resBody.message || 'Tu ticket ha sido enviado exitosamente. Estaremos revisando tu caso pronto.',
            isConfirmation: true,
            confirmBtnText: 'Aceptar',
            confirmBtnVariant: 'primary',
            cancelBtnText: null,
            showClose: false,
          }).subscribe(() => {
            if (this.isLogged) {
              this.router.navigate(['tickets']);
              return;
            }
            this.router.navigate(['login']);
          });
          return;
        }

        const ticketId = this.getCreatedTicketId(resBody);
        const ticketLabel = ticketId ? ` <b>#${ticketId}</b>` : '';
        this.alertService.showAlert({
          title: '¡Solicitud recibida!',
          variant: 'success',
          messageHTML: `Tu ticket${ticketLabel} ha sido enviado exitosamente. Estaremos revisando tu caso pronto.`,
          isConfirmation: true,
          confirmBtnText: 'Ver ticket',
          confirmBtnVariant: 'primary',
          cancelBtnText: 'Cerrar',
          showClose: false,
        }).subscribe((seeTicket) => {
          if (!seeTicket || !ticketId) return;

          if (this.isLogged) {
            this.router.navigate(['tickets', ticketId]);
            return;
          }

          this.router.navigate(['ticket', ticketId], {
            queryParams: {
              identification,
            },
          });
        });
        this.ticketForm.reset();
      },
      error: (err: any) => {
        this.loading = false;
        const msg = err.error?.message;
        this.alertService.error(
          'Ups...',
          msg || 'Lo sentimos, hubo un error en el servidor.'
        );
      }
    });
  }

  private getCreatedTicketId(res: any): number | string | null {
    const ticket = res?.data ?? null;
    return ticket?.idTickets ?? null;
  }

}
