import { ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { Toast } from 'src/app/models/toast.interface';
import { ToastContainerComponent } from 'src/app/shared/alerts/toast-container/toast-container.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private containerRef: ComponentRef<ToastContainerComponent> | null = null;

  private counter = 0;

  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  private clearSubject = new Subject<void>();
  clear$ = this.clearSubject.asObservable();

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
  ) { }

  /**
   * Ensures the container exists or creates it to display the toasts.
   * @param callback Optional function to execute once the container is ready (the first toast).
   */
  private ensureContainerExists(callback?: () => void) {
    if (this.containerRef) {
      callback?.();
      return;
    }

    this.containerRef = createComponent(ToastContainerComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    this.appRef.attachView(this.containerRef.hostView);

    const domElem = (this.containerRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Ensures that the component's ngOnInit has already been executed
    setTimeout(() => {
      callback?.();
    });
  }

  // 3000
  show(type: Toast['type'], message: string, duration = 50000) {
    this.ensureContainerExists(() => {
      this.toastSubject.next({
        id: ++this.counter,
        type,
        message,
        duration
      });
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
