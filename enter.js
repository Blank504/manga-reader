/** @format */

document.addEventListener("DOMContentLoaded", function () {
  // Function to handle login
  function handleLogin() {
    // Get the form values (username and password)
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Perform basic validation (check if username and password are not empty)
    if (!username || !password) {
      alert("Please fill in both username and password.");
      return;
    }

    // Send data to the server for login
    fetch("login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${username}&password=${password}`, // Send username and password to the server
    })
      .then((response) => response.json()) // Parse the response as JSON
      .then((data) => {
        if (data.status === "success") {
          // Login success, redirect to the homepage (or any other page)
          window.location.href = "index.html"; // Redirect to home page
        } else {
          // Login failed, show error message
          document.getElementById("login-error").style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
      });
  }

  // Attach the handleLogin function to the global scope
  window.handleLogin = handleLogin;
});
