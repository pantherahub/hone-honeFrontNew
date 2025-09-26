import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OverlayStateService {

  // Component counting with open overlay
  private count = 0;

  constructor() { }

  addOverlay() {
    this.count++;
    if (this.count === 1) {
      document.body.classList.add('overflow-hidden');
    }
  }

  removeOverlay() {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      document.body.classList.remove('overflow-hidden');
    }
  }

  get activeCount() {
    return this.count;
  }

}
