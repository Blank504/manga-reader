<?php
// Start the session
session_start();

// Destroy all session data
session_unset();
session_destroy();

// Redirect to the login page
header('Location: login.html');  // Redirect to login page after logging out
exit();
?>
