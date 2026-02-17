import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { DropdownTriggerDirective } from 'src/app/directives/dropdown-trigger.directive';
import { BreadcrumbOption } from 'src/app/interfaces/breadcrump';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, DropdownTriggerDirective],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  @Input({ required: true }) options: BreadcrumbOption[] = [];
  @Input() showFirstOptionSeparated: boolean = false;

  // Unique ID for the component instance
  private static nextId: number = 0;
  public readonly dropdownId: string = `dropdown-breadcrumb-${BreadcrumbComponent.nextId++}`;

  /**
   * Filter the middle options that are clickable for the mobile dropdown
   * The first and the last are excluded.
   */
  get middleClickableOptions() {
    if (this.options.length <= 1) return [];

    const start = this.showFirstOptionSeparated ? 1 : 0;
    return this.options
      .slice(start, -1)
      .filter(opt => !!opt.routerLink);
  }

}
