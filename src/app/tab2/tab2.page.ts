import { Component } from '@angular/core';
import { Siswa } from '../services/siswa';
import { ApiService } from '../services/api';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  nama: string = '';
  nisn: string = '';

  agama: number = 0;
  ppkn: number = 0;
  indo: number = 0;
  inggris: number = 0;
  mtk: number = 0;
  ipas: number = 0;
  pjok: number = 0;
  seni: number = 0;

  // ===============================
  // DATA DARI DATABASE
  // ===============================

  dataSiswa: any[] = [];

  // ===============================
  // PENCARIAN DATA
  // ===============================

  kataCari: string = '';

  // ===============================
  // DATA YANG DIPILIH
  // ===============================

  selectedId: number | null = null;

  // ===============================
  // TAMPIL FORM
  // ===============================

  tampilForm: boolean = false;

  // ===============================
  // IMPORT DATA EXCEL
  // ===============================

  namaFileExcel: string = '';

  dataExcel: any[] = [];

  // ===============================
  // TAMPIL PREVIEW
  // ===============================

  tampilPreview: boolean = false;


  // ===============================
  // CONSTRUCTOR
  // ===============================

  constructor(
    public siswaService: Siswa,
    private api: ApiService,
    private router: Router
  ) {}


  // ===============================
  // AMBIL DATA DARI DATABASE
  // ===============================

  ionViewWillEnter() {

    this.api.getData().subscribe({

      next: (res: any) => {

        this.dataSiswa = [...res];

        // Simpan juga ke service
        // supaya Tab 3 dan Tab 4 memakai data terbaru

        this.siswaService.dataSiswa = res;

        console.log(
          'DATA SISWA:',
          this.dataSiswa
        );

      },

      error: (err) => {

        console.error(
          'ERROR MENGAMBIL DATA:',
          err
        );

      }

    });

  }


  // ===============================
  // PILIH FILE EXCEL
  // ===============================

  pilihFileExcel(event: any) {

    const file = event.target.files[0];

    // Jika tidak ada file

    if (!file) {
      return;
    }


    // Simpan nama file

    this.namaFileExcel = file.name;


    console.log(
      'FILE EXCEL:',
      file.name
    );


    // Membaca file Excel

    const reader = new FileReader();


    reader.onload = (e: any) => {

      try {

        const data = new Uint8Array(
          e.target.result
        );


        const workbook = XLSX.read(
          data,
          {
            type: 'array'
          }
        );


        // Pastikan ada sheet

        if (
          !workbook.SheetNames ||
          workbook.SheetNames.length === 0
        ) {

          alert(
            'File Excel tidak memiliki sheet.'
          );

          this.namaFileExcel = '';
          this.dataExcel = [];

          return;

        }


        // Ambil sheet pertama

        const namaSheet =
          workbook.SheetNames[0];


        const worksheet =
          workbook.Sheets[namaSheet];


        // Ubah Excel menjadi array object

        const hasil =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              defval: ''
            }
          );


        // Pastikan ada data

        if (hasil.length === 0) {

          alert(
            'File Excel tidak memiliki data.'
          );

          this.namaFileExcel = '';
          this.dataExcel = [];

          return;

        }


        // Simpan data Excel

        this.dataExcel = hasil;


        console.log(
          'DATA EXCEL:',
          this.dataExcel
        );


        // Pastikan preview ditutup
        // setiap kali memilih file baru

        this.tampilPreview = false;


        alert(
          'File Excel berhasil dibaca.\n' +
          'Jumlah data: ' +
          this.dataExcel.length
        );

      }

      catch (error) {

        console.error(
          'ERROR MEMBACA EXCEL:',
          error
        );


        alert(
          'File Excel tidak dapat dibaca.'
        );


        this.namaFileExcel = '';

        this.dataExcel = [];

        this.tampilPreview = false;

      }

    };


    reader.readAsArrayBuffer(file);

  }


  // ===============================
  // BUKA PREVIEW
  // ===============================

  bukaPreview() {

    if (
      this.dataExcel.length === 0
    ) {

      alert(
        'Belum ada data Excel yang dipilih.'
      );

      return;

    }


    this.tampilPreview = true;

  }


  // ===============================
  // IMPORT EXCEL KE DATABASE
  // ===============================

  importKeDatabase() {

    // Pastikan ada data Excel

    if (
      this.dataExcel.length === 0
    ) {

      alert(
        'Belum ada data Excel untuk diimport.'
      );

      return;

    }


    // Konfirmasi sebelum mengganti
    // data yang ada di database

    if (
      !confirm(
        'Data Excel akan menggantikan data siswa yang ada di database. Lanjutkan?'
      )
    ) {

      return;

    }


    // Ambil ID admin yang sedang login

    const idAdmin =
      Number(
        localStorage.getItem(
          'id_admin'
        )
      ) || null;


    // Tampilkan data yang akan dikirim

    console.log(
      'ID ADMIN:',
      idAdmin
    );


    console.log(
      'DATA EXCEL:',
      this.dataExcel
    );


    // Kirim data Excel + ID admin
    // ke ApiService

    this.api
      .importExcel(
        this.dataExcel,
        idAdmin
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'RESPONS IMPORT:',
            res
          );


          if (
            res.status === true
          ) {

            alert(
              'Data Excel berhasil diimport ke database.'
            );


            // Ambil ulang data dari database
            // agar tabel langsung berubah

            this.ionViewWillEnter();


            // Tutup preview

            this.tampilPreview = false;


            // Bersihkan data Excel

            this.namaFileExcel = '';

            this.dataExcel = [];

          }

          else {

            alert(
              res.message ||
              'Data Excel gagal diimport.'
            );

          }

        },


        error: (err) => {

          console.error(
            'ERROR IMPORT:',
            err
          );


          alert(
            'Gagal menghubungkan data Excel dengan database.'
          );

        }

      });

  }


  // ===============================
  // SIMPAN DATA SISWA
  // ===============================

  tambahData() {

    const data = {

      nama: this.nama,
      nisn: this.nisn,

      agama: this.agama,
      ppkn: this.ppkn,
      indo: this.indo,
      inggris: this.inggris,
      mtk: this.mtk,
      ipas: this.ipas,
      pjok: this.pjok,
      seni: this.seni

    };


    this.api.simpanData(data).subscribe({

      next: (res: any) => {

        console.log(res);


        alert(
          'Data berhasil disimpan ke database'
        );


        // Ambil ulang data

        this.ionViewWillEnter();


        // Bersihkan form

        this.resetForm();

      },


      error: (err) => {

        console.error(err);


        alert(
          'Gagal menyimpan data'
        );

      }

    });

  }


  // ===============================
  // RESET FORM
  // ===============================

  resetForm() {

    this.nama = '';
    this.nisn = '';

    this.agama = 0;
    this.ppkn = 0;
    this.indo = 0;
    this.inggris = 0;
    this.mtk = 0;
    this.ipas = 0;
    this.pjok = 0;
    this.seni = 0;

    this.selectedId = null;

  }


  // ===============================
  // PILIH DATA SISWA
  // ===============================

  pilihData(siswa: any) {

    this.selectedId =
      Number(siswa.id);


    this.nama =
      siswa.Nama;


    this.nisn =
      siswa.Nisn;


    this.agama =
      Number(siswa.Agama);


    this.ppkn =
      Number(siswa.PPKN);


    this.indo =
      Number(siswa.BIndonesia);


    this.inggris =
      Number(siswa.Binggris);


    this.mtk =
      Number(siswa.MTK);


    this.ipas =
      Number(siswa.IPAS);


    this.pjok =
      Number(siswa.PJOK);


    this.seni =
      Number(siswa.Seni);

  }


  // ===============================
  // HAPUS DATA
  // ===============================

  hapusSemua() {

    if (
      this.selectedId == null
    ) {

      alert(
        'Pilih data yang akan dihapus terlebih dahulu'
      );

      return;

    }


    if (
      !confirm(
        'Apakah Anda yakin ingin menghapus data ini?'
      )
    ) {

      return;

    }


    this.api
      .hapusData(this.selectedId)
      .subscribe({

        next: (res: any) => {

          alert(
            'Data berhasil dihapus'
          );


          // Ambil ulang data

          this.ionViewWillEnter();


          // Bersihkan form

          this.resetForm();

        },


        error: (err) => {

          console.error(err);


          alert(
            'Gagal menghapus data'
          );

        }

      });

  }


  // ===============================
  // EDIT DATA
  // ===============================

  editMode() {

    if (
      this.selectedId == null
    ) {

      alert(
        'Pilih data terlebih dahulu'
      );

      return;

    }


    const data = {

      id: this.selectedId,

      nama: this.nama,
      nisn: this.nisn,

      agama: this.agama,
      ppkn: this.ppkn,
      indo: this.indo,
      inggris: this.inggris,
      mtk: this.mtk,
      ipas: this.ipas,
      pjok: this.pjok,
      seni: this.seni,

      id_admin:
        Number(
          localStorage.getItem(
            'id_admin'
          )
        )

    };


    this.api
      .editData(data)
      .subscribe({

        next: (res: any) => {

          alert(
            'Data berhasil diubah'
          );


          this.ionViewWillEnter();


          this.resetForm();


          this.selectedId = null;

        },


        error: (err) => {

          console.error(err);


          alert(
            'Gagal mengubah data'
          );

        }

      });

  }


  // ===============================
  // TAMPIL ATAU SEMBUNYIKAN FORM
  // ===============================

  toggleForm() {

    this.tampilForm =
      !this.tampilForm;

  }


  // ===============================
  // PENCARIAN DATA SISWA
  // ===============================

  cariData() {

    const keyword =
      this.kataCari
        .trim()
        .toLowerCase();


    // Jika pencarian kosong

    if (
      keyword === ''
    ) {

      this.dataSiswa =
        [...this.dataSiswa];

      return;

    }


    // Salin data

    this.dataSiswa =
      [...this.dataSiswa];


    // Urutkan hasil pencarian

    this.dataSiswa.sort(
      (a: any, b: any) => {

        const aCocok =
          a.Nama
            .toLowerCase()
            .includes(keyword) ||

          a.Nisn
            .toString()
            .includes(keyword);


        const bCocok =
          b.Nama
            .toLowerCase()
            .includes(keyword) ||

          b.Nisn
            .toString()
            .includes(keyword);


        if (
          aCocok &&
          !bCocok
        ) {

          return -1;

        }


        if (
          !aCocok &&
          bCocok
        ) {

          return 1;

        }


        return 0;

      }
    );

  }


  // ===============================
  // PROSES DATA
  // ===============================

  prosesData() {

    this.router.navigate(
      ['/tabs/tab3']
    );

  }

}