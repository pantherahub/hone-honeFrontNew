import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from 'src/app/models/toast.interface';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  private counter = 0;

  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  private clearSubject = new Subject<void>();
  clear$ = this.clearSubject.asObservable();


  show(type: Toast['type'], message: string, duration = 3000) {
    this.toastSubject.next({
      id: ++this.counter,
      type,
      message,
      duration
    });
  }

  clear() {
    this.clearSubject.next();
  }

  success(msg: string, duration?: number) {
    this.show('success', msg, duration);
  }

  error(msg: string, duration?: number) {
    this.show('error', msg, duration);
  }

  info(msg: string, duration?: number) {
    this.show('info', msg, duration);
  }

  warning(msg: string, duration?: number) {
    this.show('warning', msg, duration);
  }

}
