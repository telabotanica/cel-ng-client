import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoFiltersComponent } from './photo-filters.component';

describe('PhotoFiltersComponent', () => {
  let component: PhotoFiltersComponent;
  let fixture: ComponentFixture<PhotoFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
