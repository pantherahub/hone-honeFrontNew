import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate range values', () => {
    component.currentPage = 2;
    component.itemsPerPage = 5;
    component.totalItems = 12;

    expect(component.startRange).toBe(6);
    expect(component.endRange).toBe(10);
    expect(component.totalPages).toBe(3);
  });

  it('should emit page changes', () => {
    spyOn(component.pageChange, 'emit');
    component.totalItems = 12;
    component.itemsPerPage = 5;

    component.selectPage(2);

    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });
});
