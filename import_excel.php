<?php

// ==========================================
// IZIN AKSES DARI IONIC / ANGULAR
// ==========================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");


// ==========================================
// MENANGANI REQUEST OPTIONS / PREFLIGHT
// ==========================================

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}


// ==========================================
// KONEKSI DATABASE
// ==========================================

include "koneksi.php";


// ==========================================
// MEMBACA DATA DARI ANGULAR
// ==========================================

$input = file_get_contents("php://input");

$dataInput = json_decode($input, true);


// ==========================================
// CEK DATA YANG DITERIMA
// ==========================================

if (
    !$dataInput ||
    !isset($dataInput['data']) ||
    !is_array($dataInput['data'])
) {

    echo json_encode([
        "status" => false,
        "message" => "Data Excel tidak ditemukan."
    ]);

    exit;
}


$dataExcel = $dataInput['data'];


// ==========================================
// AMBIL ID ADMIN
// ==========================================

$idAdmin = null;

if (
    isset($dataInput['id_admin']) &&
    $dataInput['id_admin'] !== null &&
    $dataInput['id_admin'] !== ''
) {

    $idAdmin = (int)$dataInput['id_admin'];

}


// ==========================================
// CEK APAKAH DATA EXCEL KOSONG
// ==========================================

if (count($dataExcel) == 0) {

    echo json_encode([
        "status" => false,
        "message" => "Data Excel kosong."
    ]);

    exit;
}


// ==========================================
// MEMULAI TRANSAKSI
// ==========================================

$conn->begin_transaction();


try {

    // ======================================
    // 1. HAPUS HASIL CLUSTERING LAMA
    // ======================================

    $hapusHasil = $conn->prepare(
        "DELETE FROM hasil_clustering"
    );

    if (!$hapusHasil) {

        throw new Exception(
            "Gagal menyiapkan penghapusan hasil clustering."
        );

    }

    $hapusHasil->execute();

    $hapusHasil->close();


    // ======================================
    // 2. HAPUS DATA SISWA LAMA
    // ======================================

    $hapusSiswa = $conn->prepare(
        "DELETE FROM siswa"
    );

    if (!$hapusSiswa) {

        throw new Exception(
            "Gagal menyiapkan penghapusan data siswa."
        );

    }

    $hapusSiswa->execute();

    $hapusSiswa->close();


    // ======================================
    // 3. SIAPKAN QUERY INSERT
    // ======================================

    $sql = "
        INSERT INTO siswa
        (
            Nama,
            Nisn,
            Agama,
            PPKN,
            BIndonesia,
            Binggris,
            MTK,
            IPAS,
            PJOK,
            Seni,
            created_by
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";


    $stmt = $conn->prepare($sql);


    if (!$stmt) {

        throw new Exception(
            "Gagal menyiapkan proses penyimpanan data siswa."
        );

    }


    // ======================================
    // 4. PROSES SETIAP BARIS EXCEL
    // ======================================

    $jumlahBerhasil = 0;


    foreach ($dataExcel as $index => $row) {

        // ==================================
        // KOLOM YANG WAJIB ADA
        // ==================================

        $kolomWajib = [
            'Nama',
            'Nisn',
            'Agama',
            'PPKN',
            'BIndonesia',
            'Binggris',
            'MTK',
            'IPAS',
            'PJOK',
            'Seni'
        ];


        foreach ($kolomWajib as $kolom) {

            if (!array_key_exists($kolom, $row)) {

                throw new Exception(
                    "Kolom \"$kolom\" tidak ditemukan pada data Excel."
                );

            }

        }


        // ==================================
        // AMBIL DATA DARI EXCEL
        // ==================================

        $nama =
            trim(
                (string)$row['Nama']
            );


        $nisn =
            trim(
                (string)$row['Nisn']
            );


        $agama =
            (int)$row['Agama'];


        $ppkn =
            (int)$row['PPKN'];


        $bindonesia =
            (int)$row['BIndonesia'];


        $binggris =
            (int)$row['Binggris'];


        $mtk =
            (int)$row['MTK'];


        $ipas =
            (int)$row['IPAS'];


        $pjok =
            (int)$row['PJOK'];


        $seni =
            (int)$row['Seni'];


        // ==================================
        // CEK NAMA
        // ==================================

        if ($nama == '') {

            throw new Exception(
                "Nama siswa pada baris " .
                ($index + 2) .
                " tidak boleh kosong."
            );

        }


        // ==================================
        // CEK NISN
        // ==================================

        if ($nisn == '') {

            throw new Exception(
                "NISN siswa pada baris " .
                ($index + 2) .
                " tidak boleh kosong."
            );

        }


        // ==================================
        // CEK NILAI
        // ==================================

        $nilai = [

            'Agama' =>
                $agama,

            'PPKN' =>
                $ppkn,

            'BIndonesia' =>
                $bindonesia,

            'Binggris' =>
                $binggris,

            'MTK' =>
                $mtk,

            'IPAS' =>
                $ipas,

            'PJOK' =>
                $pjok,

            'Seni' =>
                $seni

        ];


        foreach (
            $nilai
            as $namaMapel => $nilaiMapel
        ) {

            if (
                $nilaiMapel < 0 ||
                $nilaiMapel > 100
            ) {

                throw new Exception(
                    "Nilai " .
                    $namaMapel .
                    " pada baris " .
                    ($index + 2) .
                    " tidak valid."
                );

            }

        }


        // ==================================
        // SIMPAN KE DATABASE
        // ==================================

        $stmt->bind_param(

            "ssiiiiiiiii",

            $nama,
            $nisn,
            $agama,
            $ppkn,
            $bindonesia,
            $binggris,
            $mtk,
            $ipas,
            $pjok,
            $seni,
            $idAdmin

        );


        if (
            !$stmt->execute()
        ) {

            throw new Exception(
                "Gagal menyimpan data siswa pada baris " .
                ($index + 2) .
                "."
            );

        }


        $jumlahBerhasil++;

    }


    // ======================================
    // TUTUP STATEMENT
    // ======================================

    $stmt->close();


    // ======================================
    // SIMPAN SEMUA PERUBAHAN
    // ======================================

    $conn->commit();


    // ======================================
    // RESPONSE BERHASIL
    // ======================================

    echo json_encode([

        "status" =>
            true,

        "message" =>
            "Data Excel berhasil diimport ke database.",

        "jumlah_data" =>
            $jumlahBerhasil,

        "created_by" =>
            $idAdmin

    ]);


} catch (Exception $e) {

    // ======================================
    // BATALKAN SEMUA PERUBAHAN
    // ======================================

    $conn->rollback();


    // ======================================
    // RESPONSE GAGAL
    // ======================================

    echo json_encode([

        "status" =>
            false,

        "message" =>
            $e->getMessage()

    ]);

}


// ==========================================
// TUTUP KONEKSI
// ==========================================

$conn->close();

?>