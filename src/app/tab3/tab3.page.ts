import { Component } from '@angular/core';
import { Siswa } from '../services/siswa';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  dataSiswa: any[] = [];
  hasilCluster: any[] = [];

  jumlahData: number = 0;
  jumlahCluster: number = 3;

  centroidAwal: number[][] = [];
  centroidAkhir: number[][] = [];

  riwayatIterasi: any[] = [];
  jumlahIterasi: number = 0;

  dataJarak: any[] = [];

  // ===============================
  // NAMA MATA PELAJARAN
  // ===============================

  namaMapel = [
    'Agama',
    'PPKn',
    'B.Indonesia',
    'B.Inggris',
    'MTK',
    'IPAS',
    'PJOK',
    'Seni'
  ];

  // ===============================
  // UNTUK MENJAGA CENTROID TETAP KONSISTEN
  // ===============================

  sudahInisialisasi: boolean = false;

  constructor(
    private siswaService: Siswa,
    private api: ApiService
  ) {}

  // ===============================
  // LOAD DATA
  // ===============================

  ionViewWillEnter() {

    this.api.getData().subscribe({

      next: (res: any) => {

        this.dataSiswa = res;
        this.jumlahData = this.dataSiswa.length;

        this.siswaService.dataSiswa = res;

        console.log('Jumlah Data :', this.jumlahData);
        console.log(this.dataSiswa);

      },

      error: (err) => {
        console.error(err);
      }

    });

  }

  // ===============================
  // AMBIL NILAI
  // ===============================

  ambilNilai(siswa: any): number[] {

    return [
      Number(siswa.Agama),
      Number(siswa.PPKN),
      Number(siswa.BIndonesia),
      Number(siswa.Binggris),
      Number(siswa.MTK),
      Number(siswa.IPAS),
      Number(siswa.PJOK),
      Number(siswa.Seni)
    ];

  }

  // ===============================
  // HITUNG JARAK EUCLIDEAN
  // ===============================

  hitungJarak(
    a: number[],
    b: number[]
  ): number {

    let total = 0;

    for (let i = 0; i < a.length; i++) {

      total += Math.pow(
        a[i] - b[i],
        2
      );

    }

    return Math.sqrt(total);

  }

  // ===============================
  // HITUNG CENTROID
  // ===============================

  hitungCentroid(
    cluster: any[]
  ): number[] | null {

    if (cluster.length === 0) {
      return null;
    }

    let hasil: number[] = Array(8).fill(0);

    cluster.forEach(siswa => {

      let nilai = this.ambilNilai(siswa);

      for (let i = 0; i < 8; i++) {

        hasil[i] += nilai[i];

      }

    });

    for (let i = 0; i < 8; i++) {

      hasil[i] =
        hasil[i] / cluster.length;

      hasil[i] =
        parseFloat(
          hasil[i].toFixed(2)
        );

    }

    return hasil;

  }

  // ===============================
  // CEK CENTROID SAMA
  // ===============================

  centroidSama(
    a: number[][],
    b: number[][]
  ): boolean {

    for (let i = 0; i < a.length; i++) {

      for (let j = 0; j < a[i].length; j++) {

        if (a[i][j] !== b[i][j]) {

          return false;

        }

      }

    }

    return true;

  }

  // ===============================
  // REKOMENDASI
  // ===============================

  getRekomendasi(
    kategori: string
  ): string {

    if (
      kategori === 'Prestasi Tinggi'
    ) {

      return 'Program Akselerasi & Olimpiade';

    }

    if (
      kategori === 'Prestasi Sedang'
    ) {

      return 'Bimbingan Kelompok & Pengayaan';

    }

    if (
      kategori === 'Prestasi Rendah'
    ) {

      return 'Bimbingan Intensif & Remedial';

    }

    return '-';

  }

  // ===============================
  // PROSES K-MEANS
  // ===============================

  prosesClustering() {

    if (this.dataSiswa.length < 3) {

      alert('Minimal 3 data siswa!');

      return;

    }

    this.hasilCluster = [];
    this.riwayatIterasi = [];

    let centroid: number[][];

    // ===============================
    // CENTROID AWAL TETAP
    // ===============================

    if (!this.sudahInisialisasi) {

      const indeksCentroid = [
        0,
        21,
        42
      ];

      const dataCentroid =
        indeksCentroid.map(
          index => this.dataSiswa[index]
        );

      centroid =
        dataCentroid.map(
          item => this.ambilNilai(item)
        );

      this.centroidAwal = centroid;

      this.sudahInisialisasi = true;

    } else {

      centroid = this.centroidAwal;

    }

    let iterasi = 0;
    let selesai = false;

    // ===============================
    // PROSES ITERASI
    // ===============================

    while (
      !selesai &&
      iterasi < 100
    ) {

      iterasi++;

      let kelompok: any[][] = [
        [],
        [],
        []
      ];

      // ===============================
      // HITUNG JARAK
      // ===============================

      this.dataSiswa.forEach(
        siswa => {

          let nilai =
            this.ambilNilai(siswa);

          let jarak =
            centroid.map(
              (c: number[]) =>
                this.hitungJarak(
                  nilai,
                  c
                )
            );

          let cluster =
            jarak.indexOf(
              Math.min(...jarak)
            );

          kelompok[cluster].push(
            siswa
          );

        }
      );

      // ===============================
      // DEBUG C1 ITERASI 1
      // ===============================

      if (iterasi === 1) {

        console.log(
          '===== CEK DATA C1 ITERASI 1 ====='
        );

        kelompok[0].forEach(
          (siswa: any) => {

            console.log(
              siswa.Nama,
              'IPAS:',
              siswa.IPAS,
              'Semua nilai:',
              this.ambilNilai(siswa)
            );

          }
        );

      }

      // ===============================
      // UPDATE CENTROID
      // ===============================

      let centroidBaru: number[][] =
        kelompok.map(
          (k, index) => {

            let hasil =
              this.hitungCentroid(k);

            if (hasil === null) {

              return centroid[index];

            }

            return hasil;

          }
        );

      // ===============================
      // CEK CENTROID
      // ===============================

      let centroidTetap =
        this.centroidSama(
          centroid,
          centroidBaru
        );

      // ===============================
// DEBUG CENTROID BARU
// ===============================

console.log(
  `===== CENTROID BARU ITERASI ${iterasi} =====`
);

console.log(
  'C1:',
  centroidBaru[0]
);

console.log(
  'C2:',
  centroidBaru[1]
);

console.log(
  'C3:',
  centroidBaru[2]
);

      // ===============================
      // SIMPAN RIWAYAT ITERASI
      // ===============================

      this.riwayatIterasi.push({

        iterasi: iterasi,

        jumlahCluster1:
          kelompok[0].length,

        jumlahCluster2:
          kelompok[1].length,

        jumlahCluster3:
          kelompok[2].length,

        status:
          centroidTetap
            ? 'Konvergen / Centroid Sama'
            : 'Belum Konvergen',

        centroidLama:
          centroid.map(
            c => [...c]
          ),

        centroidBaru:
          centroidBaru.map(
            c => [...c]
          )

      });

      // ===============================
      // UPDATE PROSES
      // ===============================

      selesai = centroidTetap;

      centroid = centroidBaru;

    }

    // ===============================
    // SIMPAN HASIL ITERASI
    // ===============================

    this.jumlahIterasi = iterasi;

    this.centroidAkhir = centroid;

    // ===============================
    // DEBUG HASIL K-MEANS
    // ===============================

    console.log(
      '===== HASIL K-MEANS SEKARANG ====='
    );

    console.log(
      'Jumlah iterasi:',
      this.jumlahIterasi
    );

    console.log(
      'Centroid awal:',
      this.centroidAwal
    );

    console.log(
      'Riwayat iterasi:',
      this.riwayatIterasi
    );

    console.log(
      'Centroid akhir:',
      this.centroidAkhir
    );

    // ===============================
    // HASIL AKHIR CLUSTER
    // ===============================

    let hasil: any[] = [];

    this.dataSiswa.forEach(
      siswa => {

        let nilai =
          this.ambilNilai(siswa);

        let jarak =
          centroid.map(
            (c: number[]) =>
              this.hitungJarak(
                nilai,
                c
              )
          );

        let cluster =
          jarak.indexOf(
            Math.min(...jarak)
          );

        hasil.push({

          nama: siswa.Nama,

          nisn: siswa.Nisn,

          cluster: cluster + 1

        });

      }
    );

    // ===============================
    // TENTUKAN KATEGORI
    // ===============================

    this.hasilCluster =
      this.tentukanKategori(
        hasil
      );

    // ===============================
    // NORMALISASI LABEL CLUSTER
    // ===============================
    //
    // Cluster dengan centroid:
    // terendah  → C1
    // menengah  → C2
    // tertinggi → C3
    //
    // Ini hanya mengubah LABEL,
    // bukan hasil perhitungan K-Means.
    // ===============================

    const mappingCluster =
      this.buatMappingCluster();

      // ===============================
// NORMALISASI URUTAN CENTROID
// ===============================

this.centroidAkhir = [
  centroid[
    this.cariIndexCluster(mappingCluster, 1)
  ],
  centroid[
    this.cariIndexCluster(mappingCluster, 2)
  ],
  centroid[
    this.cariIndexCluster(mappingCluster, 3)
  ]
];

console.log(
  '===== CENTROID AKHIR SETELAH NORMALISASI ====='
);

console.log('C1:', this.centroidAkhir[0]);
console.log('C2:', this.centroidAkhir[1]);
console.log('C3:', this.centroidAkhir[2]);

    this.hasilCluster =
      this.hasilCluster.map(
        item => ({

          ...item,

          cluster:
            mappingCluster[
              item.cluster
            ]

        })
      );

    // ===============================
    // DEBUG HASIL CLUSTER
    // ===============================

    console.log(
      '===== HASIL CLUSTER LENGKAP ====='
    );

    console.table(
      this.hasilCluster
    );

    console.log(
  'JUMLAH PER KATEGORI:',
  {
    rendah: this.hasilCluster.filter(
      x => x.kategori === 'Prestasi Rendah'
    ).length,

    sedang: this.hasilCluster.filter(
      x => x.kategori === 'Prestasi Sedang'
    ).length,

    tinggi: this.hasilCluster.filter(
      x => x.kategori === 'Prestasi Tinggi'
    ).length
  }
);


    // ===============================
    // SIMPAN DATA JARAK
    // ===============================

    this.dataJarak = [];

    this.dataSiswa.forEach(
      siswa => {

        let nilai =
          this.ambilNilai(siswa);

        let jarak =
          this.centroidAkhir.map(
            (c: number[]) =>
              this.hitungJarak(
                nilai,
                c
              )
          );

        let clusterIndex =
          jarak.indexOf(
            Math.min(...jarak)
          );

        // ===============================
        // NORMALISASI LABEL JARAK
        // ===============================

        const clusterBaru =
          mappingCluster[
            clusterIndex + 1
          ];

        // ===============================
        // DEBUG ANNISA
        // ===============================

        if (
          siswa.Nama == 'ANNISA' ||
          siswa.Nama == 'Annisa'
        ) {

          console.log(
            "=== DEBUG ANNISA ==="
          );

          console.log(
            "Data Annisa:",
            nilai
          );

          console.log(
            "Centroid C1 Akhir:",
            this.centroidAkhir[0]
          );

          console.log(
            "=== DETAIL HITUNG ==="
          );

          let c1 =
            this.centroidAkhir[0];

          for (
            let i = 0;
            i < nilai.length;
            i++
          ) {

            let selisih =
              nilai[i] - c1[i];

            console.log(
              "Index", i,
              "| nilai:", nilai[i],
              "| centroid:", c1[i],
              "| selisih:", selisih,
              "| kuadrat:",
              selisih * selisih
            );

          }

          console.log(
            "Jarak ke C1:",
            jarak[0]
          );

          console.log(
            "Jarak ke C2:",
            jarak[1]
          );

          console.log(
            "Jarak ke C3:",
            jarak[2]
          );

        }

        this.dataJarak.push({

          nama: siswa.Nama,

          // ===============================
          // LABEL JARAK DISESUAIKAN
          // ===============================

          c1:
            jarak[
              this.cariIndexCluster(
                mappingCluster,
                1
              )
            ].toFixed(2),

          c2:
            jarak[
              this.cariIndexCluster(
                mappingCluster,
                2
              )
            ].toFixed(2),

          c3:
            jarak[
              this.cariIndexCluster(
                mappingCluster,
                3
              )
            ].toFixed(2),

          cluster:
            'C' + clusterBaru

        });

      }
    );

    // ===============================
// SIMPAN KE SERVICE
// ===============================

this.siswaService.hasilCluster =
  this.hasilCluster;

this.siswaService.centroidAkhir =
  this.centroidAkhir;

this.siswaService.dataJarak =
  this.dataJarak;


// ===============================
// SIMPAN HASIL CLUSTERING KE DATABASE
// ===============================

const dataSimpan =
  this.hasilCluster.map((hasil: any) => {

    const jarakSiswa =
      this.dataJarak.find(
        (item: any) =>
          item.nama === hasil.nama
      );

    return {

      nisn: hasil.nisn,

      cluster:
        Number(hasil.cluster),

      jarak_c1:
        Number(jarakSiswa?.c1 ?? 0),

      jarak_c2:
        Number(jarakSiswa?.c2 ?? 0),

      jarak_c3:
        Number(jarakSiswa?.c3 ?? 0)

    };

  });

console.log(
  'DATA YANG AKAN DISIMPAN:',
  dataSimpan
);


// ===============================
// KIRIM KE PHP
// ===============================

this.api.simpanClustering({

  data: dataSimpan

}).subscribe({

  next: (response: any) => {

    console.log(
      'RESPONS SIMPAN CLUSTERING:',
      response
    );

    if (response.status === true) {

      console.log(
        'Hasil clustering berhasil disimpan ke database.'
      );

    } else {

      console.error(
        'Gagal menyimpan:',
        response.message
      );

    }

  },

  error: (error) => {

    console.error(
      'ERROR SIMPAN CLUSTERING:',
      error
    );

  }

});

}
  // ===============================
  // BUAT MAPPING CLUSTER
  // ===============================
  //
  // Mengurutkan centroid:
  //
  // terendah  → C1
  // menengah  → C2
  // tertinggi → C3
  // ===============================

  buatMappingCluster(): any {

    const rataCentroid =
      this.centroidAkhir.map(
        (c, index) => {

          const total =
            c.reduce(
              (a, b) => a + b,
              0
            );

          return {

            index: index,

            nilai:
              total / c.length

          };

        }
      );

    const urut =
      [...rataCentroid].sort(
        (a, b) =>
          a.nilai - b.nilai
      );

    const mapping: any = {};

    mapping[
      urut[0].index + 1
    ] = 1;

    mapping[
      urut[1].index + 1
    ] = 2;

    mapping[
      urut[2].index + 1
    ] = 3;

    console.log(
      '===== MAPPING CLUSTER ====='
    );

    console.log(
      'Cluster lama → cluster baru:',
      mapping
    );

    return mapping;

  }

  // ===============================
  // CARI INDEX CLUSTER ASLI
  // ===============================

  cariIndexCluster(
    mapping: any,
    clusterBaru: number
  ): number {

    for (
      const clusterLama in mapping
    ) {

      if (
        mapping[clusterLama] ===
        clusterBaru
      ) {

        return Number(
          clusterLama
        ) - 1;

      }

    }

    return 0;

  }

  // ===============================
  // TENTUKAN KATEGORI
  // ===============================

  tentukanKategori(
    data: any[]
  ) {

    let rata =
      this.centroidAkhir.map(
        c => {

          let jumlah =
            c.reduce(
              (a, b) => a + b,
              0
            );

          return jumlah / c.length;

        }
      );

    let urut =
      [...rata]
        .map(
          (nilai, index) => ({
            nilai,
            index
          })
        )
        .sort(
          (a, b) =>
            b.nilai - a.nilai
        );

    let kategori: any = {};

    kategori[
      urut[0].index + 1
    ] = 'Prestasi Tinggi';

    kategori[
      urut[1].index + 1
    ] = 'Prestasi Sedang';

    kategori[
      urut[2].index + 1
    ] = 'Prestasi Rendah';

    return data.map(
      item => ({

        ...item,

        kategori:
          kategori[item.cluster]

      })
    );

  }

  // ===============================
  // RESET PROSES
  // ===============================

  resetProses() {

    this.hasilCluster = [];

    this.centroidAwal = [];

    this.centroidAkhir = [];

    this.riwayatIterasi = [];

    this.jumlahIterasi = 0;

    this.dataJarak = [];

    this.sudahInisialisasi = false;

  }

}