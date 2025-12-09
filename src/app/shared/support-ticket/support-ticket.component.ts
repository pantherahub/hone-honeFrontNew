import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';
import { TextInputComponent } from '../components/text-input/text-input.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { InputErrorComponent } from '../components/input-error/input-error.component';
import { Router } from '@angular/router';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { sanitizeString } from 'src/app/utils/string-utils';
import { AuthService } from 'src/app/services/auth.service';
import { REGEX_PATTERNS } from 'src/app/constants/regex-patterns';
import { TicketsService } from 'src/app/services/tickets/tickets.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-support-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent],
  templateUrl: './support-ticket.component.html',
  styleUrl: './support-ticket.component.scss'
})
export class SupportTicketComponent implements OnInit {

  ticketForm!: FormGroup;
  loading: boolean = false;

  userState = this.eventManager.userLogged();
  clientSelected: any = this.eventManager.clientSelected();

  constructor(
    private navigationService: NavigationService,
    private formBuilder: FormBuilder,
    private formUtils: FormUtilsService,
    private router: Router,
    private eventManager: EventManagerService,
    private authService: AuthService,
    private ticketService: TicketsService,
    private toastService: ToastService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  goBack() {
    const backRoute = this.navigationService.getBackRoute();
    this.router.navigateByUrl(backRoute);
  }

  isLogged(): boolean {
    return this.authService.isAuthenticated();
  }

  createForm() {
    this.ticketForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      identification: [
        this.isLogged() ? this.userState.user?.identification || '' : '',
        [Validators.required, this.formUtils.numeric]
      ],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(REGEX_PATTERNS.telNumberWithIndicative)]],
      address: ['', this.isLogged() ? [] : [Validators.required]],
      observation: ['', [Validators.required]]
    });
  }

  getObservations(): string {
    const sanitize = (value: any): string => {
      return typeof value === 'string'
        ? sanitizeString(value.trim())
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
        : value;
    };
    const { name, lastname, identification, email, phone, address, observation } = this.ticketForm.value;

    const joinWithBr = (lines: string[]): string => lines.map(
      (line, i) => (i === 0 ? line : `<br>${line}`)
    ).join('');
    let observations = '';

    if (this.isLogged()) {
      const userInfo = [
        '<strong>Información del usuario que genera caso:</strong>',
        `Nombre: ${this.userState.name}`,
        `Identificacion: ${this.userState.user?.identification || ''}`,
      ];
      if (this.clientSelected?.clientHoneSolutions) {
        userInfo.push(`Cliente: ${this.clientSelected.clientHoneSolutions}`);
      }

      const reportedData = [
        '<strong>Datos reportados del usuario:</strong>',
        `Nombre: ${sanitize(name)}`,
        `Apellido: ${sanitize(lastname)}`,
        `Identificación: ${sanitize(identification)}`,
        `Teléfono: ${sanitize(phone)}`,
        `Email: ${sanitize(email)}`,
        `Observaciones: ${sanitize(observation)}`,
      ];
      observations = joinWithBr(userInfo) + '<br><br>' + joinWithBr(reportedData);
    } else {
      const reportedData = [
        '<strong>Datos reportados del usuario:</strong>',
        `Nombre: ${sanitize(name)}`,
        `Apellido: ${sanitize(lastname)}`,
        `Identificación: ${sanitize(identification)}`,
        `Teléfono: ${sanitize(phone)}`,
        `Email: ${sanitize(email)}`,
        `Dirección: ${sanitize(address)}`,
        `Observaciones: ${sanitize(observation)}`,
      ];
      observations = joinWithBr(reportedData);
    }
    return observations;
  }

  onSubmit() {
    this.formUtils.markFormTouched(this.ticketForm);
    if (this.ticketForm.invalid) return;

    const idClientHone = 7; // Hone Solutions
    let idRole: number | undefined;
    const now = new Date();
    let data: Record<string, any> = {
      description: this.getObservations(),
      requestDate: now.toISOString(),
      maxDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Two days
    };

    if (this.isLogged()) {
      idRole = this.userState.roles?.idRoles;
      data = {
        ...data,
        requestName: 'Solicitud prestador',
        employeeCode: this.userState.id,
        typeRequest: 1,
        userId: this.userState.id,
        email: this.userState.email,
        idClientHone: this.clientSelected?.idClientHoneSolutions ?? idClientHone,
        idRole: this.userState?.roles?.idRoles,
        userLogged: this.userState.id,
      };
    } else {
      idRole = 4; // Admin
      const idUser = 4130; // Admin Hone
      const email = this.ticketForm.get("email")?.value;

      data = {
        ...data,
        requestName: 'Ingreso erroneo prestador',
        employeeCode: idUser,
        typeRequest: 15,
        userId: idUser,
        email: email,
        idClientHone: idClientHone,
        idRole: idRole,
        userLogged: idUser,
      };
    }

    if (!idRole) {
      this.toastService.error('Algo salió mal.');
      return;
    }

    this.loading = true;
    this.ticketService.postTicket(idRole, data).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.alertService.showAlert({
            title: '¡Solicitud recibida!',
            variant: 'success',
            message: 'Tu PQRS ha sido enviada exitosamente. Estaremos revisando tu caso pronto.',
          });
          this.ticketForm.reset({
            identification: this.isLogged() ? this.userState.user?.identification || '' : '',
          });
        },
        error: (error: any) => {
          this.loading = false;
          this.alertService.error(
            'Ups...',
            'Lo sentimos, hubo un error en el servidor.'
          );
        }
    });
  }

}
