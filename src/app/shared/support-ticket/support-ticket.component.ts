import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';
import { TextInputComponent } from '../components/text-input/text-input.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { InputErrorComponent } from '../components/input-error/input-error.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, TextInputComponent, InputErrorComponent],
  templateUrl: './support-ticket.component.html',
  styleUrl: './support-ticket.component.scss'
})
export class SupportTicketComponent implements OnInit {

  ticketForm!: FormGroup;

  constructor(
    private navigationService: NavigationService,
    private formBuilder: FormBuilder,
    private formUtils: FormUtilsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.createForm();

    // Validar por ruta actual y validar por authService.isAuthenticated(), si no colocar entonces el support normal publico
  }

  goBack() {
    const backRoute = this.navigationService.getBackRoute();
    this.router.navigateByUrl(backRoute);
  }

  createForm() {
    this.ticketForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      identification: ['', [Validators.required, this.formUtils.numeric]],
      email: ['', [Validators.required, this.formUtils.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      observation: ['', [Validators.required]]
    });
  }

  onSubmit() { }

}
