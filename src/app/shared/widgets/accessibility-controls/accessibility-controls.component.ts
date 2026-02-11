import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-accessibility-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './accessibility-controls.component.html',
  styleUrl: './accessibility-controls.component.scss'
})
export class AccessibilityControlsComponent implements OnInit {

  isOpen: boolean = false;
  isMobile = false;

  // Lógica de escala
  readonly MIN_SCALE_LEVEL = 0; // 100%
  readonly MAX_SCALE_LEVEL = 2; // 120%
  readonly SCALE_STEP = 10;     // Aumentos de 10%
  currentScaleLevel = 0;        // Nivel actual (0, 1 o 2)

  @ViewChild('menuContainer') menuContainer!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadInitialScale();

    // const scale = localStorage.getItem('font-scale') || '100';
    // document.documentElement.style.fontSize = `${scale}%`;
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
    const savedScale = localStorage.getItem('font-scale');
    let scalePercent = 100;

    if (savedScale) {
      const parsed = parseInt(savedScale, 10);
      // Validamos que sea un número y esté dentro del rango permitido (100 - 120)
      if (!isNaN(parsed) && parsed >= 100 && parsed <= 120) {
        scalePercent = parsed;
      } else if (parsed > 120) {
        scalePercent = 120; // Si el usuario puso 500% en el storage, lo limitamos
      }
    }

    // Calculamos el nivel actual basado en el porcentaje
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
    localStorage.setItem('font-scale', newPercent.toString());
  }

  private applyFontScale(percent: number) {
    document.documentElement.style.fontSize = `${percent}%`;
  }

  // setFontScale(percent: number) {
  //   document.documentElement.style.fontSize = `${percent}%`;
  //   localStorage.setItem('font-scale', percent.toString());
  // }

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
