import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ContractService } from 'src/app/services/contract/contract.service';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DrawerComponent, ButtonComponent, TextInputComponent, InputErrorComponent, LoaderComponent],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.scss'
})
export class ContractManagementComponent {

  @Input() statusConfig!: Record<string, BadgeConfig>;
  @Output() refreshList = new EventEmitter<any>();

  clientSelected: any = this.eventManager.clientSelected();
  loading: boolean = false;
  contract: any = null;

  messagePerPage: number = 3;
  totalMessages: number = 0;
  currentMessagePage: number = 1;
  messageList: any[] = [];

  @ViewChild('contractDrawer') contractDrawer!: DrawerComponent;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
    private eventManager: EventManagerService,
    private contractService: ContractService,
    private ticketService: TicketService,
    private alertService: AlertService,
    private toastService: ToastService,
  ) { }

  open(idContract: number) {
    this.contract = null;
    this.contractDrawer.open();

    this.loading = true;
    this.contractService.getContractById(idContract).subscribe({
      next: (res: any) => {
        this.contract = res.data;
        this.getMessages(this.contract.idTicket);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastService.error('Algo salió mal.');
        this.close();
        console.error(err);
      }
    });
  }

  getMessages(idTicket: number) {
    const { idProvider } = this.clientSelected;
    const payload = {
      idProvider,
      type: 'Message',
      page: this.currentMessagePage,
      limit: this.messagePerPage,
    };
    this.ticketService.getMessagesByTicket(idTicket, payload).subscribe({
      next: (res: any) => {
        this.messageList = res.data;
        this.currentMessagePage = res.currentPage;
        this.totalMessages = res.totalItems;
        this.loading = false;
      },
      error: (err: any) => {
        const errorData = err.error;
        if (err.status === 404 && errorData) {
          this.messageList = errorData.data;
          this.currentMessagePage = errorData.currentPage;
          this.totalMessages = errorData.totalItems;
        } else {
          console.error(err);
        }
        this.loading = false;
      },
    });
  }

  refreshContractList() {
    this.refreshList.emit();
  }

  close() {
    this.contractDrawer.close();
  }

  onDrawerInternalClose() {
    this.refreshContractList();
  }

  editMessage() { }

  submitMessage() {
    // No cerrar el drawer aquí, solo enviar mensaje
    this.refreshContractList();
    this.alertService.success(
      '¡Enviado!',
      'Se ha enviado exitosamente. Estaremos revisando tu respuesta pronto.'
    );
  }

}
