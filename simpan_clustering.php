<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include "koneksi.php";

// Ambil data JSON dari Ionic
$data = json_decode(file_get_contents("php://input"), true);

// Cek apakah data diterima
if (!$data || !isset($data['data'])) {

    echo json_encode([
        "status" => false,
        "message" => "Data clustering tidak diterima"
    ]);

    exit;
}

$dataClustering = $data['data'];


// Mulai transaksi
mysqli_begin_transaction($conn);

try {

    // Hapus hasil clustering lama
    mysqli_query(
        $conn,
        "DELETE FROM hasil_clustering"
    );


    // Query untuk mencari id siswa berdasarkan NISN
    $stmtSiswa = mysqli_prepare(
        $conn,
        "SELECT id FROM siswa WHERE Nisn = ?"
    );


    // Query untuk menyimpan hasil clustering
    $stmtHasil = mysqli_prepare(
        $conn,
        "INSERT INTO hasil_clustering
        (id_siswa, cluster, jarak_c1, jarak_c2, jarak_c3)
        VALUES (?, ?, ?, ?, ?)"
    );


    foreach ($dataClustering as $item) {

        $nisn = $item['nisn'];

        $cluster = (int) $item['cluster'];

        $jarakC1 = (float) $item['jarak_c1'];

        $jarakC2 = (float) $item['jarak_c2'];

        $jarakC3 = (float) $item['jarak_c3'];


        // Cari ID siswa
        mysqli_stmt_bind_param(
            $stmtSiswa,
            "s",
            $nisn
        );

        mysqli_stmt_execute(
            $stmtSiswa
        );

        $result = mysqli_stmt_get_result(
            $stmtSiswa
        );

        $siswa = mysqli_fetch_assoc(
            $result
        );


        // Jika siswa tidak ditemukan
        if (!$siswa) {

            throw new Exception(
                "Siswa dengan NISN " . $nisn . " tidak ditemukan"
            );

        }


        $idSiswa = (int) $siswa['id'];


        // Simpan hasil clustering
        mysqli_stmt_bind_param(
            $stmtHasil,
            "iiddd",
            $idSiswa,
            $cluster,
            $jarakC1,
            $jarakC2,
            $jarakC3
        );

        mysqli_stmt_execute(
            $stmtHasil
        );

    }


    // Jika semua berhasil
    mysqli_commit($conn);


    echo json_encode([

        "status" => true,

        "message" =>
            "Hasil clustering berhasil disimpan",

        "jumlah" =>
            count($dataClustering)

    ]);


} catch (Exception $e) {

    // Jika ada kesalahan, batalkan semua perubahan
    mysqli_rollback($conn);


    echo json_encode([

        "status" => false,

        "message" =>
            "Gagal menyimpan hasil clustering: "
            . $e->getMessage()

    ]);

}

?>