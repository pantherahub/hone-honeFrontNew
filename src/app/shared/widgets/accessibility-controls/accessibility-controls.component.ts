import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { StorageKey } from 'src/app/enums/storage-key.enum';

@Component({
  selector: 'app-accessibility-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './accessibility-controls.component.html',
  styleUrl: './accessibility-controls.component.scss'
})
export class AccessibilityControlsComponent implements OnInit {

  private readonly STORAGE_KEY = StorageKey.FontScale;

  isOpen: boolean = false;
  isMobile: boolean = false;

  // Font scaling logic
  readonly MIN_SCALE_LEVEL: number = 0; // 100%
  readonly MAX_SCALE_LEVEL: number = 2; // 120%
  readonly SCALE_STEP: number = 10;     // 10% increases
  currentScaleLevel: number = 0;        // Current level (0, 1 or 2)

  @ViewChild('menuContainer') menuContainer!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadInitialScale();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  // Closes if clicked outside
  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target;

    if (
      target instanceof Node &&
      !this.menuContainer?.nativeElement.contains(target)
    ) {
      this.isOpen = false;
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 640; // sm breakpoint
  }

  private loadInitialScale() {
    const savedScale = localStorage.getItem(this.STORAGE_KEY);
    let scalePercent = 100;

    if (savedScale) {
      const parsed = parseInt(savedScale, 10);
      // Verify that it is within the allowed range (100 - 120)
      if (!isNaN(parsed) && parsed >= 100 && parsed <= 120) {
        scalePercent = parsed;
      } else if (parsed > 120) {
        scalePercent = 120;
      }
    }

    // Calculate the current level based on the percentage
    this.currentScaleLevel = (scalePercent - 100) / this.SCALE_STEP;
    this.applyFontScale(scalePercent);
  }

  setFontScale(isIncreasing: boolean) {
    if (isIncreasing && this.currentScaleLevel < this.MAX_SCALE_LEVEL) {
      this.currentScaleLevel++;
    } else if (!isIncreasing && this.currentScaleLevel > this.MIN_SCALE_LEVEL) {
      this.currentScaleLevel--;
    }

    const newPercent = 100 + (this.currentScaleLevel * this.SCALE_STEP);
    this.applyFontScale(newPercent);
    localStorage.setItem(this.STORAGE_KEY, newPercent.toString());
  }

  private applyFontScale(percent: number) {
    document.documentElement.style.fontSize = `${percent}%`;
  }

  toggleMenu() {
    if (this.isMobile) {
      this.isOpen = !this.isOpen;
    }
  }

  handleMouseEnter() {
    if (!this.isMobile) {
      this.isOpen = true;
    }
  }
  handleMouseLeave() {
    if (!this.isMobile) {
      this.isOpen = false;
    }
  }

}
