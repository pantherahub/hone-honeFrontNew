import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClientInterface } from '../../../models/client.interface';
import { ClientProviderService } from '../../../services/client-provider/client-provider.service';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Subscription } from 'rxjs';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { PopoverComponent } from 'src/app/shared/components/popover/popover.component';
import { ModalService } from 'src/app/services/modal/modal.service';
import { FormsModule } from '@angular/forms';
import { TutorialVideoComponent } from 'src/app/shared/modals/tutorial-video/tutorial-video.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, TextInputComponent, ButtonComponent, ModalComponent, PopoverComponent],
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

  @ViewChild('reminderModal') reminderModal!: ModalComponent;

  private tutorialSubscription!: Subscription;

  constructor(
    private clientService: ClientProviderService,
    private tutorialService: TutorialService,
    private eventManager: EventManagerService,
    private router: Router,
    private navigationService: NavigationService,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.eventManager.clearClient();

    this.setDefaultViewMode();
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

  private isMobileView(): boolean {
    return window.innerWidth < 640; // sm breakpoint
  }

  private setDefaultViewMode() {
    const saved = this.eventManager.viewMode();
    if (saved) {
      this.viewMode = saved; // User preference
    } else {
      this.viewMode = this.isMobileView()
        ? 'list'
        : 'grid';
    }
  }

  /**
  * Gets the list of clients of the provider who logs in
  */
  getClientList() {
    this.loadingData = true;
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: ClientInterface[]) => {
        this.clientList = [...res];
        this.applyFilter();

        if (!this.eventManager.viewMode() && this.clientList.length > 6) {
          this.viewMode = 'list';
        }
        this.loadingData = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingData = false;
      },
      complete: () => { }
    });
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
    this.eventManager.setViewMode(mode);
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
    this.eventManager.setClient(item);
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
    const videoModalRef = this.modalService.open(TutorialVideoComponent, {
      title: 'Video presentación',
      showCloseButton: false,
      customSize: 'max-w-[727px]',
    }, {
      isTutorial: true,
    });
    videoModalRef.onClose.subscribe(() => {
      this.nextTutorialStep();
    });
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
