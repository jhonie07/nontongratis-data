document.addEventListener("DOMContentLoaded", function () {

    console.log("🚀 ADS.JS LOADED - Adsterra Native Banner & SmartLink");

    // ============ KONFIGURASI ADSTERRA (2 UNIT SAJA) ============
    const ADS = {
        // Native Banner Key
        nativeKey: 'b89b210b53a5733689e641617800809f',
        
        // SmartLink URL
        smartLink: 'https://www.profitablecpmratenetwork.com/bn48k6csg?key=5516f115076d4b128b3f012bebe1fcef',
        
        // Settings
        smartLinkDelay: 5000,      // 5 detik sebelum smartlink siap
        bannerRefresh: 120000      // 2 menit refresh banner
    };

    // ============ DETEKSI DEVICE ============
    const isMobile = window.innerWidth < 768;

    // ============ FUNGSI INJECT NATIVE BANNER ============
    function injectNativeBanner(targetId, width = 300, height = 250) {
        const el = document.getElementById(targetId);
        if (!el) {
            console.warn(`❌ Element #${targetId} tidak ditemukan`);
            return;
        }

        // Cegah inject berulang
        if (el.hasAttribute("data-ads-loaded")) return;
        el.setAttribute("data-ads-loaded", "true");

        // Buat container untuk Native Banner
        const adContainer = document.createElement("div");
        adContainer.id = `container-${ADS.nativeKey}`;
        adContainer.style.width = "100%";
        adContainer.style.maxWidth = width + "px";
        adContainer.style.margin = "0 auto";
        adContainer.style.textAlign = "center";
        adContainer.style.background = "#0a0a0a";
        adContainer.style.borderRadius = "8px";
        adContainer.style.padding = "10px 0";
        adContainer.style.overflow = "hidden";

        el.innerHTML = "";
        el.appendChild(adContainer);

        // Cek apakah script invoke sudah ada
        if (!document.querySelector(`script[src*="${ADS.nativeKey}"]`)) {
            const script = document.createElement("script");
            script.async = true;
            script.setAttribute("data-cfasync", "false");
            script.src = `https://pl29212280.profitablecpmratenetwork.com/${ADS.nativeKey}/invoke.js`;
            script.onload = () => console.log(`✅ Native Banner loaded ke #${targetId}`);
            script.onerror = () => console.warn(`⚠️ Native Banner gagal load`);
            
            document.head.appendChild(script);
        } else {
            console.log(`⏭️ Native Banner script sudah ada`);
        }

        console.log(`✅ Native Banner container dibuat di #${targetId} (${width}x${height})`);
    }

    // ============ FUNGSI SETUP SMARTLINK ============
    let smartLinkReady = false;
    let smartLinkTriggered = false;

    function setupSmartLink() {
        // Smartlink siap setelah delay
        setTimeout(() => {
            smartLinkReady = true;
            console.log("🔗 SmartLink siap (klik pertama akan trigger)");
        }, ADS.smartLinkDelay);

        // Deteksi klik pertama di halaman
        const handleFirstClick = function(e) {
            if (!smartLinkReady || smartLinkTriggered) return;
            
            smartLinkTriggered = true;
            
            // Buka smartlink di tab baru
            const win = window.open(ADS.smartLink, '_blank');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                // Fallback jika popup diblokir
                window.location.href = ADS.smartLink;
            }
            
            console.log("✅ SmartLink triggered");
            
            // Hapus listener setelah trigger
            document.removeEventListener('click', handleFirstClick);
        };
        
        document.addEventListener('click', handleFirstClick);
        console.log("⏳ SmartLink listener terpasang");
    }

    // ============ INJECT BANNER PLAYER (KHUSUS) ============
    function injectPlayerBanner() {
        const playerEl = document.getElementById("bannerPlayer");
        if (playerEl) {
            injectNativeBanner("bannerPlayer", 300, 250);
        }
    }

    // ============ INJECT SEMUA BANNER ============
    function injectAllBanners() {
        injectNativeBanner("bannerTop", 300, 250);
        injectNativeBanner("bannerHome", isMobile ? 300 : 336, isMobile ? 250 : 280);
        injectNativeBanner("bannerBottom", 300, 250);
        injectPlayerBanner();
    }

    // ============ REFRESH BANNER PERIODIK ============
    function startBannerRefresh() {
        setInterval(() => {
            console.log("🔄 Refreshing Native Banners...");
            ["bannerTop", "bannerHome", "bannerBottom", "bannerPlayer"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.removeAttribute("data-ads-loaded");
            });
            injectAllBanners();
        }, ADS.bannerRefresh);
    }

    // ============ EKSEKUSI ============
    
    // 1. Inject semua banner SEKARANG
    injectAllBanners();

    // 2. Setup SmartLink
    setupSmartLink();

    // 3. Refresh banner periodik
    startBannerRefresh();

    // 4. Expose ke window untuk debugging
    window.ADS = ADS;

    console.log("✅ ADSTERRA INTEGRATION: Native Banner + SmartLink Only");
});
