document.addEventListener("DOMContentLoaded", function () {

    // ============ GLOBAL VARIABLES ============
    let allMovies = [];
    let categories = [];

    // ============ FETCH DATA DARI movies.json ============
    async function fetchMovies() {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "block";

        try {
            const response = await fetch("./movies.json");
            if (!response.ok) throw new Error("Gagal load movies.json");
            
            const data = await response.json();
            
            // Simpan ke global variable
            allMovies = data; // Data sudah berupa array
            
            // Ambil kategori unik dari data
            const genreSet = new Set();
            allMovies.forEach(movie => {
                if (movie.genre) {
                    movie.genre.split(",").forEach(g => genreSet.add(g.trim()));
                }
            });
            categories = Array.from(genreSet);
            
            // Render semua
            renderCategories();
            renderMovies(allMovies);
            
        } catch (error) {
            console.error("❌ Error fetch movies.json:", error);
            useFallbackData();
        } finally {
            if (loading) loading.style.display = "none";
        }
    }

    // ============ FALLBACK DATA ============
    function useFallbackData() {
        console.warn("⚠️ Menggunakan data fallback");
        allMovies = [
            { title: "Bodyguard 3", year: "2025", genre: "Action", poster: "https://raw.githubusercontent.com/jhonie07/nontongratis/main/bodyguard.jpg", embed: "https://www.dailymotion.com/embed/video/x9e11se" },
            { title: "The Raid", year: "2011", genre: "Action Indo", poster: "https://www.dailymotion.com/thumbnail/video/x918nyu", embed: "https://www.dailymotion.com/embed/video/x918nyu" },
            { title: "3 Iron", year: "2004", genre: "Action", poster: "https://www.dailymotion.com/thumbnail/video/x9p1fgw", embed: "https://www.dailymotion.com/embed/video/x9p1fgw" },
        ];
        categories = ["Action", "Action Indo", "Drama"];
        renderCategories();
        renderMovies(allMovies);
    }

    // ============ RENDER KATEGORI ============
    function renderCategories() {
        const catContainer = document.getElementById("categories");
        if (!catContainer) return;
        
        catContainer.innerHTML = "";
        
        const allBtn = document.createElement("button");
        allBtn.className = "category-btn active";
        allBtn.textContent = "Semua";
        allBtn.onclick = () => {
            renderMovies(allMovies);
            setActiveCategory("Semua");
        };
        catContainer.appendChild(allBtn);
        
        categories.sort().forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "category-btn";
            btn.textContent = cat;
            btn.onclick = () => {
                filterByCategory(cat);
                setActiveCategory(cat);
            };
            catContainer.appendChild(btn);
        });
    }

    function setActiveCategory(categoryName) {
        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.classList.remove("active");
            if (btn.textContent === categoryName) btn.classList.add("active");
        });
    }

    function filterByCategory(category) {
        const filtered = allMovies.filter(movie => {
            const movieGenres = movie.genre ? movie.genre.split(",").map(g => g.trim()) : [];
            return movieGenres.includes(category);
        });
        renderMovies(filtered);
    }

    // ============ RENDER FILM (GRID) ============
    const moviesContainer = document.getElementById("movies");
    
    function renderMovies(movieList) {
        if (!moviesContainer) return;
        moviesContainer.innerHTML = "";
        
        if (movieList.length === 0) {
            moviesContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:40px; color:#aaa;'>😕 Film tidak ditemukan</p>";
            return;
        }
        
        movieList.forEach(movie => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.onclick = () => openPlayer(movie);
            
            const imgSrc = movie.poster || movie.img || `https://via.placeholder.com/300x200/333/e50914?text=${encodeURIComponent(movie.title || 'Film')}`;
            const rating = movie.rating || "?";
            const year = movie.year || "2024";
            const genreDisplay = movie.genre || "Unknown";
            
            card.innerHTML = `
                <div style="position: relative;">
                    <img src="${imgSrc}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/333/e50914?text=No+Image'">
                    ${rating !== "?" ? `<span class="rating">⭐ ${rating}</span>` : ''}
                </div>
                <div class="movie-info">
                    <h3>${movie.title || "Untitled"}</h3>
                    <p>${year} • ${genreDisplay}</p>
                </div>
            `;
            
            moviesContainer.appendChild(card);
        });
    }

    // ============ OPEN PLAYER ============
    function openPlayer(movie) {
        localStorage.setItem("currentMovie", JSON.stringify(movie));
        window.location.href = "player.html";
    }

    // ============ SEARCH FUNCTION ============
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allMovies.filter(m => 
                (m.title && m.title.toLowerCase().includes(term)) || 
                (m.genre && m.genre.toLowerCase().includes(term))
            );
            renderMovies(filtered);
            setActiveCategory("Semua");
        });
    }

    // ============ PLAYER PAGE LOGIC ============
    const videoFrame = document.getElementById("videoFrame");
    const titleEl = document.getElementById("title");
    const infoEl = document.getElementById("info");
    const episodesContainer = document.getElementById("episodes");
    const recommendContainer = document.getElementById("recommend");
    
    if (videoFrame && titleEl && infoEl) {
        const movieData = JSON.parse(localStorage.getItem("currentMovie") || "{}");
        
        titleEl.textContent = movieData.title || "Judul Film";
        const year = movieData.year || "2024";
        const genre = movieData.genre || "Unknown";
        infoEl.textContent = `${year} • ${genre}`;
        
        // ============ SET VIDEO DAILYMOTION ============
        if (movieData.embed) {
            // Pastikan URL Dailymotion dalam format embed
            let embedUrl = movieData.embed;
            
            // Jika URL bukan format embed, konversi
            if (embedUrl.includes("dailymotion.com/video/")) {
                const videoId = embedUrl.split("/video/")[1].split("?")[0];
                embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
            }
            
            videoFrame.src = embedUrl + "?autoplay=1";
            console.log("🎬 Playing:", embedUrl);
        } else {
            // Fallback ke halaman kosong (BUKAN YouTube)
            videoFrame.src = "about:blank";
            console.warn("⚠️ Tidak ada URL embed untuk film ini");
        }
        
        // ============ RENDER EPISODES (UNTUK SERIES) ============
        if (episodesContainer) {
            episodesContainer.innerHTML = "";
            
            if (movieData.type === "series" && movieData.episodes && movieData.episodes.length > 0) {
                // Tampilkan judul episode
                const episodeTitle = document.getElementById("Episode");
                if (episodeTitle) episodeTitle.style.display = "block";
                
                movieData.episodes.forEach((ep, index) => {
                    const btn = document.createElement("button");
                    btn.className = "episode-btn";
                    btn.textContent = ep.ep || `Episode ${index + 1}`;
                    btn.onclick = () => {
                        if (ep.embed) {
                            let embedUrl = ep.embed;
                            if (embedUrl.includes("dailymotion.com/video/")) {
                                const videoId = embedUrl.split("/video/")[1];
                                embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
                            }
                            videoFrame.src = embedUrl + "?autoplay=1";
                        }
                        
                        document.querySelectorAll(".episode-btn").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                    };
                    episodesContainer.appendChild(btn);
                });
                
                // Aktifkan episode pertama
                if (movieData.episodes[0] && movieData.episodes[0].embed) {
                    let firstEmbed = movieData.episodes[0].embed;
                    if (firstEmbed.includes("dailymotion.com/video/")) {
                        const videoId = firstEmbed.split("/video/")[1];
                        firstEmbed = `https://www.dailymotion.com/embed/video/${videoId}`;
                    }
                    videoFrame.src = firstEmbed + "?autoplay=1";
                }
            } else {
                // Sembunyikan judul episode untuk movie
                const episodeTitle = document.getElementById("Episode");
                if (episodeTitle) episodeTitle.style.display = "none";
            }
        }
        
        // ============ RENDER REKOMENDASI ============
        if (recommendContainer) {
            recommendContainer.innerHTML = "";
            
            const moviesData = allMovies.length > 0 ? allMovies : [];
            if (moviesData.length === 0) return;
            
            const filtered = moviesData.filter(m => m.title !== movieData.title);
            const shuffled = [...filtered].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 4);
            
            selected.forEach(movie => {
                const card = document.createElement("div");
                card.className = "rec-card";
                card.onclick = () => {
                    localStorage.setItem("currentMovie", JSON.stringify(movie));
                    window.location.reload();
                };
                
                const imgSrc = movie.poster || movie.img || `https://via.placeholder.com/120x160/333/e50914?text=${encodeURIComponent(movie.title || 'Film')}`;
                
                card.innerHTML = `
                    <img src="${imgSrc}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/120x160/333/e50914?text=No+Image'">
                    <span>${movie.title || "Untitled"}</span>
                `;
                recommendContainer.appendChild(card);
            });
        }
    }

    // ============ INIT ============
    fetchMovies();
    window.allMovies = allMovies;

    console.log("✅ Script loaded - Dailymotion ready");
});
