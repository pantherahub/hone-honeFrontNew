import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopoverStateService {

  private highlightedCount = 0;

  constructor() { }

  addHighlight() {
    this.highlightedCount++;
    if (this.highlightedCount === 1) {
      document.body.classList.add('overflow-hidden');
    }
  }

  removeHighlight() {
    // this.highlightedCount = Math.max(0, this.highlightedCount - 1);
    this.highlightedCount = Math.max(this.highlightedCount - 1, 0);
    if (this.highlightedCount === 0) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  reset() {
    this.highlightedCount = 0;
    document.body.classList.remove('overflow-hidden');
  }

}
