<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}


// =========================
// KONEKSI DATABASE
// =========================

$koneksi = new mysqli(
    "localhost",
    "root",
    "",
    "educluster"
);

if ($koneksi->connect_error) {

    echo json_encode([
        "status" => false,
        "message" => "Koneksi database gagal"
    ]);

    exit;
}


// =========================
// AMBIL DATA LOGIN
// =========================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';


// =========================
// CEK USERNAME & PASSWORD
// =========================

$sql = "SELECT * FROM admin WHERE username = ? AND password = ?";

$stmt = $koneksi->prepare($sql);

$stmt->bind_param(
    "ss",
    $username,
    $password
);

$stmt->execute();

$result = $stmt->get_result();


// =========================
// HASIL LOGIN
// =========================

if ($result->num_rows > 0) {

    $admin = $result->fetch_assoc();

    echo json_encode([
        "status" => true,
        "message" => "Login berhasil",
        "id_admin" => $admin['id'],
        "username" => $admin['username']
    ]);

} else {

    echo json_encode([
        "status" => false,
        "message" => "Username atau password salah"
    ]);

}

$stmt->close();
$koneksi->close();

?>