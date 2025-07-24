import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgZorroModule } from '../../ng-zorro.module';
import { EventManagerService } from '../../services/events-manager/event-manager.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TutorialService } from 'src/app/services/tutorial/tutorial.service';
import { Subscription } from 'rxjs';
import { ButtonComponent } from "../components/button/button.component";

@Component({
   selector: 'app-header',
   standalone: true,
   imports: [NgZorroModule, CommonModule, RouterModule, ButtonComponent],
   templateUrl: './header.component.html',
   styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  public eventManager = inject(EventManagerService);
  public authService = inject(AuthService);
  public user = this.eventManager.userLogged();

  configTutorialVisible = false;

  private tutorialSubscription!: Subscription;

  constructor (
    private tutorialService: TutorialService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tutorialSubscription = this.tutorialService.stepIndex$.subscribe(step => {
      if (!this.tutorialService.isTutorialFinished() && step === 2) {
        this.showConfigTutorial();
      } else {
        this.configTutorialVisible = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.tutorialSubscription.unsubscribe();
  }

  showConfigTutorial() {
    this.configTutorialVisible = true;
  }

  nextTutorialStep() {
    this.configTutorialVisible = false;
    this.tutorialService.nextStep();
    if (!this.user.withData || this.user.rejected) {
      this.router.navigate(['/update-data']);
    }
  }

  navigateToUpdateData() {
    this.nextTutorialStep();
    this.router.navigate(['/update-data']);
  }

  /**
  * Calls the auth service to log out
  */
  logout() {
    this.authService.logout();
  }
}
