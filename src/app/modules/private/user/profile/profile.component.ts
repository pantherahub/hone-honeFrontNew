import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { filter } from 'rxjs';
import { UserState } from 'src/app/models/user-state.interface';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgZorroModule, CommonModule, RouterOutlet, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  loading: boolean = false;
  userData: UserState | null = null;

  selectedIndex = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    // private notificationService: NzNotificationService,
    private messageService: NzMessageService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const userState = this.authService.getUserData();
    if (userState && userState.user) {
      this.userData = userState.user;
    }

    // Initial module tab
    this.updateTabFromRoute();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTabFromRoute();
      });
  }

  updateTabFromRoute() {
    const path = this.route.snapshot.firstChild?.routeConfig?.path;
    if (path === 'security') {
      this.selectedIndex = 1;
    } else {
      this.selectedIndex = 0;
    }
  }

  refreshUserData() {
    this.authService.loadUser().subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.userData = resp.data.User;
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al cargar el usuario:', err);
        this.messageService.error('No se pudo cargar la información del usuario.');
        this.router.navigateByUrl('home');
      },
    });
  }

  updateAvatar() {
    // this.loading = true;
    // this.refreshUserData();
  }

  onTabChange(index: number): void {
    const base = this.route.snapshot.routeConfig?.path;
    if (index === 0) {
      this.router.navigate([`/${base}`]);
    } else if (index === 1) {
      this.router.navigate([`/${base}/security`]);
    }
  }

}
