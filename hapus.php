<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include "koneksi.php";

// Ambil data JSON dari Angular
$data = json_decode(file_get_contents("php://input"), true);

// Cek apakah ada data yang dikirim
if (!$data) {
    echo json_encode([
        "status" => "error",
        "message" => "Tidak ada data yang dikirim"
    ]);
    exit;
}

// Cek apakah id tersedia
if (!isset($data['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "ID tidak ditemukan"
    ]);
    exit;
}

$id = $data['id'];

// Hapus data berdasarkan ID
$sql = "DELETE FROM siswa WHERE id='$id'";

if (mysqli_query($conn, $sql)) {

    echo json_encode([
        "status" => "success",
        "message" => "Data berhasil dihapus"
    ]);

} else {

    echo json_encode([
        "status" => "error",
        "message" => mysqli_error($conn)
    ]);

}

mysqli_close($conn);

?>