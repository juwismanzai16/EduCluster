<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$nama = $data['nama'];
$nisn = $data['nisn'];
$agama = $data['agama'];
$ppkn = $data['ppkn'];
$bindonesia = $data['indo'];
$binggris = $data['inggris'];
$mtk = $data['mtk'];
$ipas = $data['ipas'];
$pjok = $data['pjok'];
$seni = $data['seni'];

// ID admin yang sedang login
$created_by = $data['id_admin'] ?? null;

$sql = "INSERT INTO siswa
(Nama, Nisn, Agama, PPKN, Bindonesia, Binggris, MTK, IPAS, PJOK, Seni, created_by)
VALUES
('$nama', '$nisn', '$agama', '$ppkn', '$bindonesia', '$binggris', '$mtk', '$ipas', '$pjok', '$seni', '$created_by')";

if (mysqli_query($conn, $sql)) {
    echo json_encode([
        "status" => "success",
        "message" => "Data berhasil disimpan"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => mysqli_error($conn)
    ]);
}
?>