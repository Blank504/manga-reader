<?php
// Start the session
session_start();

// Check if the user is logged in by checking a session variable (e.g., 'user_id')
if (!isset($_SESSION['user_id'])) {
    // If not logged in, redirect to the login page
    header('Location: login.html');
    exit();
}
?>