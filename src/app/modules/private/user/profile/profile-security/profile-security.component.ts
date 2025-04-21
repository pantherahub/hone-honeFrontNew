import { CommonModule } from '@angular/common';
import { Component, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthInfo } from 'src/app/models/auth.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';
import { UpdatePasswordComponent } from '../../modals/update-password/update-password.component';
import { UpdateEmailComponent } from '../../modals/update-email/update-email.component';
import { DisableTwoFactorComponent } from '../../modals/disable-two-factor/disable-two-factor.component';
import { EnableTwoFactorComponent } from '../../modals/enable-two-factor/enable-two-factor.component';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './profile-security.component.html',
  styleUrl: './profile-security.component.scss'
})
export class ProfileSecurityComponent implements OnInit {

  loading: boolean = false;
  authData: AuthInfo | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: NzMessageService,
    private modal: NzModalService,
  ) { }

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    this.loading = true;
    this.authService.loadUser().subscribe({
      next: (resp: any) => {
        this.loading = false;
        const user = resp.data.User;
        this.authData = {
          with2FA: resp.data.with2FA
        };
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al cargar el usuario:', err);
        this.messageService.error('No se pudo cargar la información del usuario.');
        this.router.navigateByUrl('home');
      },
    });
  }

  openChangePasswordModal() {
    let with2FA = false;
    if (this.authData) with2FA = this.authData.with2FA;
    this.authService.openAuthModal(with2FA).subscribe(result => {
      if (result !== 'success') return;
      const modalRef = this.modal.create({
        nzContent: UpdatePasswordComponent,
        nzFooter: null,
      });

      modalRef.afterClose.subscribe((result: 'success' | 'cancel') => {
        if (result === 'success') {
        }
      });
    });
  }

  openUpdateEmailModal() {
    let with2FA = false;
    if (this.authData) with2FA = this.authData.with2FA;
    this.authService.openAuthModal(with2FA).subscribe(result => {
      if (result !== 'success') return;
      const modalRef = this.modal.create({
        nzContent: UpdateEmailComponent,
        nzFooter: null,
      });

      modalRef.afterClose.subscribe((result: 'success' | 'cancel') => {
        if (result === 'success') {
          this.router.navigateByUrl('verify-email');
        }
      });
    });
  }

  openToggle2FAModal() {
    let with2FA = false;
    if (this.authData) with2FA = this.authData.with2FA;
    this.authService.openAuthModal(with2FA).subscribe(result => {
      if (result !== 'success') return;
      const componentToRender: Type<any> = with2FA
        ? DisableTwoFactorComponent
        : EnableTwoFactorComponent;
      const modalRef = this.modal.create({
        nzContent: componentToRender,
        nzFooter: null,
      });

      modalRef.afterClose.subscribe((result: 'success' | 'cancel') => {
        if (result === 'success') {
        }
      });
    });
  }

}
