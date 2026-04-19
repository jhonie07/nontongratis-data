// JSON kamu
const DATA_URL = "https://raw.githubusercontent.com/jhonie07/nontongratis/main/movies.json";

// ======== HALAMAN INDEX ========
if (document.getElementById("movies")) {
    loadIndex();
}

async function loadIndex() {
    const moviesBox = document.getElementById("movies");
    const catsBox = document.getElementById("categories");
    const loading = document.getElementById("loading");

    try {
        const res = await fetch(DATA_URL);
        const data = await res.json();
        loading.style.display = "none";

        window.DB = data;

        // KATEGORI
        const genres = [...new Set(data.map(x => x.genre))];
        catsBox.innerHTML = genres.map(g =>
            `<button class="cat-btn" onclick="filterGenre('${g}')">${g}</button>`
        ).join("");

        // LIST FILM
        renderMovies(data);

        // SEARCH
        document.getElementById("search").addEventListener("input", e => {
            const key = e.target.value.toLowerCase();
            const filtered = data.filter(x => x.title.toLowerCase().includes(key));
            renderMovies(filtered);
        });

    } catch {
        loading.innerHTML = "Gagal memuat data...";
    }
}

function renderMovies(list) {
    document.getElementById("movies").innerHTML = list.map(m => `
        <div class="movie-card"
             onclick="location.href='player.html?title=${encodeURIComponent(m.title)}'">
            <img src="${m.poster}">
            <div class="movie-title">${m.title}</div>
        </div>
    `).join("");
}

function filterGenre(g) {
    const filtered = window.DB.filter(m => m.genre === g);
    renderMovies(filtered);
}


// ======== HALAMAN PLAYER ========
if (document.getElementById("videoFrame")) {
    loadPlayer();
}

async function loadPlayer() {
    const q = new URLSearchParams(location.search);
    const title = decodeURIComponent(q.get("title"));

    const res = await fetch(DATA_URL);
    const data = await res.json();

    const m = data.find(x => x.title === title);

    document.getElementById("title").innerText = m.title;
    document.getElementById("info").innerText = m.genre + " • " + m.year;

    // MOVIE
    if (m.type === "movie") {
        document.getElementById("videoFrame").src = m.embed;
    }

    // SERIES
    if (m.type === "series") {
        document.getElementById("videoFrame").src = m.episodes[0].embed;

        document.getElementById("episodes").innerHTML = m.episodes.map(ep => `
            <button onclick="changeEp('${ep.embed}')">${ep.ep}</button>
        `).join("");
    }
}

function changeEp(url) {
    document.getElementById("videoFrame").src = url;
}
