import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoLinkOccurrenceDialogComponent } from './photo-link-occurrence-dialog.component';

describe('PhotoLinkOccurrenceDialogComponent', () => {
  let component: PhotoLinkOccurrenceDialogComponent;
  let fixture: ComponentFixture<PhotoLinkOccurrenceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoLinkOccurrenceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoLinkOccurrenceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
