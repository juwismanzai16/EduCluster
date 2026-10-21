import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaporanSiswaPage } from './laporan-siswa.page';

describe('LaporanSiswaPage', () => {
  let component: LaporanSiswaPage;
  let fixture: ComponentFixture<LaporanSiswaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LaporanSiswaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
