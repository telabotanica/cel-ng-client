import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoDisplayDialogComponent } from './photo-display-dialog.component';

describe('PhotoDisplayDialogComponent', () => {
  let component: PhotoDisplayDialogComponent;
  let fixture: ComponentFixture<PhotoDisplayDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoDisplayDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoDisplayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
