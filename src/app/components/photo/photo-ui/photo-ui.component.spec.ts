import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoUiComponent } from './photo-ui.component';

describe('PhotoUiComponent', () => {
  let component: PhotoUiComponent;
  let fixture: ComponentFixture<PhotoUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
