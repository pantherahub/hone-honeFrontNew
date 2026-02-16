import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { OverlayStateService } from 'src/app/services/overlay-state/overlay-state.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnChanges {

  @Input() visible = false;
  @Input() fullscreen = true;
  @Input() overlay = true;

  _visible = false;

  constructor(private overlayStateService: OverlayStateService) { }

  ngOnChanges(): void {
    this._visible = this.visible;

    if (!this.fullscreen) return;

    if (this.visible) {
      this.overlayStateService.addOverlay();
    } else {
      this.overlayStateService.removeOverlay();
      // setTimeout(() => (this._visible = false), 150);
    }
  }

}
