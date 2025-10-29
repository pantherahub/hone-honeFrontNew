import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { City } from 'src/app/models/city.interface';
import { CompanyInterface } from 'src/app/models/client.interface';
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { ContactsProviderService } from 'src/app/services/contacts-provider/contacts-provider.service';
import { OfficeDataService } from 'src/app/services/office-data/office-data.service';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';

@Component({
  selector: 'app-office-detail',
  standalone: true,
  imports: [CommonModule, DrawerComponent],
  templateUrl: './office-detail.component.html',
  styleUrl: './office-detail.component.scss'
})
export class OfficeDetailComponent implements OnInit {

  @Input() companyList: CompanyInterface[] = [];

  office: any | null = null;
  modelType: string = 'Sede';

  existingSchedules: any[] = [];
  existingContacts: any[] = [];

  loadingContacts: boolean = false;

  cities: any[] = [];
  identificationTypes: any[] = [];
  contactOccupationTypes: any[] = [];

  @ViewChild('officeDrawer', { static: false }) officeDrawer!: DrawerComponent;

  constructor(
    private catalogService: CatalogService,
    private contactsProviderService: ContactsProviderService,
    private officeDataService: OfficeDataService,
  ) { }

  ngOnInit(): void {
    this.loadContactOccupationTypes();
    this.loadCities();
    this.loadIdentificationTypes();
  }

  open(office?: any) {
    this.office = office ?? null;
    this.existingSchedules = [];
    this.existingContacts = [];

    this.officeDrawer.open();
    this.loadSchedules();
    this.loadContacts();
  }

  onClose() {
    this.office = null;
    this.existingSchedules = [];
    this.existingContacts = [];
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

  getOccupationName(contact: any) {
    let occupationName = contact.occupationName;
    if (!occupationName) {
      const existingOccupation = contact.OccupationForOffice;
      occupationName = existingOccupation?.occupation;
    }
    return occupationName ?? '';
  }

  getCompanyNames(): number[] {
    if (!this.office) {
      return [];
    } else if (this.office.idsCompanies) {
      return this.office.idsCompanies
        .map((id: number) => {
          const company = this.companyList.find(c => c.idCompany === id);
          return company ? company.name : null;
        })
        .filter((name: string | null): name is string => !!name);
    } else if (this.office.Companies) {
      return this.office.Companies.map((company: any) => company.name);
    }
    return [];
  }

  loadSchedules() {
    const officeId = this.office.idTemporalOfficeProvider;
    if (!officeId) {
      this.existingSchedules = this.officeDataService.refreshSchedules(
        this.office, this.existingSchedules
      );
      return;
    }
    this.existingSchedules = this.officeDataService.refreshSchedules(
      this.office, this.office.TemporalSchedules || []
    );
  }

  loadContacts() {
    const officeId = this.office.idTemporalOfficeProvider;
    if (!officeId) {
      this.existingContacts = this.officeDataService.refreshContacts(
        this.office, this.existingContacts
      );
      return;
    }

    this.loadingContacts = true;
    this.contactsProviderService
      .getTemporalContactsById(this.modelType, officeId)
      .subscribe({
        next: (res: any) => {
          this.existingContacts = this.officeDataService.refreshContacts(
            this.office, res.data
          );
          this.loadingContacts = false;
        },
        error: (err: any) => {
          console.error(err);
          this.loadingContacts = false;
        }
      });
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
