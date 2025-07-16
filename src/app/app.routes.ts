import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/private/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './modules/public/page-not-found/page-not-found.component';
import { ListDocumentsComponent } from './modules/private/documents/list-documents/list-documents.component';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './views/admin-layout/admin-layout.component';
import { ProviderAssistancessComponent } from './modules/public/provider-assistancess/provider-assistancess.component';
import { UpdateDataComponent } from './modules/private/update-data/update-data.component';
import { canDeactivateGuard } from './guards/can-deactivate.guard';

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

	//   PRIVATE ROUTES
	{
		path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
		children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'update-data',
        component: UpdateDataComponent,
        canDeactivate: [canDeactivateGuard]
      },
      {
        path: 'cargar-documentos/:id',
        component: ListDocumentsComponent
      },
		]
  },

	//   DEFAULT ROUTES
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: 'page-not-found'
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: 'page-form-assistance'
	}
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
