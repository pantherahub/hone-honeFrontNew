import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private readonly LAST_STEP = 3;
  private stepIndex = new BehaviorSubject<number>(this.getStoredStep());
  stepIndex$ = this.stepIndex.asObservable();

  private getStoredStep(): number {
    return Number(localStorage.getItem('tutorialStep')) || 1;
  }

  private saveStep(step: number) {
    localStorage.setItem('tutorialStep', step.toString());
  }

  setStep(step: number) {
    if (step > this.LAST_STEP) {
      this.finishTutorial();
      return;
    }
    if (this.isTutorialFinished()) this.resetTutorial();
    this.stepIndex.next(step);
    this.saveStep(step);
  }

  nextStep() {
    const newStep = this.stepIndex.value + 1;
    this.setStep(newStep);
  }

  resetTutorial() {
    localStorage.removeItem('tutorialStep');
    localStorage.removeItem('tutorialFinished');
  }

  finishTutorial() {
    localStorage.setItem('tutorialFinished', 'true');
  }

  isTutorialFinished(): boolean {
    return localStorage.getItem('tutorialFinished') === 'true';
  }

}
