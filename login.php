<?php
// Include the database connection file
include('db_connection.php');

// Get the data from the POST request
$username = $_POST['username'];
$password = $_POST['password'];

// Query to fetch the user from the database
$sql = "SELECT * FROM user WHERE username = '$username' LIMIT 1";
$result = mysqli_query($conn, $sql);

// Check if user exists
if (mysqli_num_rows($result) > 0) {
    // Fetch the user data
    $user = mysqli_fetch_assoc($result);

    // Check if the password is correct
    if (password_verify($password, $user['password'])) {
        // Password is correct, return success
        echo json_encode(['status' => 'success']);
    } else {
        // Incorrect password
        echo json_encode(['status' => 'error', 'message' => 'Invalid password']);
    }
} else {
    // User not found
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
}

mysqli_close($conn);
?>
