import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditDocumentComponent } from './modal-edit-document.component';

describe('ModalEditDocumentComponent', () => {
  let component: ModalEditDocumentComponent;
  let fixture: ComponentFixture<ModalEditDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEditDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalEditDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
