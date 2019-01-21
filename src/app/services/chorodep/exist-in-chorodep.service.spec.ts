import { TestBed } from '@angular/core/testing';

import { ExistInChorodepService } from './exist-in-chorodep.service';

describe('ExistInChorodepService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExistInChorodepService = TestBed.get(ExistInChorodepService);
    expect(service).toBeTruthy();
  });
});
