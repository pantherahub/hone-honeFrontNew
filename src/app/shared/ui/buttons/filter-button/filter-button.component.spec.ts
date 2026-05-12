import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterButtonComponent } from './filter-button.component';

describe('FilterButtonComponent', () => {
  let component: FilterButtonComponent;
  let fixture: ComponentFixture<FilterButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect active filters', () => {
    component.activeCount = 2;

    expect(component.hasActiveFilters).toBeTrue();
  });

  it('should emit open filters', () => {
    spyOn(component.openFilters, 'emit');

    component.onOpenFilters();

    expect(component.openFilters.emit).toHaveBeenCalled();
  });

  it('should emit clear filters', () => {
    spyOn(component.clearFilters, 'emit');
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.onClearFilters(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.clearFilters.emit).toHaveBeenCalled();
  });
});
