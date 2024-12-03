/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const mangaGrid = document.getElementById("manga-grid");
  const searchInput = document.getElementById("search");
  const loadingIndicator = document.getElementById("loading-indicator");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const navbar = document.getElementById("navbar");
  const favoritesLink = document.getElementById("favorites-link");
  const favoritesSection = document.getElementById("favorites");
  let mangaData = [];
  let totalManga = 0;
  let isLoading = false;
  let currentPage = 1;
  const itemsPerPage = 10;

  // Toggle navbar visibility
  hamburgerMenu.addEventListener("click", () => {
    navbar.classList.toggle("open");
  });

  // Fetch manga data
  function fetchManga(page, searchQuery = "") {
    if (isLoading) return;
    isLoading = true;
    loadingIndicator.style.display = "block";

    const searchParam = searchQuery ? `&search=${searchQuery}` : "";
    fetch(`fetch_manga.php?page=${page}&limit=${itemsPerPage}${searchParam}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          mangaGrid.innerHTML = `<p>Error: ${data.error}</p>`;
          return;
        }

        totalManga = data.total || 0;
        mangaData = [...mangaData, ...data.data];
        displayManga(data.data);

        isLoading = false;
        loadingIndicator.style.display = "none";
      })
      .catch((error) => {
        console.error("Failed to fetch manga:", error);
        isLoading = false;
        loadingIndicator.style.display = "none";
      });
  }

  // Display manga in the grid
  function displayManga(mangaData) {
    mangaData.forEach((manga) => {
      const title = manga.attributes.title.en || "Unknown Title";
      let coverUrl = "https://via.placeholder.com/256x400?text=No+Cover";

      const coverArt = manga.relationships.find(
        (rel) => rel.type === "cover_art"
      );

      if (coverArt) {
        const mangaId = manga.id;
        const coverId = coverArt.id;

        fetch(`https://api.mangadex.org/cover/${coverId}`)
          .then((res) => res.json())
          .then((coverData) => {
            if (coverData.data && coverData.data.attributes.fileName) {
              const fileName = coverData.data.attributes.fileName;
              coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
            }

            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
              <img src="${coverUrl}" alt="${title}">
              <h3>${title}</h3>
              <button class="favorite-button" data-manga-id="${manga.id}">Add to Favorites</button>
            `;
            mangaGrid.appendChild(card);

            // Update button state to "Favorite" if already in favorites
            updateFavoriteButtonState(manga.id);
          })
          .catch((error) => {
            console.error("Failed to fetch cover image:", error);
          });
      }
    });
  }

  // Function to handle adding/removing favorites
  function toggleFavorite(mangaId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const button = document.querySelector(`button[data-manga-id="${mangaId}"]`);

    // Check if the manga is already in favorites
    if (favorites.includes(mangaId)) {
      // Remove from localStorage and from the database
      favorites = favorites.filter((id) => id !== mangaId);
      localStorage.setItem("favorites", JSON.stringify(favorites));

      // Send request to remove from the database
      fetch("remove_favorite.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `manga_id=${mangaId}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            console.log("Removed from favorites");
            button.textContent = "Add to Favorites"; // Change button text to "Add to Favorites"
          } else {
            console.error("Failed to remove from favorites");
          }
        })
        .catch((error) => {
          console.error("Error removing from favorites:", error);
        });
    } else {
      // Add to localStorage and to the database
      favorites.push(mangaId);
      localStorage.setItem("favorites", JSON.stringify(favorites));

      // Send request to add to the database
      fetch("add_favorite.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `manga_id=${mangaId}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            console.log("Added to favorites");
            button.textContent = "Favorite"; // Change button text to "Favorite"
          } else {
            console.error("Failed to add to favorites");
          }
        })
        .catch((error) => {
          console.error("Error adding to favorites:", error);
        });
    }
  }

  // Function to update the button text based on the current favorite state
  function updateFavoriteButtonState(mangaId) {
    const button = document.querySelector(`button[data-manga-id="${mangaId}"]`);
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(mangaId)) {
      button.textContent = "Favorite"; // Change button text to "Favorite"
    } else {
      button.textContent = "Add to Favorites"; // Otherwise, show "Add to Favorites"
    }
  }

  // Show Favorites when the link is clicked
  favoritesLink.addEventListener("click", function (event) {
    event.preventDefault();
    hideAllSections();
    showFavorites();
  });

  // Hide all sections except the homepage
  function hideAllSections() {
    const allSections = document.querySelectorAll("section");
    allSections.forEach((section) => {
      section.style.display = "none";
    });
  }

  function showFavorites() {
    favoritesSection.style.display = "block";
    const favoritesGrid = document.getElementById("favorites-grid");
    favoritesGrid.innerHTML = ""; // Clear existing content

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Check if the element exists
    if (!favoritesGrid) {
      console.error("favorites-grid element not found");
      return;
    }

    // Check if favorites exist
    if (favorites.length === 0) {
      favoritesGrid.innerHTML = "<p>No favorite manga found.</p>";
      return;
    }

    // Fetch manga details for each favorite manga item from the database
    favorites.forEach((mangaId) => {
      fetch(`fetch_favorite_manga.php?manga_id=${mangaId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch manga");
          }
          return response.json();
        })
        .then((manga) => {
          if (manga && manga.status === "success" && manga.manga) {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
              <h3>${manga.manga.title}</h3>
              <button onclick="removeFromFavorites('${manga.manga.id}')">Remove from Favorites</button>
            `;
            favoritesGrid.appendChild(card);
          } else {
            console.error("Invalid manga data:", manga);
          }
        })
        .catch((error) => {
          console.error("Error fetching favorite manga details:", error);
        });
    });
  }

  // Function to remove manga from favorites section
  function removeFromFavorites(mangaId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter((id) => id !== mangaId);
    localStorage.setItem("favorites", JSON.stringify(favorites));

    fetch("remove_favorite.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `manga_id=${mangaId}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          console.log("Removed from favorites");
        } else {
          console.error("Failed to remove from favorites");
        }
      })
      .catch((error) => {
        console.error("Error removing from favorites:", error);
      });

    showFavorites(); // Refresh the favorites list
  }

  // Infinite scroll functionality
  document.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 10 &&
      !isLoading &&
      currentPage * itemsPerPage < totalManga
    ) {
      currentPage++;
      fetchManga(currentPage);
    }
  });

  // Initial fetch for manga
  fetchManga(currentPage);

  // Add event listeners for the favorite buttons dynamically
  mangaGrid.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("favorite-button")) {
      const mangaId = e.target.getAttribute("data-manga-id");
      toggleFavorite(mangaId);
    }
  });
});
