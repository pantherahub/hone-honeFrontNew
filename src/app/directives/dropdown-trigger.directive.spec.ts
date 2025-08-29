import { ElementRef } from '@angular/core';
import { DropdownTriggerDirective } from './dropdown-trigger.directive';

describe('DropdownTriggerDirective', () => {
  it('should create an instance', () => {
    const elementRefMock = new ElementRef(document.createElement('div'));
    const directive = new DropdownTriggerDirective(elementRefMock);
    expect(directive).toBeTruthy();
  });
});
