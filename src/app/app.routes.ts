import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/private/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './modules/public/page-not-found/page-not-found.component';
import { ListDocumentsComponent } from './modules/private/documents/list-documents/list-documents.component';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './views/admin-layout/admin-layout.component';
import { ComplianceDocumentationComponent } from './modules/private/documents/compliance-documentation/compliance-documentation.component';
import { ProviderAssistancessComponent } from './modules/public/provider-assistancess/provider-assistancess.component';
import { UpdateDataComponent } from './modules/private/update-data/update-data.component';
import { UserManagementComponent } from './modules/private/user/user-management/user-management.component';
import { UpdatePasswordComponent } from './modules/private/user/update-password/update-password.component';
import { ResetPasswordComponent } from './modules/private/user/reset-password/reset-password.component';
import { authStatusGuard } from './guards/auth-status.guard';
import { VerifyEmailComponent } from './modules/private/user/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './modules/public/forgot-password/forgot-password.component';

export const routes: Routes = [
  //   PUBLIC ROUTES
  {
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
  },
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'page-not-found',
		component: PageNotFoundComponent
	},
	{
		path: 'page-form-assistance',
		component: ProviderAssistancessComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent
  },
  {
    path: 'reset-password',
    canActivate: [authGuard],
    component: ResetPasswordComponent
  },

	//   PRIVATE ROUTES
	{
		path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, authStatusGuard],
		children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'update-data',
        component: UpdateDataComponent
      },
      {
        path: 'user-management',
        component: UserManagementComponent
      },
      {
        path: 'update-password',
        component: UpdatePasswordComponent
      },
      {
        path: 'cargar-documentos/:id',
        component: ListDocumentsComponent
      },
			{
        path: 'cumplimiento-documentos/:id',
        component: ComplianceDocumentationComponent
			}
		]
  },

	//   DEFAULT ROUTES
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: 'home'
	},
	// {
	// 	path: '**',
	// 	pathMatch: 'full',
	// 	redirectTo: 'page-not-found'
	// },
	// {
	// 	path: '**',
	// 	pathMatch: 'full',
	// 	redirectTo: 'page-form-assistance'
	// }
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
