import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { VerificationCodeFormComponent } from 'src/app/shared/forms/verification-code-form/verification-code-form.component';

@Component({
  selector: 'app-enable-two-factor',
  standalone: true,
  imports: [NgZorroModule, CommonModule, VerificationCodeFormComponent],
  templateUrl: './enable-two-factor.component.html',
  styleUrl: './enable-two-factor.component.scss'
})
export class EnableTwoFactorComponent implements OnInit {

  loading: boolean = false;
  qrCodeUrl: string = '';

  constructor(
    private authService: AuthService,
    private messageService: NzMessageService,
    private modal: NzModalRef,
  ) { }

  ngOnInit() {
    this.loadQrCode();
  }

  loadQrCode() {
    this.qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/TuApp:usuario@tuapp.com?secret=ABCDEF1234567890&issuer=TuApp&size=200x200';
  }

  onCancel() {
    this.modal.close('cancel');
  }

  onSubmit(code: string) {
    // const reqData = { code };
    // this.loading = true;
    this.messageService.success('Autenticación en dos pasos activada.');
    this.modal.close('success');
  }

}
