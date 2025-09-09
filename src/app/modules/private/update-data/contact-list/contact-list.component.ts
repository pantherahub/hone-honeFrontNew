import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { firstValueFrom } from 'rxjs';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownTriggerDirective],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent {

  @Input() createdContacts!: FormArray;
  @Input() updatedContacts!: FormArray;
  @Input() deletedContacts!: FormArray;
  @Input() existingContacts: any[] = [];

  @Output() contactsChanged = new EventEmitter<any>();
  @Output() prev = new EventEmitter<void>();
  @Output() onFormSubmit = new EventEmitter<any>();

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private toastService: ToastService,
  ) { }

  goPrev() {
    this.prev.emit();
  }

  onSubmit() {
    this.onFormSubmit.emit();
  }

  viewOffice(officeIndex: number | null = null) { }

  openContactModal(contactIndex: number | null = null) {
    const contact = contactIndex != null
      ? this.existingContacts[contactIndex]
      : null;

    const modalRef = this.modalService.create<ContactFormComponent, any>({
      nzTitle: contact ? 'Actualizar contacto' : 'Agregar contacto',
      nzContent: ContactFormComponent,
      nzCentered: true,
      nzClosable: true,
      nzMaskClosable: false,
      nzWidth: '650px',
      nzStyle: { 'max-width': '90%', 'margin': '22px 0' },
      nzOnCancel: () => {
        const componentInstance = modalRef.getContentComponent();
        if (componentInstance.hasChanges) {
          this.alertService.confirm(
            'Cambios sin guardar',
            'Tienes cambios en el contacto. Si sales sin guardar, se perderán.',
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
    instanceModal.contactModelType = 'Prestador';
    if (contact) instanceModal.contact = contact;

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.contact) {
        const newContact = result.contact;

        if (result.isNew && newContact.value.idAddedTemporal) {
          if (contactIndex != null) {
            const createdContactsIndex = this.createdContacts.controls.findIndex(
              (control) => control.value.idAddedTemporal === newContact.value.idAddedTemporal
            );
            (this.createdContacts as FormArray).setControl(createdContactsIndex, newContact);
            this.existingContacts[contactIndex] = newContact.value;
          } else {
            this.createdContacts.push(newContact);
            this.existingContacts.push(newContact.value);
          }
          this.existingContacts = [...this.existingContacts];
          this.toastService.success(
            `Contacto por ${contactIndex != null ? 'actualizar' : 'agregar'}.`,
            { color: 'info' }
          );
        } else if (!result.isNew && contactIndex != null) {
          const updatedContactsIndex = this.updatedContacts.controls.findIndex(
            (control) => control.value.idTemporalContact === newContact.value.idTemporalContact
          );
          if (updatedContactsIndex !== -1) {
            (this.updatedContacts as FormArray).setControl(updatedContactsIndex, newContact);
          } else {
            this.updatedContacts.push(newContact);
          }
          this.existingContacts[contactIndex] = newContact.value;
          this.existingContacts = [...this.existingContacts];
          this.toastService.success('Contacto por actualizar.', { color: 'info' });
        }
        this.contactsChanged.emit(this.existingContacts);
      }
    });
  }

  async deleteContact(index: number) {
    const confirmed = await firstValueFrom(
      this.alertService.confirmDelete(
        '¿Eliminar contacto?',
        'Eliminar contacto del listado'
      )
    );

    if (!confirmed) return;

    const deletedContact = this.existingContacts[index];

    // Remove from existingContacts
    this.existingContacts.splice(index, 1);

    if (deletedContact.idTemporalContact !== null) {
      // Search in updatedContacts and delete if it exists
      const updatedIndex = this.updatedContacts.controls.findIndex(contact =>
        contact.value.idTemporalContact == deletedContact.idTemporalContact
      );
      if (updatedIndex !== -1) {
        this.updatedContacts.removeAt(updatedIndex);
      }
      // Push to deleted array if it already existed
      this.deletedContacts.push(this.fb.control(deletedContact.idTemporalContact));
    } else {
      // Search in createdContacts and delete if it exists
      const createdIndex = this.createdContacts.controls.findIndex(contact =>
        JSON.stringify(contact.value) === JSON.stringify(deletedContact)
      );
      if (createdIndex !== -1) {
        this.createdContacts.removeAt(createdIndex);
      }
    }
    this.existingContacts = [...this.existingContacts];
    this.toastService.success('Contacto por eliminar.', { color: 'info' });
  }

}
