import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthInfo } from 'src/app/models/auth.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';

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
    public router: Router,
    private messageService: NzMessageService,
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

}
