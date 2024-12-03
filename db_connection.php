<?php
$host = "localhost";
$user = "root"; 
$password = ""; 
$dbname = "manga_reader"; // Change this to your database name

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
