<?php
include('db_connection.php');

// Query to get all rows from the favorites table
$sql = "SELECT manga_id FROM favorites";
$result = mysqli_query($conn, $sql);

if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}

$favorites = [];

// Loop through all manga_ids from the favorites table
while ($row = mysqli_fetch_assoc($result)) {
    $manga_id = $row['manga_id'];

    // Use MangaDex API to fetch manga details using the manga_id with reference expansion
    $apiUrl = "https://api.mangadex.org/manga/$manga_id?includes[]=cover_art"; // Adding reference expansion for cover_art
    
    // Initialize cURL
    $ch = curl_init($apiUrl);
    
    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FAILONERROR, true); // This will make it fail on errors (like 400, 404)
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "User-Agent: MangaReaderApp/1.0 (https://yourwebsite.com; contact@yourwebsite.com)"
    ]);
    
    // Execute the request
    $response = curl_exec($ch);
    
    // Check if cURL request was successful
    if ($response === false) {
        $error_msg = curl_error($ch);
        echo json_encode(["error" => "cURL Error: " . $error_msg]);
        curl_close($ch);
        exit;
    }

    // Get HTTP status code
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpCode != 200) {
        echo json_encode(["error" => "HTTP Error $httpCode: Could not fetch manga details"]);
        curl_close($ch);
        exit;
    }

    // Decode the JSON response to manipulate the data
    $mangaData = json_decode($response, true);
    
    // Check if manga data is valid
    if ($mangaData && isset($mangaData['data'])) {
        $manga = $mangaData['data'];

        // Initialize the cover image URL to a placeholder
        $coverUrl = 'https://via.placeholder.com/200x300.png?text=No+Cover';

        // Check the cover_art relationship
        if (isset($manga['relationships'])) {
            foreach ($manga['relationships'] as $relationship) {
                if ($relationship['type'] === 'cover_art' && isset($relationship['attributes']['fileName'])) {
                    // Construct the cover image URL
                    $coverUrl = 'https://uploads.mangadex.org/covers/' . $manga_id . '/' . $relationship['attributes']['fileName'];
                    break; // Stop once we find the cover
                }
            }
        }

        // Add the manga to the favorites array
        $favorites[] = [
            'manga_id' => $manga_id,
            'title' => $manga['attributes']['title']['en'] ?? 'No Title',
            'description' => $manga['attributes']['description']['en'] ?? 'No Description',
            'cover_image' => $coverUrl
        ];
    }

    // Close the cURL session
    curl_close($ch);
}

// Close the database connection
mysqli_close($conn);

// Return the favorites data as JSON
header('Content-Type: application/json');
echo json_encode($favorites);
?>
