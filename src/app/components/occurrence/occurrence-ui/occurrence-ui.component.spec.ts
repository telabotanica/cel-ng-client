import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceUiComponent } from './occurrence-ui.component';

describe('OccurrenceUiComponent', () => {
  let component: OccurrenceUiComponent;
  let fixture: ComponentFixture<OccurrenceUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OccurrenceUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
