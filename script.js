const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("movies");
const themeBtn = document.getElementById("themeBtn");

// Movie Search
searchBtn.addEventListener("click", searchMovies);

async function searchMovies() {
    const movieName = searchInput.value.trim();

    if (movieName === "") {
        alert("Please enter a movie name");
        return;
    }

    const url = `https://www.omdbapi.com/?s=${movieName}&apikey=564727fa`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        moviesContainer.innerHTML = "";

        if (data.Response === "True") {
            data.Search.forEach(movie => {
                moviesContainer.innerHTML += `
                    <div class="movie-card">
                        <img src="${movie.Poster}" alt="${movie.Title}">
                        <h3>${movie.Title}</h3>
                        <p>${movie.Year}</p>
                    </div>
                `;
            });
        } else {
            moviesContainer.innerHTML = "<h2>No movies found.</h2>";
        }
    } catch (error) {
        moviesContainer.innerHTML = "<h2>Error loading movies.</h2>";
    }
}
