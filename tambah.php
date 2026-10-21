<?php
include "koneksi.php";

$data = json_decode(file_get_contents("php://input"));

$nama     = $data->nama;
$nisn     = $data->nisn;
$agama    = $data->agama;
$ppkn     = $data->ppkn;
$indo     = $data->indo;
$inggris  = $data->inggris;
$mtk      = $data->mtk;
$ipas     = $data->ipas;
$pjok     = $data->pjok;
$seni     = $data->seni;

$sql = "INSERT INTO siswa
(nama, nisn, agama, ppkn, bindonesia, binggris, mtk, ipas, pjok, seni)
VALUES
('$nama','$nisn','$agama','$ppkn','$indo','$inggris','$mtk','$ipas','$pjok','$seni')";

if(mysqli_query($conn, $sql)){
    echo json_encode([
        "status" => "success",
        "message" => "Data berhasil disimpan"
    ]);
}else{
    echo json_encode([
        "status" => "error",
        "message" => mysqli_error($conn)
    ]);
}
?>