import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfficeDataService {

  constructor() { }

  /**
   * Update existingSchedules with the modifications made.
   * Refreshes schedules in an office (mix of updated, created, deleted)
   */
  refreshSchedules(office: any, existingSchedules: any[] = []): any[] {
    // Convert existing schedules into a Map for quick access by idTemporalSchedule
    const existingSchedulesMap = new Map(
      (existingSchedules ?? []).map((schedule: any) => [schedule.idTemporalSchedule, schedule])
    );

    const updatedSchedules = office.updatedSchedules || [];
    const createdSchedules = office.createdSchedules || [];
    const deletedSchedules = office.deletedSchedules || [];

    // 1. Update existing schedules
    updatedSchedules.forEach((schedule: any) => {
      if (existingSchedulesMap.has(schedule.idTemporalSchedule)) {
        existingSchedulesMap.set(schedule.idTemporalSchedule, schedule);
      }
    });

    // 2. Delete schedules present in deletedSchedules
    deletedSchedules.forEach((id: number) => existingSchedulesMap.delete(id));

    // Convert Map to array
    const result = Array.from(existingSchedulesMap.values());

    // 3. Add new schedules (without idTemporalSchedule)
    result.push(...createdSchedules);

    return result;
  }

  /**
   * Update existingContacts with the modifications made.
   * Refreshes contacts in an office (mix of updated, created, deleted)
   */
  refreshContacts(office: any, existingContacts: any[] = []): any[] {
    // Convert existing contacts into a Map for quick access by idTemporalContact
    const existingContactsMap = new Map(
      (existingContacts ?? []).map((contact: any) => [contact.idTemporalContact, contact])
    );

    const updatedContacts = office.updatedContacts || [];
    const createdContacts = office.createdContacts || [];
    const deletedContacts = office.deletedContacts || [];

    // 1. Update existing contacts
    updatedContacts.forEach((contact: any) => {
      if (existingContactsMap.has(contact.idTemporalContact)) {
        existingContactsMap.set(contact.idTemporalContact, contact);
      }
    });

    // 2. Delete contacts present in deletedContacts
    deletedContacts.forEach((id: number) => existingContactsMap.delete(id));

    // Convert Map to array
    const result = Array.from(existingContactsMap.values());

    // 3. Add new contacts (without idTemporalContact)
    result.push(...createdContacts);

    return result;
  }

}
