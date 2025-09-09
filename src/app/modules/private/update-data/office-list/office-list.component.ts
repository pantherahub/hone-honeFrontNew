import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { OfficeModalComponent } from '../office-modal/office-modal.component';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { firstValueFrom } from 'rxjs';
import { OfficeFormComponent } from '../office-form/office-form.component';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-office-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownTriggerDirective, OfficeFormComponent],
  templateUrl: './office-list.component.html',
  styleUrl: './office-list.component.scss'
})
export class OfficeListComponent {

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

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private toastService: ToastService,
  ) { }

  goPrev() { this.prev.emit(); }
  goNext() { this.next.emit(); }

  // get isEditingOffice(): boolean {
  //   return this.selectedOfficeIndex != null;
  // }

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

  viewOffice(officeIndex: number | null = null) { }

  openOfficeModal(officeIndex: number | null = null) {
    const office = officeIndex != null
      ? this.existingOffices[officeIndex]
      : null;

    const modalRef = this.modalService.create<OfficeModalComponent, any>({
      nzTitle: office ? 'Actualizar sede de prestación de servicio' : 'Agregar sede de prestación de servicio',
      nzContent: OfficeModalComponent,
      nzCentered: true,
      nzClosable: true,
      nzMaskClosable: false,
      nzWidth: '900px',
      nzStyle: { 'max-width': '90%', 'margin': '22px 0' },
      nzOnCancel: () => {
        const componentInstance = modalRef.getContentComponent();
        if (componentInstance.hasChanges) {
          this.alertService.confirm(
            'Cambios sin guardar',
            'Tienes cambios en la sede. Si sales sin guardar, se perderán.',
            {
              confirmBtnText: 'Salir',
              cancelBtnText: 'Cancelar',
            }
          ).subscribe((confirmed: boolean) => {
            if (!confirmed) return;
            modalRef.destroy();
          });
          return false;
        }
        return true; // Close modal
      }
    });
    const instanceModal = modalRef.getContentComponent();
    if (office) {
      instanceModal.office = office;
    }
    instanceModal.providerCompanies = this.providerCompanies;

    modalRef.afterClose.subscribe((result: any) => {
      // if (result && result.office) {
      //   const newOffice = result.office;

      //   if (result.isNew && newOffice.value.idAddedTemporal) {
      //     if (officeIndex != null) {
      //       const createdOfficesIndex = this.createdOffices.controls.findIndex(
      //         (control) => control.value.idAddedTemporal === newOffice.value.idAddedTemporal
      //       );
      //       (this.createdOffices as FormArray).setControl(createdOfficesIndex, newOffice);
      //       this.existingOffices[officeIndex] = newOffice.value;
      //     } else {
      //       this.createdOffices.push(newOffice);
      //       this.existingOffices.push(newOffice.value);
      //     }
      //     this.existingOffices = [...this.existingOffices];
      //     this.toastService.success(
      //       `Sede por ${officeIndex != null ? 'actualizar' : 'agregar'}.`,
      //       { color: 'info' }
      //     );
      //   } else if (!result.isNew && officeIndex != null) {
      //     const updatedOfficesIndex = this.updatedOffices.controls.findIndex(
      //       (control) => control.value.idTemporalOfficeProvider === newOffice.value.idTemporalOfficeProvider
      //     );
      //     if (updatedOfficesIndex !== -1) {
      //       (this.updatedOffices as FormArray).setControl(updatedOfficesIndex, newOffice);
      //     } else {
      //       this.updatedOffices.push(newOffice);
      //     }
      //     this.existingOffices[officeIndex] = newOffice.value;
      //     this.existingOffices = [...this.existingOffices];
      //     this.toastService.success('Sede por actualizar.', { color: 'info' });
      //   }
      //   this.officesChanged.emit(this.existingOffices);
      // }
    });
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
