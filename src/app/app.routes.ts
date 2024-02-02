import { Routes } from '@angular/router';
import { HomeComponent } from './modules/private/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './modules/public/page-not-found/page-not-found.component';
import { ListDocumentsComponent } from './modules/private/documents/list-documents/list-documents.component';

export const routes: Routes = [
   //   PRIVATE ROUTES
   {
      path: 'home',
      component: HomeComponent,
      canActivate: [ authGuard ]
   },
   {
      path: 'cargar-documentos/:id',
      component: ListDocumentsComponent,
      canActivate: [ authGuard ]
   },
   //   PUBLIC ROUTES
   {
      path: 'login',
      component: LoginComponent
   },
   {
      path: 'page-not-found',
      component: PageNotFoundComponent
   },
   //   DEFAULT ROUTES
   {
      path: '',
      redirectTo: 'login',
      pathMatch: 'full'
   },
   {
      path: '**',
      pathMatch: 'full',
      redirectTo: 'page-not-found'
   },
];
