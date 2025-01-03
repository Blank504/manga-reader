<?php
// Get 'page', 'limit', and 'search' parameters from the query string, default to 1 and 10 if not set
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$search = isset($_GET['search']) ? $_GET['search'] : ''; // Get search query

// Calculate offset based on page and limit
$offset = ($page - 1) * $limit;

// Base API URL with dynamic query parameters for pagination and search
$apiUrl = "https://api.mangadex.org/manga?limit=$limit&offset=$offset&availableTranslatedLanguage[]=en&includes[]=cover_art";

// If there is a search query, modify the API URL to include the search term
if (!empty($search)) {
    $apiUrl .= "&title=$search"; // Add the search term to the URL using title=
}

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
    echo json_encode(["error" => "HTTP Error $httpCode: Could not fetch manga"]);
    curl_close($ch);
    exit;
}

// Close cURL
curl_close($ch);

// Decode the JSON response to manipulate the data (if needed)
$data = json_decode($response, true);

// Return successful response with total manga count and paginated data
header('Content-Type: application/json');
echo json_encode([
    'total' => $data['total'],  // Total number of manga
    'data' => $data['data']     // Manga data for the current page
]);
?>
