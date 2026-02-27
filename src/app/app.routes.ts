import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/private/home/home.component';
import { LoginComponent } from './modules/public/login/login.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './modules/public/page-not-found/page-not-found.component';
import { DocumentsComponent } from './modules/private/documents/documents.component';
import { NgModule } from '@angular/core';
import { PrivateLayoutComponent } from './layout/private-layout/private-layout.component';
import { UpdateDataComponent } from './modules/private/update-data/update-data.component';
import { canDeactivateGuard } from './guards/can-deactivate.guard';
import { TestsComponent } from './modules/public/tests/tests.component';
import { SupportTicketComponent } from './shared/support-ticket/support-ticket.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { noauthGuard } from './guards/noauth.guard';
import { ServiceLayoutComponent } from './layout/service-layout/service-layout.component';
import { clientSelectedGuard } from './guards/client-selected.guard';
import { RatesComponent } from './modules/private/rates/rates.component';
import { serviceAccessGuard } from './guards/service-access.guard';
import { SERVICES_CONFIG } from './config/service-navigation.config';
import { ContractsComponent } from './modules/private/contracts/contracts.component';

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

  //   PRIVATE ROUTES
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        data: {
          disclaimerKey: 'Inicio',
        },
      },
      {
        path: 'support',
        component: SupportTicketComponent
      },
      {
        path: 'update-data',
        component: UpdateDataComponent,
        canDeactivate: [canDeactivateGuard],
        data: {
          disclaimerKey: 'Actualizacion de Datos',
        },
      },
      {
        path: 'service',
        component: ServiceLayoutComponent,
        canActivate: [clientSelectedGuard],
        children: [
          {
            path: 'documentation',
            component: DocumentsComponent,
            canActivate: [serviceAccessGuard],
            data: {
              disclaimerKey: 'Documentos',
              serviceKey: SERVICES_CONFIG.documentation.key,
            },
          },
          // {
          //   path: 'rates',
          //   component: RatesComponent,
          //   canActivate: [serviceAccessGuard],
          //   data: {
          //     disclaimerKey: 'Tarifas',
          //     serviceKey: SERVICES_CONFIG.rates.key
          //   },
          // },
          {
            path: 'contracts',
            component: ContractsComponent,
            canActivate: [serviceAccessGuard],
            data: {
              disclaimerKey: 'Contratos',
              serviceKey: SERVICES_CONFIG.contracts.key
            },
          },
        ],
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
export class AppRoutingModule { }
