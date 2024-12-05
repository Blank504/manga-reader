/** @format */

document.addEventListener("DOMContentLoaded", function () {
  // Function to handle Signup
  function handleSignup() {
    // Get the form values (username and password)
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    // Perform basic validation (check if username and password are not empty)
    if (!username || !password) {
      alert("Please fill in both username and password.");
      return;
    }

    // Send data to the server
    fetch("signup.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${username}&password=${password}`, // Send username and password to the server
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          // Show success message and hide error message
          document.getElementById("signup-success").style.display = "block";
          document.getElementById("signup-error").style.display = "none";

          // Redirect to login page after 2 seconds
          setTimeout(() => {
            window.location.href = "login.html"; // Redirect to login page
          }, 2000);
        } else {
          // Show error message and hide success message
          document.getElementById("signup-error").style.display = "block";
          document.getElementById("signup-success").style.display = "none";
        }
      })
      .catch((error) => {
        console.error("Error during signup:", error);
        alert("An error occurred. Please try again.");
      });
  }

  // Attach the handleSignup function to the global scope
  window.handleSignup = handleSignup;
});
