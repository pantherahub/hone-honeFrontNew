import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialVideoComponent } from './tutorial-video.component';

describe('TutorialVideoComponent', () => {
  let component: TutorialVideoComponent;
  let fixture: ComponentFixture<TutorialVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialVideoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TutorialVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
