import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  url = 'http://localhost/educluster_api/';

  constructor(private http: HttpClient) { }


  // =====================================
  // MENYIMPAN DATA SISWA
  // =====================================

  simpanData(data: any) {

    return this.http.post(
      this.url + 'simpan.php',
      data
    );

  }


  // =====================================
  // MENGAMBIL SEMUA DATA SISWA
  // =====================================

  getData() {

    return this.http.get(
      this.url + 'tampil.php'
    );

  }


  // =====================================
  // MENGUBAH DATA SISWA
  // =====================================

  editData(data: any) {

    return this.http.post(
      this.url + 'edit.php',
      data
    );

  }


  // =====================================
  // MENGHAPUS DATA SISWA
  // =====================================

  hapusData(id: number) {

    return this.http.post(
      this.url + 'hapus.php',
      { id }
    );

  }


  // =====================================
  // IMPORT DATA EXCEL
  // =====================================

  importExcel(
    data: any[],
    idAdmin: number | null
  ) {

    return this.http.post(
      this.url + 'import_excel.php',
      {
        data: data,
        id_admin: idAdmin
      }
    );

  }


  // =====================================
  // MENYIMPAN HASIL CLUSTERING
  // =====================================

  simpanClustering(data: any) {

    return this.http.post(
      this.url + 'simpan_clustering.php',
      data
    );

  }

}