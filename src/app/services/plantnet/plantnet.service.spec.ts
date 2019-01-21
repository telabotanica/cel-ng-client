import { TestBed } from '@angular/core/testing';

import { PlantnetService } from './plantnet.service';

describe('PlantnetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlantnetService = TestBed.get(PlantnetService);
    expect(service).toBeTruthy();
  });
});
