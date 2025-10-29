import { ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
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

  show(options: Partial<Toast>) {
    this.ensureContainerExists(() => {
      const toast: Toast = {
        id: ++this.counter,
        type: options.type ?? 'info',
        message: options.message ?? '',
        duration: options.duration ?? 3000,
        color: options.color
      };
      this.toastSubject.next(toast);
    });
  }

  clear() {
    this.clearSubject.next();
  }

  success(message: string, options: Partial<Toast> = {}) {
    this.show({ type: 'success', message, ...options });
  }

  error(message: string, options: Partial<Toast> = {}) {
    this.show({ type: 'danger', message, ...options });
  }

  info(message: string, options: Partial<Toast> = {}) {
    this.show({ type: 'info', message, ...options });
  }

  warning(message: string, options: Partial<Toast> = {}) {
    this.show({ type: 'warning', message, ...options });
  }

}
