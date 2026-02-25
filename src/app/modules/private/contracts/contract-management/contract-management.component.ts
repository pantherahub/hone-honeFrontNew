import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { FileDropDirective } from 'src/app/directives/file-drop.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { MessageStatus, TicketMessagePayload } from 'src/app/interfaces/ticket.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ContractService } from 'src/app/services/contract/contract.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { BackendErrorsComponent } from 'src/app/shared/components/backend-errors/backend-errors.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { TooltipComponent } from 'src/app/shared/components/tooltip/tooltip.component';
import { FileViewerComponent } from 'src/app/shared/modals/file-viewer/file-viewer.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DrawerComponent,
    ButtonComponent,
    TextInputComponent,
    InputErrorComponent,
    LoaderComponent,
    TooltipComponent,
    BackendErrorsComponent,
    FileSelectDirective,
    FileDropDirective,
    PipesModule
  ],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.scss'
})
export class ContractManagementComponent implements OnInit, OnDestroy {

  @Input() statusConfig!: Record<string, BadgeConfig>;
  @Output() refreshList = new EventEmitter<any>();

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  loading: boolean = false;
  idContract: any = null;
  contract: any = null;

  messageList: any[] = [];
  currentMsgPage: number = 1;
  meesagePageSize: number = 3;
  totalMsgPages: number = 0;
  loadingMessages: boolean = false;

  lastSeenDocumentMessageId: number | null = null;

  form!: FormGroup;
  backendError: any = null;

  editingMessageId: number | null = null;

  msgStatusConfig: Record<string, BadgeConfig> = {
    'Approved': {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      icon: 'check',
      label: 'Aprobado'
    },
    'Disapproved': {
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
      icon: 'close',
      label: 'Anulado'
    },
    // 'In process': {
    //   bgClass: 'bg-blue-100',
    //   textClass: 'text-blue-800',
    //   icon: 'cloud-arrow-up',
    //   label: 'Pendiente'
    // },
  };

  private refreshSubscription?: Subscription;

  @ViewChild('contractDrawer') contractDrawer!: DrawerComponent;

  constructor(
    private fb: FormBuilder,
    private eventManager: EventManagerService,
    private contractService: ContractService,
    private ticketService: TicketService,
    private alertService: AlertService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  open(idContract: number) {
    this.contract = null;
    this.idContract = idContract;
    this.resetForm();

    // Refresh validations such as the edit message button
    if (!this.refreshSubscription) {
      this.refreshSubscription = interval(15000).subscribe(() => {
        this.cd.markForCheck();
        // console.log('Refreshing...');
      });
    }

    this.contractDrawer.open();

    this.getContract();
  }

  close() {
    this.backendError = null;
    this.contractDrawer.close();
  }

  onDrawerInternalClose() {
    this.refreshContractList();

    this.refreshSubscription?.unsubscribe();
    this.refreshSubscription = undefined;
  }

  async canClose(): Promise<boolean> {
    if (this.form.get('message')?.value || this.selectedFormFile) {
      const confirmed = await firstValueFrom(
        this.alertService.confirm(
          'Cambios sin guardar',
          'Tienes cambios pendientes. Si sales sin guardar, se perderán.',
          {
            confirmBtnText: 'Salir',
            cancelBtnText: 'Cancelar',
          }
        )
      );
      return confirmed;
    }
    return true;
  }

  getContract() {
    this.loading = true;
    this.contractService.getContractById(this.idContract).subscribe({
      next: (res: any) => {
        this.contract = res.data;
        this.loading = false;
        this.refreshMessages();
      },
      error: (err: any) => {
        this.loading = false;
        this.toastService.error('Algo salió mal.');
        this.close();
        console.error(err);
      }
    });
  }

  loadMessages() {
    if (this.loadingMessages || (
      this.totalMsgPages > 0 && this.currentMsgPage > this.totalMsgPages)
    ) return;

    const payload = {
      type: 'Message',
      showToProvider: true,
      page: this.currentMsgPage,
      limit: this.meesagePageSize,
    };
    this.loadingMessages = true;
    this.ticketService.getMessagesByTicket(this.contract.idTicket, payload).subscribe({
      next: (res: any) => {
        this.currentMsgPage = res.currentPage;
        this.totalMsgPages = res.totalPages;

        this.messageList = [...this.messageList, ...res.data];
        this.loadingMessages = false;
      },
      error: (err: any) => {
        const errorData = err.error;
        if (err.status === 404) {
          this.clearMessages();
        // if (err.status === 404 && errorData) {
        //   this.messageList = errorData.data;
        //   this.currentMsgPage = errorData.currentPage;
        //   this.totalMsgPages = errorData.totalItems;
        // } else {
        } else {
          console.error(err);
        }
        this.loadingMessages = false;
      },
    });
  }

  clearMessages() {
    this.messageList = [];
    this.currentMsgPage = 1;
    this.totalMsgPages = 0;
  }

  refreshMessages() {
    this.clearMessages();
    this.loadMessages();
  }

  nextMessagesPage() {
    this.currentMsgPage++;
    this.loadMessages();
  }

  getContractStatus(contract: any): string {
    const status = contract.Ticket?.Status?.status;
    if (!status) return 'PENDIENTE';

    const config = this.statusConfig[status];
    if (!config) return 'EN TRAMITE';
    return status;
  }

  getMessageStatus(message: any): MessageStatus {
    const status = message.MessageStatus?.name;
    if (!status) return 'In process';

    const config = this.statusConfig[status];
    if (!config) return 'In process';
    return status;
  }

  getTicketManager(): any | null {
    const ticketProviders = this.contract.Ticket?.Providers;
    if (!ticketProviders || !Array.isArray(ticketProviders) || ticketProviders.length === 0) {
      return null;
    }
    return ticketProviders.find(prov => prov.TicketManager?.isActive) ?? null;
  }

  getFixedMessage(type: 'Init' | 'Closed'): any | null {
    const messages = this.contract?.Ticket?.Messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return null;
    }

    return messages.find(msg => msg.type === type) ?? null;
  }

  getLastMessage(): any | null {
    let lastMsg = this.getFixedMessage('Closed');
    if (!lastMsg && this.messageList?.length) {
      lastMsg = this.messageList[0];
    }
    return lastMsg
  }

  getObservationsHtml(observations: string): SafeHtml {
    const isHtml = /<(?!\/?(iframe|strong)\b)[a-z][\s\S]*?>/i.test(observations);
    if (!isHtml) {
      observations = observations.replace(/(\r\n|\n|\r)/g, '<br>');
    }

    return this.sanitizer.bypassSecurityTrustHtml(
      observations
    );
  }

  get isGhostFormatButton(): boolean {
    const lastMsg = this.getLastMessage();
    return !!(
      lastMsg?.createdBy === 'HoneSolutions' &&
      lastMsg?.Files?.length &&
      (lastMsg?.idMessage !== this.lastSeenDocumentMessageId)
    );
  }

  /* Message form methods */
  initForm() {
    this.form = this.fb.group({
      message: [null, Validators.required],
      file: [null],
    });
  }
  get selectedFormFile() {
    return this.form.get('file')?.value;
  }
  onFileChange(file: File | null) {
    this.form.patchValue({ file: file });
    this.form.get('file')?.markAsDirty();
    this.form.get('file')?.markAsTouched();

    const messageControl = this.form.get('message');
    if (file) {
      messageControl?.clearValidators();
    } else {
      messageControl?.setValidators([Validators.required]);
    }
    messageControl?.updateValueAndValidity();
  }
  resetForm() {
    this.form.reset();
    const messageControl = this.form.get('message');
    messageControl?.setValidators([Validators.required]);
    messageControl?.updateValueAndValidity();
  }

  getMessageFile(messageObj: any): any | null {
    const file = messageObj?.Files?.[0];
    if (!file || !file.url) return null;
    return file;
  }

  downloadFile(messageObj: any) {
    const file = messageObj?.Files?.[0];
    if (!file || !file.url) return;

    if (messageObj.type === 'Closed') {
      this.lastSeenDocumentMessageId = messageObj.idMessage;
    }

    window.open(file.url, '_blank');
  }

  viewFile(messageObj: any) {
    const file = messageObj?.Files?.[0];
    if (!file || !file.url) return;

    if (messageObj.type === 'Closed') {
      this.lastSeenDocumentMessageId = messageObj.idMessage;
    }

    this.modalService.open(FileViewerComponent, {
      closable: true,
      customSize: 'max-w-[800px] !gap-2',
    }, {
      title: 'Documento',
      url: file.url,
    });
  }

  refreshContractList() {
    this.refreshList.emit();
  }

  canEdit(createdAt: string | Date): boolean {
    if (!createdAt) return false;

    const createdDate = new Date(createdAt).getTime();
    const now = new Date().getTime();

    const minutesAllowed = 15;
    const minutesInMs = minutesAllowed * 60 * 1000;

    return (now - createdDate) < minutesInMs;
  }

  editMessage(msg: any) {
    this.editingMessageId = msg.idMessage;
    this.backendError = null;

    const messageControl = this.form.get('message');
    const fileData = this.getMessageFile(msg);
    let file = null;
    if (fileData) {
      file = {
        name: fileData.nameOriginal,
        size: fileData.size,
      };
      messageControl?.clearValidators();
      messageControl?.updateValueAndValidity();
    }

    this.form.patchValue({
      message: msg.message,
      file,
    });
  }

  closeEditingMessage() {
    this.editingMessageId = null;
    this.resetForm();
  }

  submitMessage(isNew: boolean) {
    this.backendError = null;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (isNew) this.createMessage();
    else this.updateMessage();
  }

  updateMessage() {
    if (!this.editingMessageId) {
      this.closeEditingMessage();
      return;
    }

    const { message } = this.form.value;
    const payload: any = {
      message: message || 'Archivo subido.',
      createIn: 'Provider',
    };

    this.loading = true;
    this.ticketService.updateTicketMessage(this.editingMessageId, payload).subscribe({
      next: (res) => {
        this.getContract();
        this.resetForm();
        this.loading = false;
        this.alertService.success(
          '¡Actualizado!',
          'Se ha actualizado exitosamente. Estaremos revisando tu respuesta pronto.'
        );
        this.closeEditingMessage();
      },
      error: (err) => {
        this.loading = false;
        const errorData = err.error;
        if (err.status === 422) {
          this.backendError = err.error;
          return;
        } else if (err.status === 400 && errorData?.message) {
          this.alertService.error(
            'Ups...',
            errorData.message
          );
          this.getContract();
        }
        console.error(err);
        this.alertService.error();
      }
    });
  }

  createMessage() {
    const { idProvider } = this.clientSelected;
    const { message, file } = this.form.value;
    const managerEmail = this.getTicketManager().email;

    const inProcessStatusId = 1;

    const rawData: TicketMessagePayload = {
      message: message || 'Archivo subido.',
      archivo: file,
      idProviderLogin: idProvider,
      idMessageStatus: inProcessStatusId,
      sendEmail: true,
      email: managerEmail,
      showToClient: true,
      showToProvider: true,
      createIn: 'Provider',
      createdBy: 'Provider',
    };

    const payload = new FormData();
    Object.entries(rawData).forEach(([key, value]) => {
      if (value instanceof File) {
        payload.append(key, value, value.name);
      } else {
        payload.append(key, value.toString());
      }
    });

    this.loading = true;
    this.contractService.sendContractTicketMessage(this.contract.idContract, payload).subscribe({
      next: (res) => {
        this.contract = res.data;
        // this.refreshContractList();
        this.getContract();
        this.resetForm();
        this.loading = false;
        this.alertService.success(
          '¡Enviado!',
          'Se ha enviado exitosamente. Estaremos revisando tu respuesta pronto.'
        );
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.backendError = err.error;
          return;
        }
        console.error(err);
        this.alertService.error();
      }
    });
  }

}
