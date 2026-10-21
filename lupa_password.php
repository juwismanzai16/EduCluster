<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

include "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$password_baru = $data['password_baru'] ?? '';

if ($username == '' || $password_baru == '') {
    echo json_encode([
        "status" => false,
        "message" => "Username dan password baru harus diisi"
    ]);
    exit;
}

$sql = "UPDATE admin 
        SET password = ?
        WHERE username = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $password_baru, $username);

if ($stmt->execute()) {

    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "status" => true,
            "message" => "Password berhasil diubah"
        ]);
    } else {
        echo json_encode([
            "status" => false,
            "message" => "Username tidak ditemukan"
        ]);
    }

} else {

    echo json_encode([
        "status" => false,
        "message" => "Password gagal diubah"
    ]);
}

$stmt->close();
$conn->close();

?>