import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClientInterface } from '../../../interfaces/client.interface';
import { ClientProviderService } from '../../../services/client-provider/client-provider.service';
import { EventManagerService } from '../../../services/events-manager/event-manager.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { catchError, finalize, Observable, of, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { TextInputComponent } from 'src/app/shared/components/text-input/text-input.component';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { ModalComponent } from 'src/app/shared/components/modal/modal.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { PopoverComponent } from 'src/app/shared/components/popover/popover.component';
import { ModalService } from 'src/app/services/modal/modal.service';
import { FormsModule } from '@angular/forms';
import { TutorialVideoComponent } from 'src/app/shared/modals/tutorial-video/tutorial-video.component';
import { DisclaimerService } from 'src/app/services/disclaimer/disclaimer.service';
import { Disclaimer } from 'src/app/interfaces/disclaimer.interface';
import { DisclaimerFormComponent } from 'src/app/shared/modals/disclaimer-form/disclaimer-form.component';

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

  loading: boolean = false;
  loadingClients: boolean = false;

  clientList: ClientInterface[] = [];
  filteredClients: ClientInterface[] = [];
  providerDisclaimer: Disclaimer | null = null;

  defaultImageUrl: string = 'assets/img/no-foto.png';

  clientTutorialVisible: boolean = false;

  @ViewChild('reminderModal') reminderModal!: ModalComponent;

  private destroy$ = new Subject<void>();
  private disclaimerReady$ = new ReplaySubject<void>(1);

  constructor(
    private clientService: ClientProviderService,
    private tutorialService: TutorialService,
    private eventManager: EventManagerService,
    private router: Router,
    private navigationService: NavigationService,
    private modalService: ModalService,
    private disclaimerService: DisclaimerService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.eventManager.clearClient();

    this.setDefaultViewMode();
    this.getClientList();

    this.loading = true;
    this.getProviderDisclaimer$()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe(() => {
        this.disclaimerReady$.next();
      });
  }

  ngAfterViewInit(): void {
    this.disclaimerReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.startInitialFlow();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.loadingClients = true;
    this.clientService.getClientListByProviderId(this.user.id).subscribe({
      next: (res: ClientInterface[]) => {
        this.clientList = [...res];
        this.applyFilter();

        if (!this.eventManager.viewMode() && this.clientList.length > 6) {
          this.viewMode = 'list';
        }
        this.loadingClients = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loadingClients = false;
      },
      complete: () => { }
    });
  }

  private getProviderDisclaimer$(): Observable<void> {
    const idProvider = this.user?.id;
    if (!idProvider) return of(void 0);

    const disclaimerKey = this.route.snapshot.data['disclaimerKey'];
    return this.disclaimerService
      .getDisclaimer(disclaimerKey, idProvider)
      .pipe(
        tap((resp: any) => {
          const data = resp?.data;
          this.providerDisclaimer =
            data?.canRespond && data?.disclaimer
              ? data.disclaimer
              : null;
        }),
        catchError(err => {
          console.error(err);
          this.providerDisclaimer = null;
          return of(void 0);
        })
      );
  }

  private startInitialFlow(): void {
    if (this.providerDisclaimer) {
      this.openProviderDisclaimer();
      return;
    }

    this.startMainFlow();
  }

  private openProviderDisclaimer(): void {
    if (!this.providerDisclaimer) return;
    const modal = this.modalService.open(DisclaimerFormComponent, {
      title: 'Confirmación requerida',
      closable: false,
    }, {
      disclaimer: this.providerDisclaimer,
    });

    modal.onClose.subscribe(() => {
      this.startMainFlow();
    });
  }

  private startMainFlow(): void {
    this.checkReminder();
    this.initTutorialListener();
  }

  private checkReminder(): void {
    if (!this.user.withData) return;

    // If the user has just logged in, show the reminder
    const backRoute = this.navigationService.getBackRoute();
    if (backRoute === '/login' || this.user.rejected) {
      this.tutorialService.finishTutorial();
      this.reminderModal.open();
    }
  }

  private initTutorialListener(): void {
    this.tutorialService.stepIndex$
      .pipe(takeUntil(this.destroy$))
      .subscribe(step => {
        if (
          !this.tutorialService.isTutorialFinished() &&
          !this.reminderModal.isOpen
        ) {
          this.startTutorial(step);
        }
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
  * Redirect to client services module
  */
  changeOptionClient(item: any, activeTutorialStep: boolean = false) {
    this.eventManager.setClient(item);
    this.router.navigateByUrl(`/service/documentation`).then(() => {
      if (activeTutorialStep) this.nextTutorialStep();
    });
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
