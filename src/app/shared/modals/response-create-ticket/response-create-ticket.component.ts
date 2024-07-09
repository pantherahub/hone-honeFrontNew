import { Component, Input  } from '@angular/core';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from '../../../ng-zorro.module';

@Component({
  selector: 'app-response-create-ticket',
  standalone: true,
  imports: [NzModalModule, NgZorroModule],
  templateUrl: './response-create-ticket.component.html',
  styleUrl: './response-create-ticket.component.scss',
  
})
export class ResponseCreateTicketComponent {
  
  constructor(private modal: NzModalRef) {}

  close() {
    this.modal.destroy();
  }
}
