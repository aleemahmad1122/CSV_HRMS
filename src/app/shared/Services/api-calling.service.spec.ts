import { TestBed } from '@angular/core/testing';

import { ApiCallingService } from './api-calling.service';

describe('ApiCallingService', () => {
  let service: ApiCallingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCallingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
