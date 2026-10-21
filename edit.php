<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];

$nama = $data['nama'];
$nisn = $data['nisn'];

$agama = $data['agama'];
$ppkn = $data['ppkn'];
$indo = $data['indo'];
$inggris = $data['inggris'];
$mtk = $data['mtk'];
$ipas = $data['ipas'];
$pjok = $data['pjok'];
$seni = $data['seni'];

// ID admin yang melakukan perubahan
$updated_by = $data['id_admin'] ?? null;

$sql = "UPDATE siswa SET
Nama='$nama',
Nisn='$nisn',
Agama='$agama',
PPKN='$ppkn',
BIndonesia='$indo',
Binggris='$inggris',
MTK='$mtk',
IPAS='$ipas',
PJOK='$pjok',
Seni='$seni',
updated_by='$updated_by'
WHERE id='$id'";

if(mysqli_query($conn,$sql)){
    echo json_encode([
        "status"=>"success",
        "message"=>"Data berhasil diubah"
    ]);
}else{
    echo json_encode([
        "status"=>"error",
        "message"=>mysqli_error($conn)
    ]);
}

?>