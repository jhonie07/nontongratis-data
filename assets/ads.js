// ===============================
// GOD MODE ADS ENGINE
// ===============================

// === CONFIG ===
const ADS = {
  // Banner Adsterra (300x250)
  banner: {
    key: "bd2a1bd4de40671fbaa0ab7f123c6cab",
    src: "https://www.highperformanceformat.com/bd2a1bd4de40671fbaa0ab7f123c6cab/invoke.js",
    width: 300,
    height: 250
  },

  // Popunder
  popunderSrc: "https://pl29191017.profitablecpmratenetwork.com/13/ac/57/13ac573259f9ac689cf966e9075b8096.js",

  // Social Bar
  socialSrc: "https://pl29191016.profitablecpmratenetwork.com/20/09/9d/20099d153d5a60e357a56bb8eec294ed.js",

  // Behaviour
  refreshInterval: 90000, // 90 detik
  popCooldown: 20 * 60 * 1000 // 20 menit
};

// ===============================
// LOAD SCRIPT HELPER
// ===============================
function loadScript(src) {
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.body.appendChild(s);
}

// ===============================
// SOCIAL BAR (langsung load)
// ===============================
function initSocialBar() {
  loadScript(ADS.socialSrc);
}

// ===============================
// POPUNDER BOOSTER + SESSION CONTROL
// ===============================
function canShowPop() {
  const last = localStorage.getItem("last_pop");
  if (!last) return true;
  return (Date.now() - parseInt(last)) > ADS.popCooldown;
}

function triggerPop() {
  if (!canShowPop()) return;

  localStorage.setItem("last_pop", Date.now());
  loadScript(ADS.popunderSrc);
}

// trigger di banyak interaksi
["click", "touchstart"].forEach(evt => {
  document.addEventListener(evt, () => {
    triggerPop();
  }, { once: true });
});

// ===============================
// BANNER RENDER
// ===============================
function renderBanner(containerId) {
  const box = document.getElementById(containerId);
  if (!box) return;

  box.innerHTML = `
    <div style="width:100%;display:flex;justify-content:center;">
      <div id="ad-slot"></div>
    </div>
  `;

  const script1 = document.createElement("script");
  script1.innerHTML = `
    atOptions = {
      key: "${ADS.banner.key}",
      format: "iframe",
      height: ${ADS.banner.height},
      width: ${ADS.banner.width},
      params: {}
    };
  `;
  box.appendChild(script1);

  const script2 = document.createElement("script");
  script2.src = ADS.banner.src;
  script2.async = true;
  box.appendChild(script2);
}

// ===============================
// AUTO REFRESH BANNER
// ===============================
function autoRefresh(containerId) {
  setInterval(() => {
    renderBanner(containerId);
  }, ADS.refreshInterval);
}

// ===============================
// FLOATING BANNER
// ===============================
function createFloatingBanner() {
  const div = document.createElement("div");
  div.id = "floatingAd";
  div.style = `
    position:fixed;
    bottom:10px;
    left:50%;
    transform:translateX(-50%);
    z-index:9999;
  `;
  document.body.appendChild(div);

  renderBanner("floatingAd");
}

// ===============================
// ANTI ADBLOCK DETECTION
// ===============================
function antiAdblock() {
  setTimeout(() => {
    const test = document.createElement("div");
    test.className = "adsbox";
    document.body.appendChild(test);

    if (test.offsetHeight === 0) {
      alert("Matikan AdBlock untuk mendukung website ini 🙏");
    }
    test.remove();
  }, 3000);
}

// ===============================
// INIT ALL
// ===============================
function initAds() {
  initSocialBar();
  createFloatingBanner();
  antiAdblock();

  // render banner utama jika ada container
  renderBanner("bannerHome");
  renderBanner("bannerPlayer");

  autoRefresh("bannerHome");
  autoRefresh("bannerPlayer");
}

document.addEventListener("DOMContentLoaded", initAds);
