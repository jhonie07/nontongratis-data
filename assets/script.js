// Sumber JSON
const DATA_URL = "movies.json";

// Home Page
if (document.getElementById("hero")) loadHome();
if (document.getElementById("videoFrame")) loadPlayer();

// Load Home Page
async function loadHome() {
    const res = await fetch(DATA_URL);
    const data = await res.json();

    window.DB = data;

    renderHero(data[0]);
    renderCategories(data);
    renderRows(data);
    setupSearch(data);
}

// Hero Section
function renderHero(m) {
    const hero = document.getElementById("hero");
    hero.style.backgroundImage = `url(${m.poster})`;

    hero.innerHTML = `
        <div class="hero-info">
            <h1>${m.title}</h1>
            <p>${m.genre} • ${m.year}</p>
            <button onclick="play('${m.title}')">▶ Play</button>
        </div>
    `;
}

// Categories
function renderCategories(data) {
    const box = document.getElementById("categories");
    const genres = [...new Set(data.map(m => m.genre))];

    box.innerHTML = genres
        .map(g => `<button class="cat-btn" onclick="filterGenre('${g}')">${g}</button>`)
        .join("");
}

// Netflix Rows
function renderRows(data) {
    const movies = document.getElementById("movies");
    const genres = [...new Set(data.map(m => m.genre))];

    movies.innerHTML = genres.map(g => {
        const list = data.filter(m => m.genre === g);

        return `
        <div class="row">
            <h2>${g}</h2>
            <div class="row-list">
                ${list.map(m => `
                    <div class="card" 
                         onmouseenter="preview('${m.embed}', this)"
                         onmouseleave="stopPreview(this)"
                         onclick="openDetail('${m.title}')">

                        <img src="${m.poster}">
                        <iframe class="trailer" muted allowfullscreen></iframe>
                    </div>
                `).join("")}
            </div>
        </div>`;
    }).join("");
}

// Auto Trailer Preview
function preview(url, card) {
    card.querySelector(".trailer").src = url;
}
function stopPreview(card) {
    card.querySelector(".trailer").src = "";
}

// Detail Modal
function openDetail(title) {
    const m = DB.find(x => x.title === title);

    document.getElementById("modalBody").innerHTML = `
        <h2>${m.title}</h2>
        <p>${m.genre} • ${m.year}</p>
        <button onclick="play('${m.title}')">▶ Putar</button>
        <button onclick="saveFav('${m.title}')">♡ Favorit</button>
    `;
    document.getElementById("modal").style.display = "flex";
}

// Close Modal
document.getElementById("modal").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

// Play Movie
function play(title) {
    location.href = "player.html?title=" + encodeURIComponent(title);
}

// Search
function setupSearch(data) {
    document.getElementById("search").oninput = e => {
        const key = e.target.value.toLowerCase();
        const found = data.filter(m => m.title.toLowerCase().includes(key));
        renderRows(found);
    };
}

function filterGenre(g) {
    const found = DB.filter(m => m.genre === g);
    renderRows(found);
}

// Favorite System
function saveFav(title) {
    let fav = JSON.parse(localStorage.getItem("fav") || "[]");

    if (!fav.includes(title)) fav.push(title);

    localStorage.setItem("fav", JSON.stringify(fav));
}

// Player Page
async function loadPlayer() {
    const q = new URLSearchParams(location.search);
    const title = decodeURIComponent(q.get("title"));

    const res = await fetch(DATA_URL);
    const data = await res.json();
    const m = data.find(x => x.title === title);

    document.getElementById("title").innerText = m.title;
    document.getElementById("info").innerText = m.genre + " • " + m.year;

    // History
    localStorage.setItem("last_watch", title);

    if (m.type === "movie") {
        document.getElementById("videoFrame").src = m.embed;
    }

    if (m.type === "series") {
        document.getElementById("videoFrame").src = m.episodes[0].embed;

        document.getElementById("episodes").innerHTML =
            m.episodes.map(ep =>
                `<button onclick="changeEp('${ep.embed}')">${ep.ep}</button>`
            ).join("");

        const rec = data.filter(x => x.genre === m.genre && x.title !== m.title);

        document.getElementById("recommend").innerHTML =
            rec.map(r =>
                `<div class="card" onclick="play('${r.title}')"><img src="${r.poster}"></div>`
            ).join("");
    }
}

// Change Episode
function changeEp(url) {
    document.getElementById("videoFrame").src = url;
}
