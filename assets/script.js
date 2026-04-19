/* ============================
   NONTON GRATIS — GOD MODE JS
   ============================ */

const JSON_URL = "/movies.json";
const movieContainer = document.getElementById("movies");
const categoryContainer = document.getElementById("categories");
const searchInput = document.getElementById("search");

/* ============================
   LOAD DATA UTAMA
   ============================ */
async function loadMovies() {
    try {
        const req = await fetch(JSON_URL);
        const data = await req.json();

        // Flatten movie + series episodes
        window.flatList = [];

        data.forEach(item => {
            if (item.type === "movie") {
                window.flatList.push({
                    title: item.title,
                    poster: item.poster,
                    embed: item.embed,
                    genre: item.genre,
                    year: item.year,
                    type: "movie"
                });
            } else if (item.type === "series") {
                item.episodes.forEach(ep => {
                    window.flatList.push({
                        title: `${item.title} - ${ep.ep}`,
                        poster: item.poster,
                        embed: ep.embed,
                        genre: item.genre,
                        year: item.year,
                        type: "episode"
                    });
                });
            }
        });

        generateCategories(window.flatList);
        displayMovies(window.flatList);

    } catch (err) {
        movieContainer.innerHTML = "<p style='color:white'>Gagal memuat data...</p>";
    }
}

/* ============================
   TAMPILKAN MOVIES DI BERANDA
   ============================ */
function displayMovies(list) {
    let html = "";

    list.forEach((m, index) => {
        html += `
        <div class="movie-card" onclick="location.href='/player.html?id=${index}'">
            <img src="${m.poster}" alt="${m.title}">
            <div class="title">${m.title}</div>
        </div>`;
    });

    movieContainer.innerHTML = html;
}

/* ============================
   BUAT KATEGORI OTOMATIS
   ============================ */
function generateCategories(list) {
    const genres = [...new Set(list.map(m => m.genre))];

    let html = `<button class="cat-btn" onclick="displayMovies(window.flatList)">All</button>`;

    genres.forEach(g => {
        html += `<button class="cat-btn" onclick="filterGenre('${g}')">${g}</button>`;
    });

    categoryContainer.innerHTML = html;
}

function filterGenre(g) {
    const filtered = window.flatList.filter(m => m.genre === g);
    displayMovies(filtered);
}

/* ============================
   FITUR PENCARIAN
   ============================ */
searchInput?.addEventListener("input", () => {
    const key = searchInput.value.toLowerCase();

    const filtered = window.flatList.filter(m =>
        m.title.toLowerCase().includes(key)
    );

    displayMovies(filtered);
});

/* ============================
   RUN
   ============================ */
loadMovies();
