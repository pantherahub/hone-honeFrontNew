import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private readonly INITIAL_STEP = 1;
  private readonly LAST_STEP = 3;
  private stepIndex = new BehaviorSubject<number>(this.getStoredStep());
  stepIndex$ = this.stepIndex.asObservable();
  // stepIndex$ = this.stepIndex.asObservable().pipe(distinctUntilChanged());

  private getStoredStep(): number {
    return Number(localStorage.getItem('tutorialStep')) || this.INITIAL_STEP;
  }

  private saveStep(step: number) {
    localStorage.setItem('tutorialStep', step.toString());
  }

  setStep(step: number) {
    if (step > this.LAST_STEP) {
      this.finishTutorial();
      return;
    }
    if (this.isTutorialFinished()) this.clearTutorial();
    this.stepIndex.next(step);
    this.saveStep(step);
  }

  nextStep() {
    const newStep = this.stepIndex.value + 1;
    this.setStep(newStep);
  }

  private clearTutorial() {
    localStorage.removeItem('tutorialStep');
    localStorage.removeItem('tutorialFinished');
  }

  resetTutorial() {
    this.clearTutorial();
    this.setStep(this.INITIAL_STEP);
  }

  finishTutorial() {
    localStorage.setItem('tutorialFinished', 'true');
  }

  isTutorialFinished(): boolean {
    return localStorage.getItem('tutorialFinished') === 'true';
  }

}
