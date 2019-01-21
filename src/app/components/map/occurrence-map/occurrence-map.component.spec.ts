import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceMapComponent } from './occurrence-map.component';

describe('OccurrenceMapComponent', () => {
  let component: OccurrenceMapComponent;
  let fixture: ComponentFixture<OccurrenceMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OccurrenceMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OccurrenceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
