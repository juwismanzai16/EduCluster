import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LaporanSiswaPageRoutingModule } from './laporan-siswa-routing.module';

import { LaporanSiswaPage } from './laporan-siswa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LaporanSiswaPageRoutingModule
  ],
  declarations: [LaporanSiswaPage]
})
export class LaporanSiswaPageModule {}
