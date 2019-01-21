import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceFormComponent } from './occurrence-form.component';

describe('OccurrenceFormComponent', () => {
  let component: OccurrenceFormComponent;
  let fixture: ComponentFixture<OccurrenceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OccurrenceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
