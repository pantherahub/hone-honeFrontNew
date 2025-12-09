import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/private/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './modules/public/page-not-found/page-not-found.component';
import { ListDocumentsComponent } from './modules/private/documents/list-documents/list-documents.component';
import { NgModule } from '@angular/core';
import { PrivateLayoutComponent } from './layouts/private-layout/private-layout.component';
import { UpdateDataComponent } from './modules/private/update-data/update-data.component';
import { UserManagementComponent } from './modules/private/user/user-management/user-management.component';
import { UpdatePasswordComponent } from './modules/private/user/modals/update-password/update-password.component';
import { ResetPasswordComponent } from './modules/private/user/reset-password/reset-password.component';
import { authStatusGuard } from './guards/auth-status.guard';
import { VerifyEmailComponent } from './modules/public/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './modules/public/forgot-password/forgot-password.component';
import { noauthGuard } from './guards/noauth.guard';
import { TwoFactorAuthComponent } from './modules/public/two-factor-auth/two-factor-auth.component';
import { twoFactorGuard } from './guards/two-factor.guard';
import { ValidatePasswordComponent } from './modules/private/user/validate-password/validate-password.component';
import { ProfileComponent } from './modules/private/user/profile/profile.component';
import { ProfileOverviewComponent } from './modules/private/user/profile/profile-overview/profile-overview.component';
import { ProfileSecurityComponent } from './modules/private/user/profile/profile-security/profile-security.component';
import { canDeactivateGuard } from './guards/can-deactivate.guard';
import { TestsComponent } from './modules/public/tests/tests.component';
import { SupportTicketComponent } from './shared/support-ticket/support-ticket.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { ServiceLayoutComponent } from './layouts/service-layout/service-layout.component';
import { clientSelectedGuard } from './guards/client-selected.guard';
import { RatesComponent } from './modules/private/rates/rates.component';
import { serviceAccessGuard } from './guards/service-access.guard';

export const routes: Routes = [
  //   PUBLIC ROUTES
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [noauthGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'auth-support',
        component: SupportTicketComponent
      }
    ]
  },

  {
    path: 'page-not-found',
    component: PageNotFoundComponent
  },
  // Tests
  // {
  //   path: 'test',
  //   component: TestsComponent
  // },

  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'verify-email',
    canActivate: [authStatusGuard],
    component: VerifyEmailComponent
  },
  {
    path: 'two-factor',
    canActivate: [authStatusGuard],
    component: TwoFactorAuthComponent
  },
  {
    path: 'reset-password',
    canActivate: [authGuard],
    component: ResetPasswordComponent
  },
  {
    path: 'validate-password',
    canActivate: [authGuard, authStatusGuard],
    component: ValidatePasswordComponent
  },

  // PRIVATE ROUTES
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [authGuard, authStatusGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'support',
        component: SupportTicketComponent
      },
      {
        path: 'update-data',
        component: UpdateDataComponent,
        canDeactivate: [canDeactivateGuard]
      },
      {
        path: 'profile',
        component: ProfileComponent,
        children: [
          { path: '', component: ProfileOverviewComponent },
          { path: 'security', component: ProfileSecurityComponent }
        ]
      },
      {
        path: 'user-management',
        canActivate: [twoFactorGuard],
        component: UserManagementComponent
      },
      {
        path: 'update-password',
        canActivate: [twoFactorGuard],
        component: UpdatePasswordComponent
      },
      {
        path: 'cargar-documentos/:id',
        component: ListDocumentsComponent
      },
      {
        path: 'service',
        component: ServiceLayoutComponent,
        canActivate: [clientSelectedGuard],
        children: [
          {
            path: 'documentation',
            component: ListDocumentsComponent,
            canActivate: [serviceAccessGuard],
          },
          // {
          //   path: 'rates',
          //   component: RatesComponent,
          //   canActivate: [serviceAccessGuard],
          // },
        ],
      },
		]
  },

  // DEFAULT ROUTES
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  // {
  //   path: '**',
  //   pathMatch: 'full',
  //   redirectTo: 'page-not-found'
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      /* Activa las anclas en angular */
      anchorScrolling: 'enabled',
      /* Restaura el scroll a la posición inicial */
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
