import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoShareDialogComponent } from './photo-share-dialog.component';

describe('PhotoShareDialogComponent', () => {
  let component: PhotoShareDialogComponent;
  let fixture: ComponentFixture<PhotoShareDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoShareDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
