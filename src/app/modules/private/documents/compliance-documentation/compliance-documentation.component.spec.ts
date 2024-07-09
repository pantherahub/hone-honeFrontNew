import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDocumentationComponent } from './compliance-documentation.component';

describe('ComplianceDocumentationComponent', () => {
  let component: ComplianceDocumentationComponent;
  let fixture: ComponentFixture<ComplianceDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceDocumentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplianceDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
