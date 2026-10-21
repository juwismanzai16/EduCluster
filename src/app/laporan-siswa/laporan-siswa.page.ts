
import { Component, OnInit } from '@angular/core';
import { Siswa } from '../services/siswa';
import { ApiService } from '../services/api';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-laporan-siswa',
  templateUrl: './laporan-siswa.page.html',
  styleUrls: ['./laporan-siswa.page.scss'],
  standalone: false,
})
export class LaporanSiswaPage implements OnInit {

  dataSiswa: any[] = [];
  hasilCluster: any[] = [];
  centroidAkhir: number[][] = [];
  dataJarak: any[] = [];

  siswaTerpilih: any = null;
  hasilSiswaTerpilih: any = null;
  jarakSiswaTerpilih: any = null;

  kataKunci = '';
  siswaHasilPencarian: any[] = [];

  analisisMapel: any[] = [];
  mapelDominan = '';
  rataRataSiswa = 0;

  rekomendasi = '';
  pesanOrangTua = '';

  sedangMemuat = true;

  constructor(
    private siswaService: Siswa,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    // Pertahankan hasil clustering dari service yang digunakan aplikasi.
    this.hasilCluster = this.siswaService.hasilCluster || [];
    this.centroidAkhir = this.siswaService.centroidAkhir || [];
    this.dataJarak = this.siswaService.dataJarak || [];

    // Ambil data siswa dari database.
    this.api.getData().subscribe({
      next: (res: any) => {
        const daftar = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        this.dataSiswa = daftar;
        this.siswaService.dataSiswa = daftar;

        // Semua siswa langsung ditampilkan ketika halaman dibuka.
        this.siswaHasilPencarian = [...this.dataSiswa];
        this.sedangMemuat = false;

        console.log('Data siswa laporan:', this.dataSiswa);
        console.log('Hasil cluster:', this.hasilCluster);
        console.log('Centroid akhir:', this.centroidAkhir);
        console.log('Data jarak:', this.dataJarak);
      },
      error: (err) => {
        console.error('Gagal mengambil data siswa:', err);
        this.sedangMemuat = false;
        this.dataSiswa = [];
        this.siswaHasilPencarian = [];
        alert('Data siswa gagal dimuat. Periksa koneksi ke server.');
      }
    });
  }

  // ===============================
  // PENCARIAN SISWA
  // ===============================

  cariSiswa(): void {
    const kata = String(this.kataKunci || '')
      .toLowerCase()
      .trim();

    if (!kata) {
      this.siswaHasilPencarian = [...this.dataSiswa];
      return;
    }

    this.siswaHasilPencarian = this.dataSiswa.filter((siswa: any) => {
      const nama = String(siswa.Nama ?? siswa.nama ?? '')
        .toLowerCase()
        .trim();

      const nisn = String(siswa.Nisn ?? siswa.nisn ?? '')
        .toLowerCase()
        .trim();

      return nama.includes(kata) || nisn.includes(kata);
    });
  }

  resetPencarian(): void {
    this.kataKunci = '';
    this.siswaHasilPencarian = [...this.dataSiswa];
  }

  // ===============================
  // CARI HASIL CLUSTER SISWA
  // ===============================

  cariHasilCluster(siswa: any): any {
    if (!siswa) {
      return null;
    }

    const nisnSiswa = String(siswa.Nisn ?? siswa.nisn ?? '');

    return this.hasilCluster.find((hasil: any) =>
      String(hasil.nisn ?? hasil.Nisn ?? '') === nisnSiswa
    ) || null;
  }

  cariJarakSiswa(siswa: any): any {
    if (!siswa) {
      return null;
    }

    const nisnSiswa = String(siswa.Nisn ?? siswa.nisn ?? '');
    const namaSiswa = String(siswa.Nama ?? siswa.nama ?? '')
      .toLowerCase()
      .trim();

    // Jika data jarak memiliki NISN, gunakan NISN terlebih dahulu.
    const berdasarkanNisn = this.dataJarak.find((jarak: any) =>
      jarak.nisn != null &&
      String(jarak.nisn) === nisnSiswa
    );

    if (berdasarkanNisn) {
      return berdasarkanNisn;
    }

    // Pertahankan dukungan terhadap struktur data jarak lama
    // yang menggunakan nama siswa.
    return this.dataJarak.find((jarak: any) =>
      String(jarak.nama ?? '').toLowerCase().trim() === namaSiswa
    ) || null;
  }

  warnaCluster(kategori: string | null | undefined): string {
    const nilai = String(kategori || '').toLowerCase();

    if (nilai.includes('tinggi')) {
      return 'success';
    }

    if (nilai.includes('sedang')) {
      return 'warning';
    }

    if (nilai.includes('rendah')) {
      return 'danger';
    }

    return 'medium';
  }

  // ===============================
  // SIAPKAN LAPORAN SISWA
  // ===============================

  private siapkanLaporan(siswa: any): void {
    this.siswaTerpilih = siswa;

    this.hasilSiswaTerpilih = this.cariHasilCluster(siswa);
    this.jarakSiswaTerpilih = this.cariJarakSiswa(siswa);

    this.analisisMataPelajaran();
    this.buatRekomendasi();
    this.buatPesanOrangTua();
  }

  // ===============================
  // TOMBOL LIHAT
  // ===============================

  lihatSiswa(siswa: any): void {
    this.siapkanLaporan(siswa);

    // Scroll ke detail laporan yang dipilih.
    setTimeout(() => {
      document.getElementById('detail-laporan')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  // ===============================
  // TUTUP DETAIL LAPORAN
  // ===============================

  tutupLaporan(): void {
    this.siswaTerpilih = null;
    this.hasilSiswaTerpilih = null;
    this.jarakSiswaTerpilih = null;

    this.analisisMapel = [];
    this.mapelDominan = '';
    this.rataRataSiswa = 0;
    this.rekomendasi = '';
    this.pesanOrangTua = '';
  }

  // ===============================
  // TOMBOL CETAK LANGSUNG
  // ===============================

  cetakSiswa(siswa: any): void {
    // Siapkan data siswa tanpa perlu membuka detail laporan.
    this.siapkanLaporan(siswa);

    // Jalankan pembuatan PDF untuk siswa yang dipilih.
    this.cetakPDF();
  }

  // ===============================
  // AMBIL NILAI MATA PELAJARAN
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
  // ANALISIS MATA PELAJARAN
  // ===============================

  analisisMataPelajaran(): void {
    if (!this.siswaTerpilih) {
      return;
    }

    const siswa = this.siswaTerpilih;

    const daftarMapel = [
      { nama: 'Agama', nilai: Number(siswa.Agama) || 0 },
      { nama: 'PPKn', nilai: Number(siswa.PPKN) || 0 },
      { nama: 'B. Indonesia', nilai: Number(siswa.BIndonesia) || 0 },
      { nama: 'B. Inggris', nilai: Number(siswa.Binggris) || 0 },
      { nama: 'MTK', nilai: Number(siswa.MTK) || 0 },
      { nama: 'IPAS', nilai: Number(siswa.IPAS) || 0 },
      { nama: 'PJOK', nilai: Number(siswa.PJOK) || 0 },
      { nama: 'Seni', nilai: Number(siswa.Seni) || 0 }
    ];

    this.analisisMapel = daftarMapel;

    const total = daftarMapel.reduce(
      (jumlah, mapel) => jumlah + mapel.nilai,
      0
    );

    this.rataRataSiswa = total / daftarMapel.length;

    const mapelTertinggi = [...daftarMapel].sort(
      (a, b) => b.nilai - a.nilai
    );

    this.mapelDominan = mapelTertinggi.length
      ? mapelTertinggi[0].nama
      : '-';
  }

  // ===============================
  // REKOMENDASI PEMBELAJARAN
  // ===============================

  buatRekomendasi(): void {
    if (!this.hasilSiswaTerpilih) {
      this.rekomendasi =
        'Belum ada hasil clustering. Silakan lakukan proses clustering terlebih dahulu.';
      return;
    }

    const kategori = this.hasilSiswaTerpilih.kategori;

    if (kategori === 'Prestasi Tinggi') {
      this.rekomendasi =
        'Program pengayaan, pengembangan potensi, dan persiapan kegiatan olimpiade dapat diberikan untuk mempertahankan serta meningkatkan prestasi siswa.';
    } else if (kategori === 'Prestasi Sedang') {
      this.rekomendasi =
        'Bimbingan kelompok dan kegiatan pengayaan dapat diberikan pada materi yang masih perlu diperkuat agar prestasi siswa semakin meningkat.';
    } else if (kategori === 'Prestasi Rendah') {
      this.rekomendasi =
        'Bimbingan intensif dan remedial perlu diberikan terutama pada mata pelajaran dengan nilai yang masih rendah.';
    } else {
      this.rekomendasi = '-';
    }
  }

  // ===============================
  // PESAN UNTUK ORANG TUA
  // ===============================

  buatPesanOrangTua(): void {
    if (!this.siswaTerpilih) {
      return;
    }

    const nama = this.siswaTerpilih.Nama ??
      this.siswaTerpilih.nama ??
      'Siswa';

    const kategori =
      this.hasilSiswaTerpilih?.kategori ?? 'belum ditentukan';

    const rata = this.rataRataSiswa.toFixed(2);

    this.pesanOrangTua =
      `Bapak/Ibu orang tua ${nama}, berdasarkan hasil analisis prestasi belajar, ${nama} termasuk dalam kelompok ${kategori} dengan rata-rata nilai ${rata}. Mata pelajaran dengan nilai tertinggi adalah ${this.mapelDominan}. Kami mengharapkan dukungan dan pendampingan dari Bapak/Ibu agar perkembangan belajar ${nama} dapat terus meningkat. Terima kasih atas perhatian dan kerja samanya.`;
  }

  // ===============================
  // SALIN PESAN
  // ===============================

  async salinPesan(): Promise<void> {
    if (!this.pesanOrangTua) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.pesanOrangTua);
      alert('Pesan berhasil disalin.');
    } catch (error) {
      console.error('Gagal menyalin pesan:', error);
      alert('Pesan tidak dapat disalin otomatis pada browser ini.');
    }
  }

  // ===============================
  // LOGO PDF
  // ===============================

  private ambilLogoBase64(): Promise<string> {
    return new Promise((resolve, reject) => {
      const gambar = new Image();

      gambar.onload = () => {
        try {
          const canvas = document.createElement('canvas');

          canvas.width = gambar.naturalWidth;
          canvas.height = gambar.naturalHeight;

          const konteks = canvas.getContext('2d');

          if (!konteks) {
            reject(new Error('Canvas tidak dapat dibuat.'));
            return;
          }

          konteks.drawImage(gambar, 0, 0);

          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      gambar.onerror = () => {
        reject(new Error('Logo sekolah tidak dapat dimuat.'));
      };

      gambar.src = 'assets/logo-tut-wuri-handayani.jpeg';
    });
  }

  // ===============================
  // PEMBUATAN PDF
  // ===============================

  async cetakPDF(): Promise<void> {
    if (!this.siswaTerpilih) {
      alert('Silakan pilih siswa terlebih dahulu.');
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const lebarHalaman = pdf.internal.pageSize.getWidth();
      const tinggiHalaman = pdf.internal.pageSize.getHeight();
      const marginKiri = 18;
      const marginKanan = 18;
      const lebarIsi = lebarHalaman - marginKiri - marginKanan;

      let y = 15;

      const nama = String(
        this.siswaTerpilih.Nama ??
        this.siswaTerpilih.nama ??
        'Siswa'
      );

      const nisn = String(
        this.siswaTerpilih.Nisn ??
        this.siswaTerpilih.nisn ??
        '-'
      );

      // Memuat logo jika tersedia.
      try {
        const logo = await this.ambilLogoBase64();
        pdf.addImage(logo, 'PNG', marginKiri, y, 18, 18);
      } catch (error) {
        console.warn('Logo tidak dapat dimuat, PDF tetap dibuat.', error);
      }

      // ===============================
      // KOP LAPORAN
      // ===============================

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text(
        'LAPORAN HASIL ANALISIS PRESTASI SISWA',
        lebarHalaman / 2 + 7,
        y + 5,
        { align: 'center' }
      );

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(
        'SISTEM EDUCLUSTER',
        lebarHalaman / 2 + 7,
        y + 11,
        { align: 'center' }
      );

      pdf.setFontSize(8);
      pdf.text(
        'SD Negeri 060921 Medan',
        lebarHalaman / 2 + 7,
        y + 16,
        { align: 'center' }
      );

      y += 24;

      pdf.setDrawColor(0, 137, 123);
      pdf.setLineWidth(0.7);
      pdf.line(marginKiri, y, lebarHalaman - marginKanan, y);

      y += 9;

      // Fungsi lokal untuk memastikan teks tidak keluar halaman.
      const periksaRuang = (tinggi: number): void => {
        if (y + tinggi > tinggiHalaman - 18) {
          pdf.addPage();
          y = 18;
        }
      };

      const tulisBagian = (judul: string, isi: string): void => {
        const baris = pdf.splitTextToSize(isi, lebarIsi);
        const tinggi = 10 + baris.length * 4.2;

        periksaRuang(tinggi);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.text(judul, marginKiri, y);
        y += 5;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.text(baris, marginKiri, y);

        y += baris.length * 4.2 + 5;
      };

      // ===============================
      // IDENTITAS SISWA
      // ===============================

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Identitas Siswa', marginKiri, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Nama Siswa : ${nama}`, marginKiri, y);
      y += 5;
      pdf.text(`NISN : ${nisn}`, marginKiri, y);
      y += 5;
      pdf.text(
        `Rata-rata Nilai : ${this.rataRataSiswa.toFixed(2)}`,
        marginKiri,
        y
      );
      y += 9;

      // ===============================
      // HASIL CLUSTERING
      // ===============================

      const kategori =
        this.hasilSiswaTerpilih?.kategori ?? 'Belum ditentukan';

      tulisBagian(
        'Hasil Clustering',
        `Berdasarkan hasil clustering yang tersedia, siswa termasuk dalam kategori ${kategori}. Hasil pengelompokan ini digunakan sebagai bahan pertimbangan untuk menentukan pendampingan pembelajaran.`
      );

      // ===============================
      // TABEL NILAI MATA PELAJARAN
      // ===============================

      periksaRuang(35);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('Rincian Nilai Mata Pelajaran', marginKiri, y);
      y += 6;

      const tinggiBaris = 6;
      const kolomNo = marginKiri;
      const kolomMapel = marginKiri + 15;
      const kolomNilai = lebarHalaman - marginKanan - 5;

      pdf.setFillColor(0, 121, 107);
      pdf.rect(
        marginKiri,
        y - 4,
        lebarIsi,
        tinggiBaris,
        'F'
      );

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);

      pdf.text('No.', kolomNo + 2, y);
      pdf.text('Mata Pelajaran', kolomMapel, y);
      pdf.text('Nilai', kolomNilai, y, { align: 'right' });

      y += tinggiBaris;
      pdf.setTextColor(38, 50, 56);
      pdf.setFont('helvetica', 'normal');

      this.analisisMapel.forEach((mapel: any, index: number) => {
        periksaRuang(tinggiBaris + 2);

        pdf.setDrawColor(225, 232, 232);
        pdf.line(
          marginKiri,
          y + 1,
          lebarHalaman - marginKanan,
          y + 1
        );

        pdf.text(String(index + 1), kolomNo + 2, y);
        pdf.text(String(mapel.nama), kolomMapel, y);
        pdf.text(
          Number(mapel.nilai).toFixed(0),
          kolomNilai,
          y,
          { align: 'right' }
        );

        y += tinggiBaris;
      });

      y += 3;

      // ===============================
      // RINGKASAN NILAI
      // ===============================

      tulisBagian(
        'Ringkasan Analisis Nilai',
        `Rata-rata nilai siswa adalah ${this.rataRataSiswa.toFixed(2)}. Mata pelajaran dengan nilai tertinggi adalah ${this.mapelDominan || '-'}.`
      );

      // ===============================
      // JARAK CENTROID
      // ===============================

      if (this.jarakSiswaTerpilih) {
        periksaRuang(24);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.text('Jarak ke Centroid', marginKiri, y);
        y += 6;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);

        const jarak = this.jarakSiswaTerpilih;

        pdf.text(
          `C1: ${jarak.c1 ?? '-'}`,
          marginKiri,
          y
        );

        pdf.text(
          `C2: ${jarak.c2 ?? '-'}`,
          marginKiri + 55,
          y
        );

        pdf.text(
          `C3: ${jarak.c3 ?? '-'}`,
          marginKiri + 110,
          y
        );

        y += 8;
      }

      // ===============================
      // REKOMENDASI
      // ===============================

      tulisBagian(
        'Rekomendasi Pembelajaran',
        this.rekomendasi
      );

      // ===============================
      // PESAN ORANG TUA
      // ===============================

      tulisBagian(
        'Pesan untuk Orang Tua / Wali',
        this.pesanOrangTua
      );

      // ===============================
      // PENUTUP
      // ===============================

      tulisBagian(
        'Penutup',
        'Demikian laporan hasil analisis ini disampaikan sebagai bahan perhatian dan pendampingan dalam proses belajar siswa.'
      );

      // ===============================
      // TANDA TANGAN
      // ===============================

      periksaRuang(38);

      const posisiTandaTanganX = 155;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);

      pdf.text(
        'Medan, .................... 2026',
        posisiTandaTanganX,
        y,
        { align: 'center' }
      );

      y += 5;

      pdf.text(
        'Guru Wali Kelas V',
        posisiTandaTanganX,
        y,
        { align: 'center' }
      );

      y += 16;

      pdf.text(
        '(________________________)',
        posisiTandaTanganX,
        y,
        { align: 'center' }
      );

      y += 5;

      pdf.setFont('helvetica', 'bold');
      pdf.text(
        'Ibu Remika',
        posisiTandaTanganX,
        y,
        { align: 'center' }
      );

      // ===============================
      // NOMOR HALAMAN
      // ===============================

      const jumlahHalaman = pdf.getNumberOfPages();

      for (let halaman = 1; halaman <= jumlahHalaman; halaman++) {
        pdf.setPage(halaman);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(120, 144, 156);

        pdf.text(
          `Halaman ${halaman} dari ${jumlahHalaman}`,
          lebarHalaman - marginKanan,
          tinggiHalaman - 8,
          { align: 'right' }
        );
      }

      // ===============================
      // SIMPAN PDF
      // ===============================

      const namaAman = nama.replace(/[\\/:*?"<>|]/g, '-');
      pdf.save(`Laporan-${namaAman}.pdf`);

    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      alert('Laporan PDF gagal dibuat. Periksa kembali data siswa dan logo.');
    }
  }
}
