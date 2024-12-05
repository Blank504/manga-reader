/** @format */

document.addEventListener("DOMContentLoaded", function () {
  // Handle logout action
  document.getElementById("logout-link").addEventListener("click", function () {
    // Send request to server to clear the session
    fetch("logout.php", {
      method: "GET", // Using GET to trigger the PHP script that destroys the session
    })
      .then((response) => {
        window.location.href = "login.html"; // Redirect to login page after logout
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        alert("An error occurred while logging out. Please try again.");
      });
  });
});
