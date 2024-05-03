import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsProviderComponent } from './contacts-provider.component';

describe('ContactsProviderComponent', () => {
  let component: ContactsProviderComponent;
  let fixture: ComponentFixture<ContactsProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsProviderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactsProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
