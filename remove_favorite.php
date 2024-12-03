<?php
include 'db_connection.php'; // Ensure the database connection is included

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['manga_id'])) {
        $manga_id = $_POST['manga_id'];

        // Assuming you have a table for favorites
        $sql = "DELETE FROM favorites WHERE manga_id = '$manga_id'";

        if (mysqli_query($conn, $sql)) {
            // Reset the auto-increment value after the deletion
            $resetAutoIncrementSql = "ALTER TABLE favorites AUTO_INCREMENT = 1";
            mysqli_query($conn, $resetAutoIncrementSql);

            echo json_encode(['status' => 'success', 'message' => 'Manga removed and auto-increment reset']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Could not remove from favorites']);
        }
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}

?>
