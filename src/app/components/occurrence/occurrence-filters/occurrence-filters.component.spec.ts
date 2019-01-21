import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceFiltersComponent } from './occurrence-filters.component';

describe('OccurrenceFiltersComponent', () => {
  let component: OccurrenceFiltersComponent;
  let fixture: ComponentFixture<OccurrenceFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OccurrenceFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
