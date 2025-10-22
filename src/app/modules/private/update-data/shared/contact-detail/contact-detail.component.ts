import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { City } from 'src/app/models/city.interface';
import { DocumentType } from 'src/app/models/document-type.interface';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ContactsProviderService } from 'src/app/services/contacts-provider/contacts-provider.service';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, DrawerComponent, PipesModule],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss'
})
export class ContactDetailComponent implements OnInit {

  @Input() contactModelType: 'Prestador' | 'Sede' = 'Prestador';
  contact: any | null = null;

  cities: any[] = [];
  identificationTypes: any[] = [];
  contactOccupationTypes: any[] = [];

  @ViewChild('contactDrawer', { static: false }) contactDrawer!: DrawerComponent;

  constructor(
    private catalogService: CatalogService,
    private contactsProviderService: ContactsProviderService,
  ) { }

  ngOnInit(): void {
    this.loadContactOccupationTypes();
    this.loadCities();
    this.loadIdentificationTypes();
  }

  open(contact?: any) {
    this.contact = contact ?? null;
    this.contactDrawer.open();
  }

  onClose() {
    this.contact = null;
  }

  loadContactOccupationTypes() {
    this.contactsProviderService.getOccupationTypes().subscribe({
      next: (res: any) => {
        this.contactOccupationTypes = res.data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadCities() {
    this.catalogService.getCities().subscribe({
      next: (data: any) => {
        this.cities = data;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadIdentificationTypes() {
    this.catalogService.getDocTypes().subscribe({
      next: (res: any) => {
        this.identificationTypes = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getOccTypeById(id: number): any | undefined {
    return this.contactOccupationTypes.find(occ => occ.idOccupationType === id);
  }

  getCityById(id: number): City | undefined {
    return this.cities.find(city => city.idCity === id);
  }

  getDocTypeById(id: number): DocumentType | undefined {
    return this.identificationTypes.find(
      type => type.idTypeDocument === id
    );
  }

  getOccupationName() {
    let occupationName = this.contact.occupationName;
    if (!occupationName) {
      const existingOccupation = this.contactModelType == 'Prestador'
        ? this.contact.OccupationForProvider
        : this.contact.OccupationForOffice;
      occupationName = existingOccupation?.occupation;
    }
    return occupationName ?? '';
  }

  getCompletePhone(phone: any): string {
    if (!phone) return '';
    let phoneStr = `${this.formatPhoneType(phone.type)} `;
    if (phone.type === "Fijo") {
      const indicative = this.getCityById(phone.idCity)?.indicative;
      if (indicative) phoneStr += `(${indicative}) `;
    }
    phoneStr += `${phone.number}`;
    if (phone.extension) phoneStr += ` - Ext. ${phone.extension}`;
    return phoneStr;
  }

  private formatPhoneType(type: string): string {
    switch (type) {
      case "Whatsapp": return "Wpp";
      case "Celular": return "Cel";
      case "Fijo": return "Fijo";
      case "Numeral": return "Num";
      default: return type;
    }
  }

}
