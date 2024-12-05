<?php
// Include database connection
include('db_connection.php');

// Get data from POST request
$username = $_POST['username'];
$password = $_POST['password'];

// Hash the password before storing it in the database
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert user into the database
$sql = "INSERT INTO user (username, password) VALUES ('$username', '$hashed_password')";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['status' => 'success', 'message' => 'User registered successfully.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error registering user.']);
}

mysqli_close($conn);
?>
