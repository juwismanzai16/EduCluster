import { TestBed } from '@angular/core/testing';

import { Siswa } from './siswa';

describe('Siswa', () => {
  let service: Siswa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Siswa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
