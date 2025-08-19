import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, effect } from '@angular/core';
import { ClientInterface } from '../../../models/client.interface';
import { ClientProviderService } from '../../../services/clients/client-provider.service';

import { NgZorroModule } from '../../../ng-zorro.module';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Subscription } from 'rxjs';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { PopoverComponent } from 'src/app/shared/components/popover/popover.component';
import { ModalService } from 'src/app/services/modal/modal.service';
import { ModalRef } from 'src/app/models/modal.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ NgZorroModule, CommonModule, RouterModule, TextInputComponent, ButtonComponent, ModalComponent, PopoverComponent ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  user = this.eventManager.userLogged();

  viewMode: 'grid' | 'list' = 'grid';
  searchQuery: string = '';

  clientList: ClientInterface[] = [];
  filteredClients: ClientInterface[] = [];
  loadingData: boolean = false;

  defaultImageUrl: string = '../../../../assets/img/no-foto.png';

  clientTutorialVisible: boolean = false;

  videoModalRef: ModalRef | null = null;

  @ViewChild('videoModal') videoModal!: TemplateRef<any>;
  @ViewChild('reminderModal') reminderModal!: ModalComponent;

  private tutorialSubscription!: Subscription;

  constructor (
    private clientService: ClientProviderService,
    private tutorialService: TutorialService,
    private eventManager: EventManagerService,
    private router: Router,
    private navigationService: NavigationService,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('clientSelected');
    this.eventManager.clientSelected.set({});

    this.getClientList();
  }

  ngAfterViewInit(): void {
    if (this.user.withData) {
      const backRoute = this.navigationService.getBackRoute();
      // If the user has just logged in, show the reminder
      if (backRoute === '/login' || this.user.rejected) {
        this.tutorialService.finishTutorial();
        this.reminderModal.open();
      }
    }
    this.tutorialService.INITIAL_STEP = 2;
    this.tutorialSubscription = this.tutorialService.stepIndex$.subscribe(step => {
      if (!this.tutorialService.isTutorialFinished() && !this.reminderModal.isOpen) {
        this.startTutorial(step);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tutorialSubscription) {
      this.tutorialSubscription.unsubscribe();
    }
  }

  /**
  * Obtiene la lista de clientes del prestador que inicia sesión
  */
  getClientList() {
    this.loadingData = true;
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: ClientInterface[]) => {
        this.clientList = [...res];
        this.applyFilter();
        this.loadingData = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingData = false;
      },
      complete: () => {}
    });
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  applyFilter() {
    const query = this.searchQuery.toLowerCase().trim();
    if (query === '') {
      this.filteredClients = this.clientList;
      return;
    }
    this.filteredClients = this.clientList.filter(client =>
      client.clientHoneSolutions?.toLowerCase().includes(query)
    );
  }

  /**
  * Redirecciona a la lista de documentos por cargar del cliente seleccionado
  */
  changeOptionClient(item: any, activeTutorialStep: boolean = false) {
    if (activeTutorialStep) this.nextTutorialStep();
    localStorage.setItem('clientSelected', JSON.stringify(item));
    this.eventManager.getDataClient();
    this.router.navigateByUrl(`/service/documentation`);
  }


  /* Tutorial */

  startTutorial(step: number) {
    if (step === 1) {
      this.clientTutorialVisible = false;
      this.openVideoModal();
    } else if (step === 3) {
      this.clientTutorialVisible = true;
    } else {
      this.clientTutorialVisible = false;
    }
  }

  openVideoModal() {
    this.videoModalRef = this.modalService.open(this.videoModal, {
      title: 'Video presentación',
      showCloseButton: false,
      customSize: 'max-w-[727px]',
    });
    this.videoModalRef.onClose.subscribe(() => {
      this.nextTutorialStep();
    });
  }

  closeVideoModal() {
    this.videoModalRef?.close();
  }

  onCloseDataReminder() {
    if (this.user.rejected) {
      this.router.navigate(['/update-data']);
    }
  }

  backTutorialStep() {
    this.clientTutorialVisible = false;
    this.tutorialService.backStep();
  }

  nextTutorialStep() {
    this.clientTutorialVisible = false;
    this.tutorialService.nextStep();
  }

}
