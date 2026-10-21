import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LaporanSiswaPage } from './laporan-siswa.page';

const routes: Routes = [
  {
    path: '',
    component: LaporanSiswaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaporanSiswaPageRoutingModule {}
