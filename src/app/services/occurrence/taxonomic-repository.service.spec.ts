import { TestBed } from '@angular/core/testing';

import { TaxonomicRepositoryService } from './taxonomic-repository.service';

describe('TaxonomicRepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaxonomicRepositoryService = TestBed.get(TaxonomicRepositoryService);
    expect(service).toBeTruthy();
  });
});
