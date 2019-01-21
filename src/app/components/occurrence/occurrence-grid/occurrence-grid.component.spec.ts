import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceGridComponent } from './occurrence-grid.component';

describe('OccurrenceGridComponent', () => {
  let component: OccurrenceGridComponent;
  let fixture: ComponentFixture<OccurrenceGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OccurrenceGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
