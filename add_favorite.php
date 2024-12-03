<?php
include 'db_connection.php'; // Ensure the database connection is included

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['manga_id'])) {
        $manga_id = $_POST['manga_id'];

        // Assuming you have a table for favorites
        $sql = "INSERT INTO favorites (manga_id) VALUES ('$manga_id')";

        if (mysqli_query($conn, $sql)) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Could not add to favorites']);
        }
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}
?>
