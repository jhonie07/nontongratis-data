// URL JSON
const JSON_URL = "https://nontongratis.online/movies.json";

// ELEMENT
const moviesEl = document.getElementById("movies");
const categoriesEl = document.getElementById("categories");
const searchEl = document.getElementById("search");
const loadingEl = document.getElementById("loading");

// ------------------------------
// LOAD MOVIES
// ------------------------------
async function loadMovies() {
    try {
        loadingEl.style.display = "block";

        const res = await fetch(JSON_URL + "?v=" + Date.now()); // anti-cache
        const data = await res.json();

        loadingEl.style.display = "none";

        // GROUP CATEGORY
        const categories = [...new Set(data.map(m => m.genre))];

        categoriesEl.innerHTML = categories.map(c =>
            `<button class="cat" onclick="filterCategory('${c}')">${c}</button>`
        ).join("");

        window.ALL_MOVIES = data;
        renderMovies(data);

        // SEARCH
        searchEl.addEventListener("input", () => {
            const key = searchEl.value.toLowerCase();
            const filter = data.filter(m => m.title.toLowerCase().includes(key));
            renderMovies(filter);
        });

    } catch (e) {
        loadingEl.innerHTML = "Gagal Memuat Data";
    }
}

// ------------------------------
// RENDER MOVIE LIST
// ------------------------------
function renderMovies(list) {
    moviesEl.innerHTML = list
        .map(m => `
        <div class="card"
            onclick="openMovie('${encodeURIComponent(m.embed)}','${encodeURIComponent(m.title)}')">
            
            <img src="${m.poster}" alt="${m.title}">
            <div class="title">${m.title}</div>
        </div>
    `)
    .join("");
}

// ------------------------------
// FILTER CATEGORY
// ------------------------------
function filterCategory(cat) {
    const filtered = window.ALL_MOVIES.filter(m => m.genre === cat);
    renderMovies(filtered);
}

// ------------------------------
// OPEN MOVIE / SERIES
// ------------------------------
function openMovie(embed, title) {
    window.location.href = "player.html?play=" + embed + "&title=" + title;
}

// ------------------------------
// PLAYER PAGE SYSTEM
// ------------------------------
function loadPlayer() {
    const p = new URLSearchParams(window.location.search);
    const embed = decodeURIComponent(p.get("play"));
    const title = decodeURIComponent(p.get("title"));

    if (!embed) return;

    // SET TITLE
    document.getElementById("title").innerText = title;

    // CARI MOVIE DATA
    fetch(JSON_URL)
        .then(r => r.json())
        .then(db => {
            const movie = db.find(m => m.title === title);
            if (!movie) return;

            document.getElementById("info").innerText = movie.genre + " • " + movie.year;

            // MOVIE
            if (movie.type === "movie") {
                document.getElementById("videoFrame").src = embed;
            }

            // SERIES
            if (movie.type === "series") {
                let html = "";
                movie.episodes.forEach(ep => {
                    html += `
                        <button class="ep-btn" onclick="changeEp('${ep.embed}')">${ep.ep}</button>
                    `;
                });

                document.getElementById("recommend").innerHTML = html;
                document.getElementById("videoFrame").src = movie.episodes[0].embed;
            }
        });
}

function changeEp(url) {
    document.getElementById("videoFrame").src = url;
}

// ------------------------------
// AUTO RUN
// ------------------------------
if (document.getElementById("movies")) loadMovies();
if (document.getElementById("videoFrame")) setTimeout(loadPlayer, 300);
