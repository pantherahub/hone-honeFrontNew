import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { RadioComponent } from 'src/app/shared/components/radio/radio.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { BadgeConfig } from 'src/app/types/badge-config.type';

@Component({
  selector: 'app-ticket-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DrawerComponent, ButtonComponent, TextInputComponent, InputErrorComponent, RadioComponent],
  templateUrl: './ticket-filters.component.html',
  styleUrl: './ticket-filters.component.scss'
})
export class TicketFiltersComponent implements OnInit, OnDestroy {

  @Input() ticketStatusList: any[] = [];
  @Input() statusConfig!: Record<string, BadgeConfig>;
  @Output() onClose = new EventEmitter<any>();

  tempForm!: FormGroup;

  private destroy$ = new Subject<void>();

  @ViewChild('filterDrawer') filterDrawer!: DrawerComponent;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit(): void {
    this.tempForm = this.fb.group({
      idTicket: [null],
      requestName: [null],
      startDate: [null],
      endDate: [null],
      idStatus: [null],
    }, {
      validators: [this.formUtils.validateDateRange('startDate', 'endDate', true, true)],
    });

    this.tempForm.get('startDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onStartDateChange();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStartDateChange(): void {
    const startControl = this.tempForm.get('startDate');
    const endControl = this.tempForm.get('endDate');

    // set endDate one month after startDate automatically
    this.formUtils.updateEndDateRange(startControl, endControl, 'months', 1);
  }

  open(currentFilters: any) {
    this.tempForm.reset(currentFilters);
    // this.tempForm.patchValue(currentFilters);
    this.filterDrawer.open();
  }

  cancel() {
    this.filterDrawer.close();
  }

  reset() {
    this.tempForm.reset();
    this.filterDrawer.close(this.tempForm.value);
  }

  apply() {
    const { idTicket, requestName, ...data } = this.tempForm.value;
    const filters = {
      ...data,
      idTicket: idTicket || null,
      requestName: requestName?.trim() || null,
    };
    this.filterDrawer.close(filters);
  }

  onDrawerInternalClose(filters?: any) {
    this.onClose.emit(filters);
  }

}
