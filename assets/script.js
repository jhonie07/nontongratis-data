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
            allMovies = data.movies || data || []; // Support berbagai format JSON
            
            // Ambil kategori unik dari data
            const genreSet = new Set();
            allMovies.forEach(movie => {
                if (movie.genre) {
                    // Bisa multiple genre (dipisah koma)
                    movie.genre.split(",").forEach(g => genreSet.add(g.trim()));
                }
                if (movie.category) genreSet.add(movie.category);
            });
            categories = Array.from(genreSet);
            
            // Render semua
            renderCategories();
            renderMovies(allMovies);
            
        } catch (error) {
            console.error("❌ Error fetch movies.json:", error);
            // Fallback ke data dummy kalau gagal
            useFallbackData();
        } finally {
            if (loading) loading.style.display = "none";
        }
    }

    // ============ FALLBACK DATA (JIKA movies.json GAGAL) ============
    function useFallbackData() {
        console.warn("⚠️ Menggunakan data fallback");
        allMovies = [
            { title: "护卫者", year: "2024", genre: "Action", rating: "8.5", img: "https://via.placeholder.com/300x200/333/e50914?text=Hu+Wei+Zhe" },
            { title: "决战", year: "2024", genre: "Action", rating: "7.9", img: "https://via.placeholder.com/300x200/333/e50914?text=Jue+Zhan" },
            { title: "Action Indo 1", year: "2023", genre: "Action", rating: "8.1", img: "https://via.placeholder.com/300x200/333/e50914?text=Action+1" },
            { title: "Drama Korea", year: "2024", genre: "Drama", rating: "9.0", img: "https://via.placeholder.com/300x200/333/e50914?text=Drama" },
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
        
        // Tambah tombol "All"
        const allBtn = document.createElement("button");
        allBtn.className = "category-btn active";
        allBtn.textContent = "Semua";
        allBtn.onclick = () => {
            renderMovies(allMovies);
            setActiveCategory("Semua");
        };
        catContainer.appendChild(allBtn);
        
        // Tambah kategori dari movies.json
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
            const movieCategory = movie.category || "";
            return movieGenres.includes(category) || movieCategory === category;
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
            
            // Handle berbagai format image
            const imgSrc = movie.img || movie.poster || movie.image || movie.thumbnail || 
                          `https://via.placeholder.com/300x200/333/e50914?text=${encodeURIComponent(movie.title || 'Film')}`;
            
            // Handle rating
            const rating = movie.rating || movie.imdbRating || movie.score || "?";
            
            // Handle tahun
            const year = movie.year || movie.releaseDate?.substring(0,4) || "2024";
            
            // Handle genre display
            const genreDisplay = movie.genre || movie.category || "Unknown";
            
            card.innerHTML = `
                <div style="position: relative;">
                    <img src="${imgSrc}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/333/e50914?text=No+Image'">
                    <span class="rating">⭐ ${rating}</span>
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
        // Simpan data film lengkap ke localStorage
        localStorage.setItem("currentMovie", JSON.stringify(movie));
        
        // Bisa juga kirim via URL parameter (opsional)
        // window.location.href = `player.html?id=${movie.id}`;
        
        window.location.href = "player.html";
    }

    // ============ SEARCH FUNCTION ============
    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allMovies.filter(m => 
                (m.title && m.title.toLowerCase().includes(term)) || 
                (m.genre && m.genre.toLowerCase().includes(term)) ||
                (m.description && m.description.toLowerCase().includes(term))
            );
            renderMovies(filtered);
            
            // Reset kategori active ke "Semua"
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
        // Ambil data dari localStorage
        const movieData = JSON.parse(localStorage.getItem("currentMovie") || "{}");
        
        // Set judul dan info
        titleEl.textContent = movieData.title || "Judul Film";
        const year = movieData.year || movieData.releaseDate?.substring(0,4) || "2024";
        const genre = movieData.genre || movieData.category || "Unknown";
        const rating = movieData.rating || movieData.imdbRating || "?";
        infoEl.textContent = `${year} • ${genre} • ⭐ ${rating}`;
        
        // Set video source (PENTING: GANTI DENGAN LOGIC PLAYER KAMU)
        const videoId = movieData.videoId || movieData.id || movieData.slug || "";
        
        // Contoh jika pakai embed dari server tertentu
        // GANTI BAGIAN INI SESUAI SUMBER VIDEO KAMU
        if (movieData.embedUrl) {
            videoFrame.src = movieData.embedUrl;
        } else if (movieData.videoId) {
            // Contoh: videoFrame.src = `https://example.com/embed/${videoId}`;
            videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else {
            // Placeholder
            videoFrame.src = "https://www.youtube.com/embed/dQw4w9WgXcQ";
        }
        
        // Render episode buttons (jika ada data episodes)
        if (episodesContainer && movieData.episodes) {
            episodesContainer.innerHTML = "";
            movieData.episodes.forEach((ep, index) => {
                const btn = document.createElement("button");
                btn.className = "episode-btn";
                btn.textContent = ep.title || `Episode ${index + 1}`;
                btn.onclick = () => {
                    // Ganti URL video
                    if (ep.url) videoFrame.src = ep.url;
                    if (ep.embedUrl) videoFrame.src = ep.embedUrl;
                    
                    // Update active state
                    document.querySelectorAll(".episode-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                };
                episodesContainer.appendChild(btn);
            });
        }
        
        // Render rekomendasi (dari allMovies, random 3)
        if (recommendContainer && window.allMovies) {
            renderRecommendations();
        }
    }

    function renderRecommendations() {
        if (!recommendContainer) return;
        recommendContainer.innerHTML = "";
        
        // Ambil 3 film random dari allMovies (kalau data sudah di-fetch)
        const moviesData = window.allMovies || allMovies;
        if (moviesData.length === 0) return;
        
        const shuffled = [...moviesData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        selected.forEach(movie => {
            const card = document.createElement("div");
            card.className = "rec-card";
            card.onclick = () => {
                localStorage.setItem("currentMovie", JSON.stringify(movie));
                window.location.reload();
            };
            
            const imgSrc = movie.img || movie.poster || movie.image || 
                          `https://via.placeholder.com/120x160/333/e50914?text=${encodeURIComponent(movie.title || 'Film')}`;
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/120x160/333/e50914?text=No+Image'">
                <span>${movie.title || "Untitled"}</span>
            `;
            recommendContainer.appendChild(card);
        });
    }

    // ============ INIT ============
    // Fetch data dari movies.json saat halaman load
    fetchMovies();

    // Expose allMovies ke window untuk digunakan di player page
    window.allMovies = allMovies;

    console.log("✅ Script loaded - Connected to movies.json");
});
