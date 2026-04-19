// ===============================
// KONFIGURASI
// ===============================
const DATA_URL = "https://raw.githubusercontent.com/jhonie07/nontongratis/main/movies.json";

// ELEMENT
const moviesEl = document.getElementById("movies");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");
const loadingEl = document.getElementById("loading");


// ===============================
// LOAD HOMEPAGE
// ===============================
async function loadMovies() {
    try {
        loadingEl.style.display = "block";

        const res = await fetch(DATA_URL + "?v=" + Date.now());
        const data = await res.json();

        loadingEl.style.display = "none";

        window.ALL_MOVIES = data;

        // Buat kategori otomatis
        const categories = [...new Set(data.map(m => m.genre))];

        categoriesEl.innerHTML = categories.map(c =>
            `<button class="cat" onclick="filterCategory('${c}')">${c}</button>`
        ).join("");

        renderMovies(data);

        // Search
        searchEl.addEventListener("input", () => {
            const key = searchEl.value.toLowerCase();
            const filter = data.filter(m => m.title.toLowerCase().includes(key));
            renderMovies(filter);
        });

    } catch (err) {
        loadingEl.innerHTML = "Gagal memuat data";
    }
}


// ===============================
// RENDER DAFTAR FILM
// ===============================
function renderMovies(list) {
    if (!moviesEl) return;

    moviesEl.innerHTML = list.map(m => `
        <div class="card" onclick="openMovie('${encodeURIComponent(m.title)}')">
            <img src="${m.poster}" alt="${m.title}">
            <div class="title">${m.title}</div>
        </div>
    `).join("");
}


// ===============================
// FILTER KATEGORI
// ===============================
function filterCategory(cat) {
    const filtered = window.ALL_MOVIES.filter(m => m.genre === cat);
    renderMovies(filtered);
}


// ===============================
// BUKA FILM
// ===============================
function openMovie(title) {
    window.location.href = "player.html?title=" + title;
}


// ===============================
// LOAD PLAYER
// ===============================
async function loadPlayer() {
    const p = new URLSearchParams(window.location.search);
    const title = decodeURIComponent(p.get("title"));

    if (!title) return;

    // Ambil data fresh
    const res = await fetch(DATA_URL + "?v=" + Date.now());
    const data = await res.json();

    const movie = data.find(m => m.title === title);
    if (!movie) return;

    const frame = document.getElementById("videoFrame");
    const titleEl = document.getElementById("title");
    const infoEl = document.getElementById("info");
    const epList = document.getElementById("recommend");

    titleEl.innerText = movie.title;
    infoEl.innerText = movie.genre + " • " + movie.year;

    // ============================
    // MOVIE MODE
    // ============================
    if (movie.type === "movie") {
        frame.src = movie.embed;
        return;
    }

    // ============================
    // SERIES MODE
    // ============================
    if (movie.type === "series") {
        if (!movie.episodes || movie.episodes.length === 0) {
            frame.src = "";
            epList.innerHTML = "<p>Tidak ada episode.</p>";
            return;
        }

        // Episode pertama
        frame.src = movie.episodes[0].embed;

        // Buat tombol episode
        epList.innerHTML = movie.episodes.map(ep => `
            <button class="ep-btn" onclick="changeEp('${ep.embed}')">
                ${ep.ep}
            </button>
        `).join("");
    }
}


// ===============================
// GANTI EPISODE
// ===============================
function changeEp(url) {
    document.getElementById("videoFrame").src = url;
}


// ===============================
// AUTO RUN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    if (moviesEl) loadMovies();
    if (document.getElementById("videoFrame")) loadPlayer();
});
