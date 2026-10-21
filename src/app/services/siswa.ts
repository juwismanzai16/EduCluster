import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Siswa {

  dataSiswa: any[] = [];

  // 🔥 TAMBAHAN (AMAN)
  hasilCluster: any[] = [];


  // 🔥 TAMBAHAN (AMAN)
  centroidAkhir: any[] = [];

  // 🔥 TAMBAHAN (AMAN)
  dataJarak: any[] = [];

  // 🔥 TAMBAHAN EVALUASI CLUSTER
nilaiDBI: number = 0;

  constructor() {}

  // tambah data siswa
  tambahData(siswa: any) {
    this.dataSiswa.push(siswa);
  }

  // ambil semua data siswa
  getData() {
    return this.dataSiswa;
  }

}