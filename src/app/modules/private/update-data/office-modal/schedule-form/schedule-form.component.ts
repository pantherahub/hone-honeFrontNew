import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { FormUtilsService } from 'src/app/services/form-utils/form-utils.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { DrawerComponent } from 'src/app/shared/components/drawer/drawer.component';
import { InputErrorComponent } from 'src/app/shared/components/input-error/input-error.component';
import { SelectComponent } from 'src/app/shared/components/select/select.component';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [NgZorroModule, CommonModule, TextInputComponent, InputErrorComponent, DrawerComponent, ButtonComponent, SelectComponent],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.scss'
})
export class ScheduleFormComponent implements OnInit {

  @Input() schedule: any | null = null;
  @Input() existingSchedules: any[] = [];
  @Output() onClose = new EventEmitter<any>();

  scheduleForm!: FormGroup;
  loading: boolean = false;

  scheduleType: string[] = ['Rango', 'Día'];
  scheduleTypeMap = [
    { value: 'range', label: 'Rango' },
    { value: 'day', label: 'Día' }
  ];

  dayIndexMap: Record<string, number> = {
    'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
    'Viernes': 5, 'Sábado': 6, 'Domingo': 7
  };
  dayOptionsStart: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  dayOptionsEnd: string[] = [...this.dayOptionsStart, 'Domingo'];
  dayOptionsWithFestivos: string[] = [...this.dayOptionsEnd, 'Festivos']; // Individual day allows "Festivos"
  dayType: string[] = ['Completa', 'Mañana', 'Tarde'];

  availableEndDays: string[] = [...this.dayOptionsEnd];

  customErrorMessagesMap: { [key: string]: any } = {
    scheduleType: {
      overlappingSchedule: (error: string) => error
    },
    type: {
      duplicateSchedule: (error: string) => error
    },
  };

  @ViewChild('scheduleDrawer', { static: false }) scheduleDrawer!: DrawerComponent;

  constructor(
    private fb: FormBuilder,
    private formUtils: FormUtilsService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  open(schedule?: any) {
    this.schedule = schedule ?? null;
    this.scheduleForm.reset({
      idAddedTemporal: Date.now().toString(),
    });
    if (this.schedule) {
      this.loadScheduleData();
    }
    this.scheduleDrawer.open();
  }

  close(scheduleData?: any) {
    this.scheduleForm.reset();
    this.scheduleDrawer.close(scheduleData);
  }

  onDrawerClose(scheduleData?: any) {
    this.onClose.emit(scheduleData);
  }

  loadScheduleData() {
    if (!this.schedule) return;
    this.loading = true;

    const scheduleParts = this.schedule.schedule.split(' - ');
    const isRange = scheduleParts.length === 2;

    this.scheduleForm.patchValue({
      idTemporalSchedule: this.schedule.idTemporalSchedule,
      idAddedTemporal: this.schedule.idAddedTemporal ?? null,

      scheduleType: isRange ? 'range' : 'day',
      startDayRange: isRange ? scheduleParts[0] : '',
      endDayRange: isRange ? scheduleParts[1] : '',
      day: isRange ? '' : this.schedule.schedule,

      type: this.schedule.type,
      startTime: this.convertTo24Hour(this.schedule.startTime),
      endTime: this.convertTo24Hour(this.schedule.endTime),
    });

    // this.onScheduleTypeChange(isRange ? 'range' : 'day');
    this.loading = false;
  }

  initializeForm() {
    this.scheduleForm = this.fb.group({
      idTemporalSchedule: [null],
      idAddedTemporal: [Date.now().toString()], // Temporary identifier of objects in memory
      scheduleType: ['', [Validators.required]], // Range or day

      startDayRange: [''],
      endDayRange: [''],
      day: [''],

      schedule: [''],

      type: ['', [Validators.required]], // Jornada
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
    }, {
      validators: [
        this.scheduleValidator(this.existingSchedules, this.getDaysRange.bind(this)),
      ]
    });

    this.loadScheduleData();

    this.scheduleForm.get('scheduleType')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      this.onScheduleTypeChange(value);
    });

    this.scheduleForm.get('startDayRange')?.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
      this.updateEndDayOptions(value);
    });
  }

  getDaysRange(startDay: string, endDay: string): number[] {
    const startIndex = this.dayIndexMap[startDay];
    const endIndex = this.dayIndexMap[endDay];
    if (!startIndex || !endIndex || startIndex > endIndex) return [];
    return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i);
  }

  scheduleValidator(existingSchedules: any[], getDaysRange: (startDay: string, endDay: string) => number[]) {
    return (form: AbstractControl) => {
      if (!form) return null;

      const scheduleType = form.get('scheduleType')?.value;
      const startDayRange = form.get('startDayRange')?.value || '';
      const endDayRange = form.get('endDayRange')?.value || '';
      const day = form.get('day')?.value || '';
      const type = form.get('type')?.value;
      const scheduleControl = form.get('scheduleType');
      const typeControl = form.get('type');

      if (!scheduleType || ((!startDayRange || !endDayRange) && !day)) {
        if (scheduleControl?.hasError('overlappingSchedule')) {
          scheduleControl?.setErrors(null);
        }
        if (typeControl?.hasError('duplicateSchedule')) {
          typeControl?.setErrors(null);
        }
        return null;
      }

      const newSchedule = scheduleType === 'range' ? `${startDayRange} - ${endDayRange}` : day;

      /** Duplicate validation */
      // Find if the exact same range/day already exists in existingSchedules
      const existingEntries = existingSchedules.filter(s =>
        s.schedule === newSchedule &&
        (
          (form.value?.idTemporalSchedule && s.idTemporalSchedule !== form.value.idTemporalSchedule) ||
          (!form.value?.idTemporalSchedule && s.idAddedTemporal !== form.value?.idAddedTemporal)
        )
      );

      let duplicateError = false;
      let duplicateMessage = '';

      if (existingEntries.some(s => s.type !== "Completa")) {
        if (!type) {
          if (scheduleControl?.hasError('overlappingSchedule')) {
            scheduleControl?.setErrors(null);
          }
          if (typeControl?.hasError('duplicateSchedule')) {
            typeControl?.setErrors(null);
          }
          return null;
        } else if (existingEntries.some(s => s.type === type)) {
          duplicateError = true;
          duplicateMessage = `El horario '${newSchedule}' ya existe con la jornada '${type}'.`;
        } else if (existingEntries.some(s => s.type === 'Completa') && (type === 'Mañana' || type === 'Tarde')) {
          duplicateError = true;
          duplicateMessage = `El horario '${newSchedule}' ya existe con jornada 'Completa'. No puede seleccionar '${type}'.`;
        } else if (existingEntries.some(s => s.type === 'Mañana' || s.type === 'Tarde') && type === 'Completa') {
          duplicateError = true;
          duplicateMessage = `El horario '${newSchedule}' ya existe con jornada 'Mañana' o 'Tarde'. No puede seleccionar 'Completa'.`;
        }

        if (duplicateError) {
          typeControl?.setErrors({ duplicateSchedule: duplicateMessage });
          if (scheduleControl?.hasError('overlappingSchedule')) {
            scheduleControl?.setErrors(null);
          }
        } else {
          if (typeControl?.hasError('duplicateSchedule')) {
            typeControl?.setErrors(null);
          }
        }
        return null;
      }


      /** Overlap validation */
      let overlappingError = false;
      let overlappingMessage = '';

      if (scheduleType === 'range' && startDayRange && endDayRange) {
        const newRange = getDaysRange(startDayRange, endDayRange);

        const hasOverlap = existingSchedules.some(s => {
          const scheduleParts = s.schedule.split(' - ');
          const existingRange = scheduleParts.length === 2
            ? getDaysRange(scheduleParts[0], scheduleParts[1]) // Existing range
            : [getDaysRange(s.schedule, s.schedule)[0]]; // Existing individual day

          return newRange.some(day =>
            existingRange.includes(day) &&
            (
              (form.value?.idTemporalSchedule && s.idTemporalSchedule !== form.value.idTemporalSchedule) ||
              (!form.value?.idTemporalSchedule && s.idAddedTemporal !== form.value?.idAddedTemporal)
            )
          );
        });

        if (hasOverlap) {
          overlappingError = true;
          overlappingMessage = `Este rango '${startDayRange} - ${endDayRange}' se sobrepone con otro existente.`;
        }
      }

      if (scheduleType === 'day' && day) {
        const dayInRange = existingSchedules.some(s => {
          // Checks if the individual day already exists in an existing range or as an individual day
          const scheduleParts = s.schedule.split(' - ');
          return (
            (scheduleParts.length === 2 && getDaysRange(scheduleParts[0], scheduleParts[1]).includes(getDaysRange(day, day)[0])) ||
            (s.schedule === day)
          ) &&
          (
            (form.value?.idTemporalSchedule && s.idTemporalSchedule !== form.value.idTemporalSchedule) ||
            (!form.value?.idTemporalSchedule && s.idAddedTemporal !== form.value?.idAddedTemporal)
          )
        });
        if (dayInRange) {
          overlappingError = true;
          overlappingMessage = `El día '${day}' ya tiene un horario existente.`;
        }
      }

      if (overlappingError) {
        scheduleControl?.setErrors({ overlappingSchedule: overlappingMessage });
        typeControl?.setErrors(null);
      } else {
        scheduleControl?.setErrors(null);
      }

      return null;
    };
  }

  onScheduleTypeChange(value: string) {
    const startDayControl = this.scheduleForm.get('startDayRange');
    const endDayControl = this.scheduleForm.get('endDayRange');
    const dayControl = this.scheduleForm.get('day');

    if (value === 'range') {
      startDayControl?.setValidators([Validators.required]);
      endDayControl?.setValidators([Validators.required]);
      dayControl?.clearValidators();
      // Clear values
      dayControl?.setValue('');
    } else if (value === 'day') {
      dayControl?.setValidators([Validators.required]);
      startDayControl?.clearValidators();
      endDayControl?.clearValidators();
      // Clear values
      startDayControl?.setValue('');
      endDayControl?.setValue('');
    }

    // Update validators
    startDayControl?.updateValueAndValidity();
    endDayControl?.updateValueAndValidity();
    dayControl?.updateValueAndValidity();
  }

  updateEndDayOptions(startDay: string) {
    if (!startDay) {
      this.availableEndDays = [...this.dayOptionsEnd];
      return;
    }

    // Filter available days for endDay
    const startIndex = this.dayOptionsEnd.indexOf(startDay);
    this.availableEndDays = this.dayOptionsEnd.slice(startIndex + 1);

    const endDayControl = this.scheduleForm.get('endDayRange');
    const endDay = endDayControl?.value;
    // If endDay is equal to or less than startDay, clear it
    if (endDay && this.dayOptionsEnd.indexOf(endDay) <= startIndex) {
      endDayControl?.setValue('');
    }
  }

  onSubmit() {
    this.formUtils.trimFormStrControls(this.scheduleForm);
    this.formUtils.markFormTouched(this.scheduleForm);
    this.scheduleForm.updateValueAndValidity();
    if (this.scheduleForm.invalid) return;

    const formValues = this.scheduleForm.value;
    const formattedSchedule = formValues.scheduleType === 'range'
      ? `${formValues.startDayRange} - ${formValues.endDayRange}`
      : formValues.day;

    const clonedForm = new FormGroup(
      Object.keys(this.scheduleForm.controls).reduce((acc, key) => {
        acc[key] = new FormControl(formValues[key]);
        return acc;
      }, {} as { [key: string]: FormControl })
    );
    clonedForm.patchValue({
      schedule: formattedSchedule,
      startTime: this.convertTo12Hour(formValues.startTime),
      endTime: this.convertTo12Hour(formValues.endTime),
    });

    this.close({
      schedule: clonedForm,
      isNew: this.schedule === null || this.schedule.idTemporalSchedule === null
    });
  }

  // Convert 24h to 12h format with AM/PM
  convertTo12Hour(time: string): string {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    let hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12 || 12;
    return `${hourNum.toString().padStart(2, '0')}:${minute} ${ampm}`;
  }

  // Convert 12h with AM/PM to 24h format
  convertTo24Hour(time: string): string {
    if (!time) return '';
    const match = time.match(/^(\d+):(\d+) (AM|PM)$/);
    if (!match) return time; // If it's already 24 hours, don't change it
    let [_, hour, minute, period] = match;
    let hourNum = parseInt(hour, 10);
    if (period === 'PM' && hourNum < 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;
    return `${hourNum.toString().padStart(2, '0')}:${minute}`;
  }

}
