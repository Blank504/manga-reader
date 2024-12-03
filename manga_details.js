/** @format */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = urlParams.get("id"); // Get manga ID from the URL query parameter

  if (!mangaId) {
    alert("Manga ID is missing!");
    return;
  }

  // Fetch manga details from MangaDex API
  fetch(`https://api.mangadex.org/manga/${mangaId}`)
    .then((response) => response.json())
    .then((data) => {
      const manga = data.data;

      // Manga Title
      const mangaTitle = manga.attributes.title.en || "Unknown Title";
      document.getElementById("manga-title").textContent = mangaTitle;

      // Manga Cover Image
      const coverArt = manga.relationships.find(
        (rel) => rel.type === "cover_art"
      );
      if (coverArt) {
        const coverId = coverArt.id;
        fetch(`https://api.mangadex.org/cover/${coverId}`)
          .then((coverRes) => coverRes.json())
          .then((coverData) => {
            const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverData.data.attributes.fileName}`;
            document.getElementById("manga-cover").src = coverUrl;
          })
          .catch((error) =>
            console.error("Error fetching cover image:", error)
          );
      }

      // Manga Description
      const mangaDescription =
        manga.attributes.description.en || "No description available.";
      document.getElementById("manga-description").textContent =
        mangaDescription;

      // Fetch chapters using the feed endpoint
      fetch(`https://api.mangadex.org/manga/${mangaId}/feed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((feedData) => {
          const chaptersList = document.getElementById("chapter-list");

          // Check if there are chapters in the feed
          if (feedData && feedData.data && feedData.data.length > 0) {
            let chapters = feedData.data;

            // Sort chapters by the chapter number (in ascending order)
            chapters = chapters.sort((a, b) => {
              const chapterA = parseFloat(a.attributes.chapter);
              const chapterB = parseFloat(b.attributes.chapter);
              return chapterA - chapterB;
            });

            // Loop through chapters and add them to the dropdown list
            chapters.forEach((chapter) => {
              const li = document.createElement("li");
              li.textContent = `Chapter ${chapter.attributes.chapter} - ${chapter.attributes.title}`;
              li.setAttribute("data-chapter-id", chapter.id); // Store chapter ID as a data attribute
              li.style.cursor = "pointer"; // Add a pointer cursor to indicate it's clickable
              li.addEventListener("click", () => {
                loadChapterContent(chapter.id); // Pass chapter ID on click
              });
              chaptersList.appendChild(li);
            });

            // Optionally, load the first chapter if available
            loadChapterContent(chapters[0].id);
          } else {
            chaptersList.innerHTML =
              "<li>No chapters available for this manga.</li>";
          }
        })
        .catch((error) => {
          console.error("Error fetching chapters:", error);
          document.getElementById("chapter-list").innerHTML =
            "<li>Error loading chapters.</li>";
        });
    })
    .catch((error) => {
      console.error("Error fetching manga details:", error);
      const chaptersList = document.getElementById("chapter-list");
      chaptersList.innerHTML = "<li>Error loading chapters.</li>";
    });

  // Function to load chapter content (images)
  function loadChapterContent(chapterId) {
    if (!chapterId) {
      console.error("Invalid chapter ID");
      return;
    }

    console.log("Loading Chapter ID:", chapterId);

    // Clear previous content before loading the new chapter
    const chapterContentContainer = document.getElementById("chapter-content");
    chapterContentContainer.innerHTML = ""; // Clear any previous content

    // Fetch the chapter details using the at-home server endpoint
    fetch(`https://api.mangadex.org/at-home/server/${chapterId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Chapter not found");
        }
        return response.json();
      })
      .then((data) => {
        const host = data.baseUrl;
        const chapterHash = data.chapter.hash;
        const dataArray = data.chapter.data; // Array of image filenames

        // Loop through all the chapter images and display them
        dataArray.forEach((imageFileName) => {
          const img = document.createElement("img");
          img.src = `${host}/data/${chapterHash}/${imageFileName}`;
          img.alt = "Chapter Image";
          img.style.maxWidth = "100%"; // Ensure the image fits within the page
          img.style.marginBottom = "10px"; // Add some spacing between images
          chapterContentContainer.appendChild(img);
        });
      })
      .catch((error) => {
        console.error("Error loading chapter content:", error);
        document.getElementById("chapter-content").textContent =
          "Failed to load chapter content.";
      });
  }

  // Back-to-Top Button functionality
  const backToTopButton = document.getElementById("back-to-top");

  window.onscroll = function () {
    // Check if the user has scrolled down more than 200px
    if (
      document.body.scrollTop > 200 ||
      document.documentElement.scrollTop > 200
    ) {
      // Show the button when scrolled down
      backToTopButton.style.display = "block";
    } else {
      // Hide the button when at the top
      backToTopButton.style.display = "none";
    }
  };

  // Scroll to the top of the page when the back-to-top button is clicked
  function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
  }
});
