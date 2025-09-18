import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ContactFormComponent } from '../shared/contact-form/contact-form.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { firstValueFrom } from 'rxjs';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ContactDetailComponent } from '../shared/contact-detail/contact-detail.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownTriggerDirective, ContactFormComponent, ContactDetailComponent],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent {

  @Input() isFirstForm: boolean = true;
  @Input() createdContacts!: FormArray;
  @Input() updatedContacts!: FormArray;
  @Input() deletedContacts!: FormArray;
  @Input() existingContacts: any[] = [];

  @Output() contactsChanged = new EventEmitter<any>();
  @Output() prev = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  isEditingContact = false;
  selectedContactIndex: number | null = null;

  @ViewChild('contactDrawer', { static: false }) contactDrawer!: ContactFormComponent;
  @ViewChild('contactDetailDrawer', { static: false }) contactDetailDrawer!: ContactDetailComponent;

  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private toastService: ToastService,
  ) { }

  goPrev() {
    this.prev.emit();
  }

  onSubmit() {
    this.save.emit();
  }

  successToast(message: string) {
    if (!this.isFirstForm) return;
    this.toastService.success(message, { color: 'info' });
  }

  viewContact(contactIndex: number | null = null) {
    if (contactIndex == null) return;
    const contact = this.existingContacts[contactIndex];
    this.contactDetailDrawer.open(contact);
  }

  openContactForm(index: number | null = null) {
    this.isEditingContact = true;
    this.selectedContactIndex = index;

    const contact = this.selectedContactIndex != null
      ? this.existingContacts[this.selectedContactIndex]
      : null;
    this.contactDrawer.open({ contact });
  }

  onContactFormClose(savedContact?: any) {
    if (savedContact) {
      this.handleSaveContact(savedContact);
    }
    this.isEditingContact = false;
    this.selectedContactIndex = null;
  }

  private handleSaveContact(result: any) {
    const contactIndex = this.selectedContactIndex;

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
        this.successToast(
          `Contacto por ${contactIndex != null ? 'actualizar' : 'agregar'}.`
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
        this.successToast('Contacto por actualizar.');
      }
      this.contactsChanged.emit(this.existingContacts);
      if (!this.isFirstForm) this.save.emit();
    }
  }

  async deleteContact(index: number) {
    if (!this.isFirstForm && this.existingContacts.length <= 1) {
      this.alertService.warning(
        '¡Requerido!',
        'Debe existir al menos un contacto, actualízalo o crea otro antes de eliminarlo.'
      );
      return;
    }

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
    this.successToast('Contacto por eliminar.');

    if (!this.isFirstForm) this.save.emit();
  }

}
