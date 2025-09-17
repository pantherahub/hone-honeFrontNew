import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { firstValueFrom } from 'rxjs';
import { OfficeFormComponent } from '../office-form/office-form.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { OfficeDetailComponent } from '../office-detail/office-detail.component';
import { CompanyInterface } from 'src/app/models/client.interface';
import { ClientProviderService } from 'src/app/services/clients/client-provider.service';

@Component({
  selector: 'app-office-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownTriggerDirective, OfficeFormComponent, OfficeDetailComponent],
  templateUrl: './office-list.component.html',
  styleUrl: './office-list.component.scss'
})
export class OfficeListComponent implements OnInit {

  @Input() providerCompanies: any[] = [];
  @Input() createdOffices!: FormArray;
  @Input() updatedOffices!: FormArray;
  @Input() deletedOffices!: FormArray;
  @Input() existingOffices: any[] = [];

  @Output() officesChanged = new EventEmitter<any>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  isEditingOffice = false;
  selectedOfficeIndex: number | null = null;

  companyList: CompanyInterface[] = [];

  @ViewChild('officeDetailDrawer', { static: false }) officeDetailDrawer!: OfficeDetailComponent;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private clientService: ClientProviderService,
  ) { }

  ngOnInit(): void {
    this.getCompanyList();
  }

  goPrev() { this.prev.emit(); }
  goNext() { this.next.emit(); }

  getCompanyList() {
    this.clientService.getCompanies().subscribe({
      next: (res: any) => {
        this.companyList = res.data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  viewOffice(officeIndex: number | null = null) {
    if (officeIndex == null) return;
    const office = this.existingOffices[officeIndex];
    this.officeDetailDrawer.open(office);
  }

  openOfficeForm(index: number | null = null) {
    this.isEditingOffice = true;
    this.selectedOfficeIndex = index;
  }

  closeOfficeForm(savedOffice?: any) {
    if (savedOffice) {
      this.handleSaveOffice(savedOffice);
    }
    this.isEditingOffice = false;
    this.selectedOfficeIndex = null;
  }

  private handleSaveOffice(result: any) {
    const officeIndex = this.selectedOfficeIndex;

    if (result && result.office) {
      const newOffice = result.office;

      if (result.isNew && newOffice.value.idAddedTemporal) {
        if (officeIndex != null) {
          const createdOfficesIndex = this.createdOffices.controls.findIndex(
            (control) => control.value.idAddedTemporal === newOffice.value.idAddedTemporal
          );
          (this.createdOffices as FormArray).setControl(createdOfficesIndex, newOffice);
          this.existingOffices[officeIndex] = newOffice.value;
        } else {
          this.createdOffices.push(newOffice);
          this.existingOffices.push(newOffice.value);
        }
        this.existingOffices = [...this.existingOffices];
        this.toastService.success(
          `Sede por ${officeIndex != null ? 'actualizar' : 'agregar'}.`,
          { color: 'info' }
        );
      } else if (!result.isNew && officeIndex != null) {
        const updatedOfficesIndex = this.updatedOffices.controls.findIndex(
          (control) => control.value.idTemporalOfficeProvider === newOffice.value.idTemporalOfficeProvider
        );
        if (updatedOfficesIndex !== -1) {
          (this.updatedOffices as FormArray).setControl(updatedOfficesIndex, newOffice);
        } else {
          this.updatedOffices.push(newOffice);
        }
        this.existingOffices[officeIndex] = newOffice.value;
        this.existingOffices = [...this.existingOffices];
        this.toastService.success('Sede por actualizar.', { color: 'info' });
      }
      this.officesChanged.emit(this.existingOffices);
    }
  }

  async deleteOffice(index: number) {
    const confirmed = await firstValueFrom(
      this.alertService.confirmDelete(
        '¿Eliminar sede?',
        'Eliminar sede de prestación de servicio del listado'
      )
    );
    if (!confirmed) return;

    const deletedOffice = this.existingOffices[index];

    // Remove from existingOffices
    this.existingOffices.splice(index, 1);

    if (deletedOffice.idTemporalOfficeProvider !== null) {
      // Search in updatedOffices and delete if it exists
      const updatedIndex = this.updatedOffices.controls.findIndex(office =>
        office.value.idTemporalOfficeProvider == deletedOffice.idTemporalOfficeProvider
      );
      if (updatedIndex !== -1) {
        this.updatedOffices.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedOffices.push(this.fb.control(deletedOffice.idTemporalOfficeProvider));
    } else {
      // Search in createdOffices and delete if it exists
      const createdIndex = this.createdOffices.controls.findIndex(office =>
        JSON.stringify(office.value) === JSON.stringify(deletedOffice)
      );
      if (createdIndex !== -1) {
        this.createdOffices.removeAt(createdIndex);
      }
    }
    this.existingOffices = [...this.existingOffices];
    this.toastService.success('Sede por eliminar.', { color: 'info' });
  }

}
