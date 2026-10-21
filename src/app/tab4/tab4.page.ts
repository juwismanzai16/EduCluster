import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Siswa } from '../services/siswa';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {

  analisisCluster: any[] = [];
  sudahAnalisis: boolean = false;

  // Evaluasi Cluster
  nilaiDBI: number = 0;
  keteranganDBI: string = '';

  // Grafik
  chartCluster: Chart | undefined;

  // nama mata pelajaran
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

  constructor(
    private siswaService: Siswa,
    private router: Router
  ) {}

  // ============================
  // LOGOUT
  // ============================

  logout() {
    localStorage.removeItem('isLoggedIn');

    this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }

  // ============================
  // SAAT MASUK KE TAB 4
  // ============================

  ionViewWillEnter() {
    this.sudahAnalisis = false;
    this.analisisCluster = [];
    this.nilaiDBI = 0;
    this.keteranganDBI = '';

    // Hapus grafik lama jika ada
    if (this.chartCluster) {
      this.chartCluster.destroy();
      this.chartCluster = undefined;
    }
  }

  // ============================
  // ANALISIS DATA
  // ============================

  analisisData() {

    const hasil = this.siswaService.hasilCluster;
    const centroid = this.siswaService.centroidAkhir;
    const dataSiswa = this.siswaService.dataSiswa;

    if (!hasil || hasil.length === 0) {
      alert('Silakan lakukan proses K-Means terlebih dahulu di Tab 3');
      return;
    }

    if (!centroid || centroid.length === 0) {
      alert('Centroid akhir belum tersedia');
      return;
    }

    // ============================
    // HITUNG DBI (REAL)
    // ============================

    const ambilNilai = (s: any) => [
      Number(s.Agama),
      Number(s.PPKN),
      Number(s.BIndonesia),
      Number(s.Binggris),
      Number(s.MTK),
      Number(s.IPAS),
      Number(s.PJOK),
      Number(s.Seni)
    ];

    const hitungJarak = (a: number[], b: number[]) => {
      let total = 0;

      for (let i = 0; i < a.length; i++) {
        total += Math.pow(a[i] - b[i], 2);
      }

      return Math.sqrt(total);
    };

    let clusterData: any[][] = [[], [], []];

    hasil.forEach((item: any) => {

      let siswa = dataSiswa.find(
        s => s.Nisn === item.nisn
      );

      if (siswa) {
        clusterData[item.cluster - 1].push(siswa);
      }

    });

    // ============================
    // HITUNG Si
    // ============================

    let Si = clusterData.map((cluster, i) => {

      if (cluster.length === 0) return 0;

      let total = 0;

      cluster.forEach(siswa => {

        total += hitungJarak(
          ambilNilai(siswa),
          centroid[i]
        );

      });

      return total / cluster.length;

    });

    //// DETAIL JARAK DALAM CLUSTER
    // ============================

    console.log('===== DETAIL JARAK DALAM CLUSTER =====');

    clusterData.forEach((cluster, i) => {

      let totalJarak = 0;

      console.log(`--- C${i + 1} ---`);

      cluster.forEach(siswa => {

        const jarak =
          hitungJarak(
            ambilNilai(siswa),
            centroid[i]
          );

        totalJarak += jarak;

        console.log(
          siswa.Nama,
          '→ jarak:',
          jarak
        );

      });

      console.log(
        `Total jarak C${i + 1}:`,
        totalJarak
      );

      console.log(
        `Jumlah anggota C${i + 1}:`,
        cluster.length
      );

      console.log(
        `Rata-rata C${i + 1}:`,
        totalJarak / cluster.length
      );

    });

    // ============================
    // HITUNG DBI
    // ============================

    let totalDBI = 0;
    let k = centroid.length;

    for (let i = 0; i < k; i++) {

      let maxR = 0;

      for (let j = 0; j < k; j++) {

        if (i !== j) {

          let Mij = hitungJarak(
            centroid[i],
            centroid[j]
          );

          let Rij = (Si[i] + Si[j]) / Mij;

          if (Rij > maxR) {
            maxR = Rij;
          }

        }

      }

      totalDBI += maxR;

    }

    this.nilaiDBI = parseFloat(
      (totalDBI / k).toFixed(4)
    );

    // ============================
    // DEBUG PERHITUNGAN DBI
    // ============================

    console.log('===== DEBUG DBI EDUCLUSTER =====');

    console.log(
      'Jumlah anggota C1:',
      clusterData[0].length
    );

    console.log(
      'Jumlah anggota C2:',
      clusterData[1].length
    );

    console.log(
      'Jumlah anggota C3:',
      clusterData[2].length
    );

    console.log('Nilai Si:', Si);

    for (let i = 0; i < k; i++) {

      for (let j = i + 1; j < k; j++) {

        let Mij = hitungJarak(
          centroid[i],
          centroid[j]
        );

        let Rij =
          (Si[i] + Si[j]) / Mij;

        console.log(
          `M${i + 1}${j + 1}:`,
          Mij
        );

        console.log(
          `R${i + 1}${j + 1}:`,
          Rij
        );

      }

    }

    console.log(
      'DBI:',
      this.nilaiDBI
    );

    console.log(
      'Centroid akhir:',
      centroid
    );

    // ============================
    // KETERANGAN DBI
    // ============================

    if (this.nilaiDBI < 0.5) {

      this.keteranganDBI =
        'Kualitas clustering sangat baik karena nilai DBI mendekati 0';

    }
    else if (this.nilaiDBI < 1) {

      this.keteranganDBI =
        'Kualitas clustering cukup baik dengan nilai DBI yang relatif rendah';

    }
    else {

      this.keteranganDBI =
        'Nilai DBI relatif tinggi sehingga kualitas clustering perlu dievaluasi';

    }

    // ============================
    // ANALISIS CLUSTER
    // ============================

    centroid.forEach((c: number[], index: number) => {

  // Cari nilai centroid tertinggi
  const nilaiTertinggi =
    Math.max(...c);

  // Cari semua posisi mata pelajaran
  // yang memiliki nilai tertinggi
  const posisiMapel =
    c
      .map((nilai: number, i: number) => ({
        nilai,
        index: i
      }))
      .filter(
        (item: { nilai: number; index: number }) =>
          item.nilai === nilaiTertinggi
      )
      .map(
        (item: { nilai: number; index: number }) =>
          item.index
      );

  // Nama mata pelajaran dominan
  const mapelDominan =
    posisiMapel
      .map(
        (i: number) => this.namaMapel[i]
      )
      .join(', ');

  const jumlah =
    hasil.filter(
      (s: any) =>
        s.cluster === index + 1
    ).length;

  this.analisisCluster.push({

    cluster:
      'C' + (index + 1),

    jumlahSiswa:
      jumlah,

    mapelDominan:
      mapelDominan,

    nilaiRata:
      nilaiTertinggi.toFixed(2)

  });

});

    this.sudahAnalisis = true;

    // ============================
    // BUAT GRAFIK
    // ============================

    setTimeout(() => {

      this.buatGrafik();

    }, 100);

  }

  // ============================
  // GRAFIK JUMLAH SISWA CLUSTER
  // ============================

  buatGrafik() {

    const canvas =
      document.getElementById(
        'clusterChart'
      ) as HTMLCanvasElement;

    if (!canvas) {
      return;
    }

    if (this.chartCluster) {
      this.chartCluster.destroy();
    }

    this.chartCluster = new Chart(

      canvas,

      {

        type: 'bar',

        data: {

          labels: this.analisisCluster.map(
            d => d.cluster
          ),

          datasets: [

            {

              data: this.analisisCluster.map(
                d => d.jumlahSiswa
              ),

              backgroundColor: [
                '#42A5F5',
                '#66BB6A',
                '#FFA726'
              ],

              borderWidth: 1,

              barPercentage: 0.5,

              categoryPercentage: 0.6

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {

            legend: {

              display: false

            }

          },

          scales: {

            y: {

              beginAtZero: true,

              ticks: {

                stepSize: 1

              }

            }

          }

        }

      }

    );

  }

}