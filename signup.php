<?php
include 'db_connection.php';

$username = $_POST['username'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Hash the password before storing

$sql = "SELECT * FROM user WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Username already exists']);
} else {
    $sql = "INSERT INTO user (username, password) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $password);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to register']);
    }
}

$stmt->close();
$conn->close();
?>
