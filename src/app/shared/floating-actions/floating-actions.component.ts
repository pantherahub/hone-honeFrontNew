import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';
import { NavigationService } from 'src/app/services/navigation/navigation.service';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Router } from '@angular/router';
import { EventManagerService } from 'src/app/services/events-manager/event-manager.service';
import { isNonEmptyObject } from 'src/app/utils/validation-utils';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal/modal.service';
import { TutorialVideoComponent } from '../modals/tutorial-video/tutorial-video.component';
import { Subscription } from 'rxjs';
import { PopoverComponent } from '../components/popover/popover.component';

interface CustomerSchedulingData {
  clientHoneSolutions: string;
  schedulingLink: string;
}

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PopoverComponent],
  templateUrl: './floating-actions.component.html',
  styleUrl: './floating-actions.component.scss'
})
export class FloatingActionsComponent implements OnInit, OnDestroy {

  showSupportAction: boolean = false;
  showTutorialAction: boolean = false;
  showMeetingAction: boolean = false;
  showTutorialVideoAction: boolean = false;

  excludedRoutes: string[] = [
    'page-not-found',
  ];

  clientSelected: any;
  customerScheduling = new Map<number, CustomerSchedulingData>([
    [8, {
      clientHoneSolutions: 'Axa Colpatria',
      schedulingLink: 'https://outlook.office.com/book/AgendaAxaColpatria@hone-solutions.com/?ismsaljsauthenabled',
    }],
    // [13, {
    //   clientHoneSolutions: 'Sura',
    //   schedulingLink: 'https://outlook.office.com/book/AgendaSura@hone-solutions.com/?ismsaljsauthenabled',
    // }],
  ]);

  private tutorialSubscription!: Subscription;
  menuTutorialVisible: boolean = false;

  constructor(
    private navigationService: NavigationService,
    private tutorialService: TutorialService,
    private router: Router,
    private eventManager: EventManagerService,
    private authService: AuthService,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.navigationService.getCurrentUrl$().subscribe(
      currentUrl => {
        this.clientSelected = this.eventManager.clientSelected();
        this.optionsVisibility(currentUrl ?? '');
      }
    );

    this.tutorialSubscription = this.tutorialService.stepIndex$.subscribe(
      step => {
        if (!this.tutorialService.isTutorialFinished() && step === 4) {
          this.showMenuTutorial();
        } else {
          this.menuTutorialVisible = false;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.tutorialSubscription.unsubscribe();
  }

  showMenuTutorial() {
    this.menuTutorialVisible = this.authService.isAuthenticated();
  }

  backTutorialStep() {
    this.menuTutorialVisible = false;
    this.tutorialService.backStep();
  }
  nextTutorialStep() {
    if (this.menuTutorialVisible) {
      this.menuTutorialVisible = false;
      this.tutorialService.nextStep();
    }
  }

  optionsVisibility(currentUrl: string) {
    if (!currentUrl || this.excludedRoutes.includes(currentUrl)) {
      this.showSupportAction = false;
      this.showTutorialAction = false;
      this.showMeetingAction = false;
      this.showTutorialVideoAction = false;
      return;
    }

    this.showSupportAction = !['/auth-support', '/support'].includes(currentUrl);
    this.showTutorialAction = currentUrl === '/home';
    this.showMeetingAction = currentUrl.startsWith('/service')
      && isNonEmptyObject(this.clientSelected)
      && !!this.customerScheduling.get(this.clientSelected.idClientHoneSolutions);
    this.showTutorialVideoAction = this.authService.isAuthenticated() && currentUrl !== '/home';
  }

  onSupport() {
    if (this.authService.isAuthenticated()) {
      this.nextTutorialStep();
      this.router.navigate(['/support']);
      return;
    }
    this.router.navigate(['/auth-support']);
  }

  onTutorial() {
    this.tutorialService.resetTutorial();
  }

  onMeeting() {
    if (!isNonEmptyObject(this.clientSelected)) return;
    this.nextTutorialStep();

    const clientId: number = this.clientSelected.idClientHoneSolutions;
    const scheduling = this.customerScheduling.get(clientId);

    if (!scheduling) {
      console.warn('No hay link de agendamiento para este cliente');
      return;
    }

    window.open(scheduling.schedulingLink, '_blank');
  }

  onTutorialVideo() {
    this.nextTutorialStep();
    this.modalService.open(TutorialVideoComponent, {
      title: 'Video presentación',
      customSize: 'max-w-[727px]',
    });
  }

}
