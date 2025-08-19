import {
  ApplicationRef,
  Injectable,
  Injector,
  Type,
  EmbeddedViewRef,
  TemplateRef,
  createComponent,
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter, Observable, Subject, Subscription, take } from 'rxjs';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private injector: Injector,
    private appRef: ApplicationRef,
    private router: Router,
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
    options: Partial<ModalComponent> & { destroyOnRouteChange?: boolean } = {},
    inputs?: Partial<T>
  ): { onClose: Observable<any>, close: (returnData?: any) => void } {
    const onClose$ = new Subject<any>();
    const isTemplate = content instanceof TemplateRef;

    // Create the modal
    const modalRef = createComponent(ModalComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    const modalInstance = modalRef.instance;

    const {
      destroyOnRouteChange = true,
      ...modalInputs
    } = options;
    Object.assign(modalInstance, modalInputs);

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

    let navSub: Subscription | undefined;
    if (destroyOnRouteChange) {
      navSub = this.router.events.pipe(
        filter(event => event instanceof NavigationStart),
        take(1)
      ).subscribe(() => {
        if (modalInstance.isOpen) modalInstance.close();
      });
    }

    // Close and clean
    modalInstance.onClose.subscribe(result => {
      if (navSub) navSub.unsubscribe();
      onClose$.next(result);
      onClose$.complete();
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();
    });

    return {
      onClose: onClose$.asObservable(),
      close: (returnData?: any) => modalInstance.close(returnData),
    };
  }

}
