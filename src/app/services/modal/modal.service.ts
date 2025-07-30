import {
  ApplicationRef,
  Injectable,
  Injector,
  Type,
  EmbeddedViewRef,
  TemplateRef,
  createComponent,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private injector: Injector,
    private appRef: ApplicationRef
  ) { }

  /**
   * Opens a modal dynamically, rendering either a component or a template.
   *
   * @template T The type of the component to render as modal content.
   * @param content A Component type or a TemplateRef to be displayed inside the modal.
   * @param options Optional modal configuration (size, closable, animation, etc.).
   *                These are applied to the ModalComponent instance.
   * @param inputs Optional inputs to assign to the component instance if `content` is a component.
   * @returns An object with `onClose`, an observable that emits the result when the modal is closed.
   */
  open<T extends object>(
    content: Type<T> | TemplateRef<any>,
    options: Partial<ModalComponent> = {},
    inputs?: Partial<T>
  ): { onClose: Observable<any> } {
    const onClose$ = new Subject<any>();
    const isTemplate = content instanceof TemplateRef;

    // Create the modal
    const modalRef = createComponent(ModalComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    const modalInstance = modalRef.instance;

    Object.assign(modalInstance, options);

    modalInstance.afterViewInitCallback = (vcr) => {
      if (isTemplate) {
        const view = content.createEmbeddedView({});
        vcr.insert(view);
      } else {
        const compRef = vcr.createComponent(content);
        if (inputs) {
          Object.assign(compRef.instance, inputs);
          // compRef.changeDetectorRef.detectChanges();
        }
      }
    };

    // Attach to DOM
    this.appRef.attachView(modalRef.hostView);
    const domElem = (modalRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Open modal
    modalInstance.open();

    // Close and clean
    modalInstance.onClose.subscribe(result => {
      onClose$.next(result);
      onClose$.complete();
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();
    });

    return { onClose: onClose$.asObservable() };
  }

}
