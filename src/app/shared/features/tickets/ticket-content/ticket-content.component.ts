import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, finalize, firstValueFrom, interval, Subscription, switchMap, tap } from 'rxjs';
import { FileDropDirective } from 'src/app/directives/file-drop.directive';
import { FileSelectDirective } from 'src/app/directives/file-select.directive';
import { DeleteTicketMessagePayload, MessageFilters, MessageStatus, Ticket, TicketMessage, TicketMessagePayload, UpdateTicketMessagePayload } from 'src/app/interfaces/ticket.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ButtonComponent } from 'src/app/shared/ui/buttons/button/button.component';
import { FileItemComponent } from 'src/app/shared/ui/display/file-item/file-item.component';
import { HtmlRendererComponent } from 'src/app/shared/ui/display/html-renderer/html-renderer.component';
import { InputErrorComponent } from 'src/app/shared/ui/forms/input-error/input-error.component';
import { LoaderComponent } from 'src/app/shared/ui/feedback/loader/loader.component';
import { TextInputComponent } from 'src/app/shared/ui/forms/text-input/text-input.component';
import { TooltipComponent } from 'src/app/shared/ui/overlays/tooltip/tooltip.component';
import { FileViewerComponent } from 'src/app/shared/overlays/modals/file-viewer/file-viewer.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';
import { StoredFile } from 'src/app/interfaces/file.interface';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { BackendErrorsComponent } from '../../../ui/feedback/backend-errors/backend-errors.component';
import { AlertComponent } from 'src/app/shared/ui/feedback/alert/alert.component';
import { DropdownTriggerDirective } from "src/app/directives/dropdown-trigger.directive";

type TicketType = 'default' | 'contract' | 'rates';

interface TicketTypeConfig {
  uploadLabel: string;
  uploadPluralLabel: string;
  downloadLabel: string;
  allowsMultipleFiles: boolean;
  showContractInfo: boolean;
  allowedExtensions?: string[];
  maxFiles?: number;
}

interface SelectedFilePreview {
  name: string;
  size: number;
}

type TicketFormFile = File[] | SelectedFilePreview[] | null;

const MAX_FILES = 10;
const MESSAGE_FILES_PREVIEW_LIMIT = 3;

const TICKET_TYPE_BY_ID: Partial<Record<number, TicketType>> = {
  23: 'contract',
};

const TICKET_CONFIG: Record<TicketType, TicketTypeConfig> = {
  default: {
    uploadLabel: 'archivo',
    uploadPluralLabel: 'archivos',
    downloadLabel: 'archivo',
    allowsMultipleFiles: true,
    showContractInfo: false,
    maxFiles: MAX_FILES,
  },
  contract: {
    uploadLabel: 'contrato firmado',
    uploadPluralLabel: 'contratos firmados',
    downloadLabel: 'contrato',
    allowsMultipleFiles: false,
    // allowsMultipleFiles: true,
    showContractInfo: true,
    allowedExtensions: ['.pdf'],
  },
  rates: {
    uploadLabel: 'tarifa',
    uploadPluralLabel: 'tarifas',
    downloadLabel: 'archivo',
    allowsMultipleFiles: true,
    showContractInfo: false,
    maxFiles: MAX_FILES,
  },
};

export const TICKET_STATUS_CONFIG: Record<string, BadgeConfig> = {
  'GESTIONADO': {
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    icon: 'check',
    label: 'Gestionado'
  },
  'RECHAZADO': {
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    icon: 'close',
    label: 'Rechazado'
  },
  'EN TRAMITE': {
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    icon: 'clock',
    label: 'En tramite'
  },
  'PENDIENTE': {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-900',
    icon: 'cloud-arrow-up',
    label: 'Pendiente'
  },
};

@Component({
  selector: 'app-ticket-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TextInputComponent,
    InputErrorComponent,
    LoaderComponent,
    TooltipComponent,
    BackendErrorsComponent,
    FileSelectDirective,
    FileDropDirective,
    PipesModule,
    HtmlRendererComponent,
    AlertComponent,
    FileItemComponent,
    DropdownTriggerDirective
],
  templateUrl: './ticket-content.component.html',
  styleUrl: './ticket-content.component.scss'
})
export class TicketContentComponent implements OnInit, OnChanges, OnDestroy {

  @Input() statusConfig: Record<string, BadgeConfig> = TICKET_STATUS_CONFIG;
  @Input() autoLoad: boolean = true;
  @Input() creatorIdentification: string | null = null;
  @Output() refreshList = new EventEmitter<void>();
  @Output() ticketChange = new EventEmitter<Ticket | null>();
  @Output() loadError = new EventEmitter<any>();

  user = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();
  isLogged: boolean = false;
  loading: boolean = false;

  @Input() idTicket: number | null = null;
  ticket: Ticket | null = null;
  ticketConfig: TicketTypeConfig = TICKET_CONFIG.default;
  showContractInfo: boolean = false;
  uploadFileLabel: string = TICKET_CONFIG.default.uploadPluralLabel;
  maxFiles: number | undefined = TICKET_CONFIG.default.maxFiles;
  uploadAllowedExtensions: string[] = [];

  messageList: TicketMessage[] = [];
  currentMsgPage: number = 1;
  meesagePageSize: number = 3;
  totalMsgPages: number = 0;
  loadingMessages: boolean = false;

  lastSeenDocumentMessageId: number | null = null;

  lastMsg: TicketMessage | null = null;
  initMsg: TicketMessage | null = null;
  closedMsg: TicketMessage | null = null;
  isGhostFormatButton: boolean = false;

  form!: FormGroup;
  backendError: any = null;

  editingMessageId: number | null = null;
  expandedMessageFiles = new Set<number>();

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
      label: 'Desaprobado'
    },
    'In process': {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      icon: 'clock',
      label: 'Pendiente'
    },
  };

  hasLoadError: boolean = false;

  private refreshSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private eventManager: EventManagerService,
    private ticketService: TicketService,
    private alertService: AlertService,
    private toastService: ToastService,
    private modalService: ModalService,
    private formUtils: FormUtilsService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLogged = this.authService.isAuthenticated();
    this.initForm();
    if (this.autoLoad && this.idTicket) {
      this.open(this.idTicket);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form || !this.autoLoad) return;

    if ((changes['idTicket'] || changes['creatorIdentification']) && this.idTicket) {
      this.open(this.idTicket);
    }
  }

  ngOnDestroy(): void {
    this.stopRefreshTimer();
  }

  open(idTicket: number) {
    this.setTicket(null);
    this.idTicket = idTicket;
    this.resetForm();

    // Reset internal state to avoid stale data from previous tickets
    this.lastSeenDocumentMessageId = null;
    this.editingMessageId = null;
    this.messageList = [];
    this.currentMsgPage = 1;
    this.totalMsgPages = 0;
    this.loadingMessages = false;
    this.expandedMessageFiles.clear();
    this.lastMsg = null;
    this.initMsg = null;
    this.closedMsg = null;
    this.isGhostFormatButton = false;
    this.backendError = null;
    this.hasLoadError = false;

    // Refresh validations such as the edit message button
    if (!this.refreshSubscription) {
      this.refreshSubscription = interval(15000).subscribe(() => {
        this.cd.markForCheck();
        // console.log('Refreshing...');
      });
    }

    this.getTicket();
  }

  close() {
    this.backendError = null;
  }

  handleContainerClose() {
    this.refreshTicketList();
    this.stopRefreshTimer();
  }

  stopRefreshTimer() {
    this.refreshSubscription?.unsubscribe();
    this.refreshSubscription = undefined;
  }

  async canClose(): Promise<boolean> {
    if (this.form.get('message')?.value || this.selectedFormFiles) {
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

  getTicket() {
    if (!this.idTicket || (!this.isLogged && !this.creatorIdentification)) return;

    this.loading = true;
    const request$ = !this.isLogged
      ? this.ticketService.getTicketByCreator(this.idTicket, this.creatorIdentification!)
      : this.ticketService.getTicketById(this.idTicket);

    request$.subscribe({
      next: (res: any) => {
        const ticketData = res?.data ?? null;
        this.setTicket(ticketData);
        if (!this.ticket) {
          this.loading = false;
          this.hasLoadError = true;
          this.toastService.error('Algo salió mal.');
          this.loadError.emit(res);
          // Do not close automatically to allow fallback UI
          return;
        }

        // this.loading = false;
        this.refreshMessageLogic();
        this.markMessagesViewed();
        this.refreshMessages();
      },
      error: (err: any) => {
        this.loading = false;
        this.hasLoadError = true;
        if (err.status === 404) {
          this.toastService.error('Solicitud no localizada.');
        } else {
          this.toastService.error('Algo salió mal.');
          console.error(err);
        }
        this.loadError.emit(err);
      }
    });
  }

  markMessagesViewed() {
    if (!this.ticket || !this.isLogged || !this.user.id) return;
    this.ticketService.markMessagesViewed(
      this.ticket.idTickets,
      this.user.id
    ).subscribe({
      error: (err) => {
        if (err.status !== 404) {
          console.error('Error al marcar visto:', err);
        }
      }
    });
  }

  loadMessages(isRefresh: boolean = false) {
    if (this.loadingMessages || !this.ticket || (
      this.totalMsgPages > 0 && this.currentMsgPage > this.totalMsgPages)
    ) return;

    const payload: MessageFilters = {
      type: 'Message',
      page: this.currentMsgPage,
      limit: this.meesagePageSize,
    };
    if (isRefresh) this.loading = true;
    this.loadingMessages = true;
    this.ticketService.getMessagesByTicket(this.ticket.idTickets, payload).subscribe({
      next: (res: any) => {
        this.currentMsgPage = res.currentPage;
        this.totalMsgPages = res.totalPages;

        this.messageList = [...this.messageList, ...res.data];
        this.refreshMessageLogic();
        this.loadingMessages = false;
        if (isRefresh) this.loading = false;
      },
      error: (err: any) => {
        const errorData = err.error;
        if (err.status === 404) {
          this.clearMessages();
          this.refreshMessageLogic();
          // if (err.status === 404 && errorData) {
          //   this.messageList = errorData.data;
          //   this.currentMsgPage = errorData.currentPage;
          //   this.totalMsgPages = errorData.totalItems;
          // } else {
        } else {
          console.error(err);
        }
        this.loadingMessages = false;
        if (isRefresh) this.loading = false;
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
    this.loadMessages(true);
  }

  nextMessagesPage() {
    this.currentMsgPage++;
    this.loadMessages();
  }

  private refreshMessageLogic(): void {
    const messages = this.ticket?.Messages || [];

    // Get fixed messages
    this.initMsg = messages.find(
      (msg: TicketMessage) => msg.type === 'Init'
    ) ?? null;
    this.closedMsg = messages.find(
      (msg: TicketMessage) => msg.type === 'Closed'
    ) ?? null;

    // Get last message
    let last = this.closedMsg;
    if (!last && this.messageList?.length) {
      last = this.messageList[0];
    }
    this.lastMsg = last || this.initMsg;

    // Is ghost format button
    this.isGhostFormatButton = !!(
      !['Provider', 'AnonimProvider'].includes(this.lastMsg?.createdBy ?? '') &&
      this.lastMsg?.type !== 'Init' &&
      this.lastMsg?.Files?.length &&
      (this.lastMsg?.idMessage !== this.lastSeenDocumentMessageId)
    );
  }

  getTicketStatus(ticket: Ticket): string {
    const status = ticket.Status?.status;
    if (!status) return 'PENDIENTE';

    const config = this.statusConfig[status];
    if (!config) return 'EN TRAMITE';
    return status;
  }

  getMessageStatus(message: TicketMessage): MessageStatus {
    const status = message.MessageStatus?.name;
    if (!status) return 'In process';

    const config = this.msgStatusConfig[status];
    if (!config) return 'In process';
    return status;
  }

  getTicketManager(): any | null {
    const ticketProviders = this.ticket?.Managers;
    if (!ticketProviders || !Array.isArray(ticketProviders) || ticketProviders.length === 0) {
      return null;
    }
    return ticketProviders.find(prov => prov.TicketManager?.isActive) ?? null;
  }

  /* Message form methods */
  initForm() {
    this.form = this.fb.group({
      message: [null, Validators.required],
      files: [null],
    });
  }

  private setTicket(ticket: Ticket | null): void {
    this.ticket = ticket;
    this.ticketChange.emit(this.ticket);
    this.refreshTicketConfig();
  }

  private getProviderLoginId(): number | null {
    return this.clientSelected?.idProvider ?? this.user?.id ?? null;
  }

  get canSendProviderMessages(): boolean {
    return this.isLogged && !!this.getProviderLoginId();
  }

  private refreshTicketConfig(): void {
    const requestTypeId = this.ticket?.idTiposolicitud;
    const ticketType = requestTypeId
      ? TICKET_TYPE_BY_ID[requestTypeId] ?? 'default'
      : 'default';

    this.ticketConfig = TICKET_CONFIG[ticketType];

    const { allowsMultipleFiles, maxFiles, allowedExtensions } = this.ticketConfig;

    this.uploadAllowedExtensions = allowedExtensions ?? [];
    this.maxFiles = allowsMultipleFiles
      ? maxFiles ?? MAX_FILES
      : undefined;

    this.showContractInfo = this.ticketConfig.showContractInfo && !!this.ticket?.Contract;

    this.uploadFileLabel = allowsMultipleFiles
      ? this.ticketConfig.uploadPluralLabel
      : this.ticketConfig.uploadLabel;
  }

  get selectedFormFiles(): TicketFormFile {
    return this.form.get('files')?.value ?? null;
  }

  get selectedFiles(): SelectedFilePreview[] {
    const selectedFile = this.selectedFormFiles;
    if (!selectedFile) return [];

    const files = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
    return files.map(file => ({
      name: file.name,
      size: file.size,
    }));
  }

  updateFiles(files: File[] | null): void {
    this.form.patchValue({ files });
    const filesControl = this.form.get('files');
    filesControl?.markAsDirty();
    filesControl?.markAsTouched();

    const messageControl = this.form.get('message');
    if (files && files.length > 0) {
      messageControl?.clearValidators();
    } else {
      messageControl?.setValidators([Validators.required]);
    }
    messageControl?.updateValueAndValidity();
  }

  onFileChange(file: File | File[] | null) {
    const newFiles = this.normalizeSelectedFiles(file);
    let finalFiles: File[] | null = newFiles;

    const filesControl = this.form.get('files');

    if (this.ticketConfig.allowsMultipleFiles && newFiles) {
      const currentFiles = Array.isArray(filesControl?.value)
        ? filesControl!.value
        : (filesControl?.value ? [filesControl.value] : []);
      finalFiles = [...currentFiles, ...newFiles];
    }

    if (this.exceedsFileLimit(finalFiles?.length ?? 0)) {
      this.alertService.showAlert({
        title: 'Límite de archivos excedido',
        message: `Puedes cargar hasta ${this.maxFiles} ${this.uploadFileLabel}.`,
        confirmBtnText: 'Aceptar',
        variant: 'warning',
      });
      return;
    }

    this.updateFiles(finalFiles);
  }
  resetForm() {
    this.form.reset();
    const messageControl = this.form.get('message');
    messageControl?.setValidators([Validators.required]);
    messageControl?.updateValueAndValidity();
  }

  removeFile(index: number) {
    const currentFiles = this.selectedFormFiles;
    if (!currentFiles) return;

    const filesArray = Array.isArray(currentFiles) ? currentFiles : [currentFiles];
    const updatedFiles = (filesArray as File[]).filter((_, i) => i !== index);

    this.updateFiles(updatedFiles.length ? updatedFiles : null);
  }

  clearSelectedFiles(): void {
    this.updateFiles(null);
  }

  private normalizeSelectedFiles(file: File | File[] | null): File[] | null {
    if (!file) return null;

    if (Array.isArray(file)) {
      if (!file.length) return null;
      return file;
    }
    return [file];
  }

  private exceedsFileLimit(filesCount: number): boolean {
    return !!this.maxFiles && filesCount > this.maxFiles;
  }

  private hasValidFileLimit(): boolean {
    const exceedsLimit = this.exceedsFileLimit(this.selectedFiles.length);
    return !exceedsLimit;
  }

  get isClosedTicket(): boolean {
    const ticketStatus = this.ticket?.Status;
    if (!ticketStatus) return false;
    return ticketStatus.isClosed;
  }

  /* Message badges and actions validations */
  hasMessageActions(msg: TicketMessage, lastMsg: TicketMessage): boolean {
    return (
      this.lastMessageReceived(msg, lastMsg) ||
      this.hasDisplayableStatus(msg) ||
      this.canModifyMessage(msg, lastMsg)
    );
  }
  lastMessageReceived(msg: TicketMessage, lastMsg: TicketMessage): boolean {
    return lastMsg?.idMessage === msg.idMessage && msg.createdBy !== 'Provider';
  }
  hasDisplayableStatus(msg: TicketMessage): boolean {
    return !!this.msgStatusConfig[this.getMessageStatus(msg)] &&
      msg.createdBy === 'Provider';
  }
  canModifyMessage(msg: TicketMessage, lastMsg: TicketMessage): boolean {
    return (
      this.canSendProviderMessages &&
      lastMsg?.idMessage === msg.idMessage &&
      msg.type !== 'Closed' &&
      msg.createdBy === 'Provider' &&
      this.editingMessageId !== msg.idMessage &&
      !msg.isViewedByHone &&
      this.isMessageEditWindowOpen(msg.createdAt)
    );
  }

  isMessageEditWindowOpen(createdAt: string | Date): boolean {
    if (!createdAt) return false;

    const createdDate = new Date(createdAt).getTime();
    const now = new Date().getTime();

    const minutesAllowed = 15;
    const minutesInMs = minutesAllowed * 60 * 1000;

    return (now - createdDate) < minutesInMs;
  }

  getMessageFiles(messageObj: TicketMessage): StoredFile[] {
    return messageObj?.Files?.filter(file => !!file?.url) ?? [];
  }

  getVisibleMessageFiles(messageObj: TicketMessage): StoredFile[] {
    const files = this.getMessageFiles(messageObj);
    if (this.isMessageFilesExpanded(messageObj)) return files;
    return files.slice(0, MESSAGE_FILES_PREVIEW_LIMIT);
  }

  hasHiddenMessageFiles(messageObj: TicketMessage): boolean {
    return this.getMessageFiles(messageObj).length > MESSAGE_FILES_PREVIEW_LIMIT;
  }

  isMessageFilesExpanded(messageObj: TicketMessage): boolean {
    return this.expandedMessageFiles.has(messageObj.idMessage);
  }

  getMessageFilesToggleLabel(messageObj: TicketMessage): string {
    return this.isMessageFilesExpanded(messageObj)
      ? 'Ver menos'
      : 'Ver todos los archivos';
  }

  toggleMessageFiles(messageObj: TicketMessage): void {
    if (this.isMessageFilesExpanded(messageObj)) {
      this.expandedMessageFiles.delete(messageObj.idMessage);
      return;
    }

    this.expandedMessageFiles.add(messageObj.idMessage);
  }

  getMessageFile(messageObj: TicketMessage): StoredFile | null {
    const file = this.getMessageFiles(messageObj)[0];
    if (!file || !file.url) return null;
    return file;
  }

  downloadFile(messageObj: TicketMessage, selectedFile?: StoredFile) {
    const file = selectedFile ?? this.getMessageFile(messageObj);
    if (!file || !file.url) return;

    if (messageObj.type === 'Closed') {
      this.lastSeenDocumentMessageId = messageObj.idMessage;
    }

    window.open(file.url, '_blank');
  }

  viewFile(messageObj: TicketMessage, selectedFile?: StoredFile) {
    const file = selectedFile ?? this.getMessageFile(messageObj);
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

  refreshTicketList() {
    this.refreshList.emit();
  }

  editMessage(msg: TicketMessage) {
    this.editingMessageId = msg.idMessage;
    this.backendError = null;

    const messageControl = this.form.get('message');
    const filesData = this.getMessageFiles(msg);
    let files: SelectedFilePreview[] | null = null;
    if (filesData.length) {
      files = filesData.map(fileData => ({
        name: fileData.nameOriginal,
        size: fileData.size,
      }));
      messageControl?.clearValidators();
      messageControl?.updateValueAndValidity();
    }

    this.form.patchValue({
      message: msg.message,
      files,
    });
  }

  closeEditingMessage() {
    this.editingMessageId = null;
    this.resetForm();
  }

  submitMessage(isNew: boolean) {
    this.backendError = null;
    this.formUtils.trimFormStrControls(this.form);
    if (!this.hasValidFileLimit()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (isNew) this.createMessage();
    else this.updateMessage();
  }

  updateMessage() {
    if (!this.editingMessageId) {
      this.closeEditingMessage();
      return;
    }

    const idProvider = this.getProviderLoginId();
    if (!idProvider) {
      this.alertService.error('Ups...', 'Debes iniciar sesion para responder este ticket.');
      return;
    }

    const { message } = this.form.value;
    const payload: UpdateTicketMessagePayload = {
      message: message || 'Archivo subido.',
      createdIn: 'Provider',
      idProviderLogin: idProvider,
    };

    this.loading = true;
    this.ticketService.updateTicketMessage(this.editingMessageId, payload).subscribe({
      next: (res) => {
        this.getTicket();
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
          this.getTicket();
          return;
        }
        console.error(err);
        this.alertService.error();
      }
    });
  }

  createMessage() {
    if (!this.ticket) return;

    const idProvider = this.getProviderLoginId();
    if (!idProvider) {
      this.alertService.error('Ups...', 'Debes iniciar sesion para responder este ticket.');
      return;
    }

    const { message, files } = this.form.value;
    const selectedFilesCount = this.selectedFiles.length;

    const inProcessStatusId = 1;

    const rawData: TicketMessagePayload = {
      message: message || (selectedFilesCount > 1 ? 'Archivos subidos.' : 'Archivo subido.'),
      archivo: files,
      idProviderLogin: idProvider,
      idMessageStatus: inProcessStatusId,
      createdIn: 'Provider',
      createdBy: 'Provider',
    };

    const payload = new FormData();
    Object.entries(rawData).forEach(([key, value]) => {
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
      } else {
        formattedValue = String(value);
      }
      payload.append(key, formattedValue);
    });

    this.loading = true;
    this.ticketService.sendMessageByTicket(this.ticket.idTickets, payload).subscribe({
      next: (res) => {
        // this.ticket = res.data;
        // this.refreshTicketList();
        this.getTicket();
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

  deleteMessage(idMessage: number) {
    const idProvider = this.getProviderLoginId();
    if (!idProvider) {
      this.alertService.error('Ups...', 'Debes iniciar sesion para responder este ticket.');
      return;
    }

    const payload: DeleteTicketMessagePayload = {
      createdIn: 'Provider',
      idProviderLogin: idProvider,
    };

    this.alertService.confirmDelete(
      '¿Estas seguro de eliminar el mensaje?',
      'En caso de eliminarlo se perderá y no podrá recuperarse'
    ).pipe(
      filter(confirmed => confirmed),
      tap(() => this.loading = true),
      switchMap(() =>
        this.ticketService.deleteTicketMessage(idMessage, payload)
      ),
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.getTicket();
        this.alertService.success(
          '¡Mensaje eliminado!',
          'Se ha eliminado exitosamente.'
        );
      },
      error: (err) => {
        const errorData = err.error;

        if (err.status === 400 && errorData?.message) {
          this.alertService.error('Ups...', errorData.message);
          this.getTicket();
          return;
        }

        console.error(err);
        this.alertService.error();
      }
    });
  }

}
