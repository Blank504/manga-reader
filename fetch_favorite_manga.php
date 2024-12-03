<?php
include 'db_connection.php'; // Include your database connection file

header('Content-Type: application/json'); // Set the response content type to JSON

// Check if manga_id is passed in the query parameters
if (isset($_GET['manga_id'])) {
    $manga_id = $_GET['manga_id'];

    // Query to fetch manga details based on the manga_id
    $sql = "SELECT * FROM manga_reader WHERE manga_id = '$manga_id'"; // Assuming you have a 'manga' table with manga details
    $result = mysqli_query($conn, $sql);

    // If the query is successful and returns results
    if ($result && mysqli_num_rows($result) > 0) {
        $mangaDetails = mysqli_fetch_assoc($result); // Fetch the first result (you can modify for more)

        echo json_encode(['status' => 'success', 'manga' => $mangaDetails]);
    } else {
        // If no manga is found
        echo json_encode(['status' => 'error', 'message' => 'No manga found with the given ID']);
    }
} else {
    // If no manga_id is provided
    echo json_encode(['status' => 'error', 'message' => 'Manga ID not provided']);
}
?>
