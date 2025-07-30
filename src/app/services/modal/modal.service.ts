import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injectable,
  Injector,
  Type,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  ComponentRef,
  createComponent,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private rootViewContainer!: ViewContainerRef;

  // Esto lo llamas desde tu AppComponent o un lugar global al iniciar
  // public setRootViewContainerRef(vcr: ViewContainerRef) {
  //   this.rootViewContainer = vcr;
  // }

  // open<T extends object>(
  //   content: Type<T> | TemplateRef<any>,
  //   options: Partial<ModalComponent> = {}, // Modal inputs
  //   inputs?: Partial<T> // Content component inputs
  // ): { onClose: Observable<any> } {
  //   const onClose$ = new Subject<any>();

  //   const modalRef = this.rootViewContainer.createComponent(ModalComponent);
  //   const instance = modalRef.instance;
  //   const isTemplate = content instanceof TemplateRef;

  //   Object.assign(instance, options);

  //   // ✅ Inyecta dinámicamente el contenido solo si es dinámico
  //   instance.afterViewInitCallback = (vcr: ViewContainerRef) => {
  //     if (content) {
  //       if (isTemplate) {
  //         const view = content.createEmbeddedView({});
  //         vcr.insert(view);
  //       } else {
  //         const compRef = vcr.createComponent(content);
  //         if (inputs) {
  //           Object.assign(compRef.instance, inputs);
  //           // compRef.changeDetectorRef.detectChanges();
  //         }
  //       }
  //     }
  //   };

  //   // modalRef.changeDetectorRef.detectChanges();
  //   // modalRef.instance.cdr.detectChanges();
  //   modalRef.instance.open();

  //   instance.onClose.subscribe(result => {
  //     onClose$.next(result);
  //     onClose$.complete();
  //     modalRef.destroy();
  //   });

  //   return { onClose: onClose$.asObservable() };
  // }











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

    // 1. Crear el modal
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

    // 2. Adjuntar a DOM
    this.appRef.attachView(modalRef.hostView);
    const domElem = (modalRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // 3. Abrir modal
    modalInstance.open();

    // 4. Cerrar y limpiar
    modalInstance.onClose.subscribe(result => {
      onClose$.next(result);
      onClose$.complete();
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();
    });

    return { onClose: onClose$.asObservable() };
  }

}
