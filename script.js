/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const mangaGrid = document.getElementById("manga-grid");
  const searchInput = document.getElementById("search");
  const searchButton = document.getElementById("search-btn"); // Search button element
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
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
      navbar.classList.toggle("open");
    });
  }

  // Handle search button click
  searchButton.addEventListener("click", () => {
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
      mangaGrid.innerHTML = ""; // Clear existing manga grid before new search
      fetchManga(1, searchQuery); // Start the search with page 1 and search query
    }
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
              <h3 class="manga-title" data-manga-id="${manga.id}">${title}</h3>
              <button class="favorite-button" data-manga-id="${manga.id}">Add to Favorites</button>
            `;
            mangaGrid.appendChild(card);

            // Event listener for clicking on the manga title
            const titleElement = card.querySelector(".manga-title");
            titleElement.addEventListener("click", () => {
              window.location.href = `manga_details.html?id=${mangaId}`;
            });

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
  mangaGrid?.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("favorite-button")) {
      const mangaId = e.target.getAttribute("data-manga-id");
      toggleFavorite(mangaId);
    }
  });
});
