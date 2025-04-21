import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-disable-two-factor',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './disable-two-factor.component.html',
  styleUrl: './disable-two-factor.component.scss'
})
export class DisableTwoFactorComponent implements OnInit {

  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private messageService: NzMessageService,
    private modal: NzModalRef,
  ) { }

  ngOnInit() { }

  onCancel() {
    this.modal.close('cancel');
  }

  onSubmit() {
    // this.loading = true;
    this.messageService.success('Autenticación en dos pasos desactivada.');
    this.modal.close('success');
  }

}
