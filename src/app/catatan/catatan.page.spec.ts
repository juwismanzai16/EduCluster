import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatatanPage } from './catatan.page';

describe('CatatanPage', () => {
  let component: CatatanPage;
  let fixture: ComponentFixture<CatatanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CatatanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
