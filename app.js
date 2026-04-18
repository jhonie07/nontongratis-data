let films = JSON.parse(localStorage.getItem("films")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

const grid = document.getElementById("grid");
const heroTitle = document.getElementById("heroTitle");
const hero = document.getElementById("hero");


// 🧠 AI SCORING SYSTEM
function weight(i){
  return Math.exp(-i * 0.12);
}

function scoreFilm(f){
  let score = 0;

  history.forEach((h,i)=>{
    if(h.genre === f.genre) score += 3 * weight(i);
    if(h.title === f.title) score += 5 * weight(i);
  });

  score += (f.views || 0) * 0.1;

  return score;
}

function AI(){
  return films
    .map(f => ({...f, score: scoreFilm(f)}))
    .sort((a,b)=>b.score-a.score);
}


// 🎬 HERO ROTATION
let heroIndex = 0;

function heroLoop(){
  if(films.length === 0) return;

  let f = films[heroIndex % films.length];

  hero.style.backgroundImage = `url(${f.poster})`;
  heroTitle.innerText = f.title;

  heroIndex++;
}

setInterval(heroLoop, 4000);


// 🎥 WATCH FROM HERO
function watchHero(){
  let f = AI()[0];

  openMovie(f);
}


// 🔥 RENDER GRID
function render(){
  let data = AI();

  grid.innerHTML = "";

  data.forEach((f,i)=>{
    grid.innerHTML += `
      <div class="card" onclick="openMovieByIndex(${i})">
        <img src="${f.poster}">
        <h3>${f.title}</h3>
      </div>
    `;
  });
}


// ▶ OPEN MOVIE
function openMovie(f){
  history.push({genre:f.genre, title:f.title});
  localStorage.setItem("history", JSON.stringify(history));

  f.views = (f.views||0)+1;
  localStorage.setItem("films", JSON.stringify(films));

  localStorage.setItem("sources", JSON.stringify([f.video]));

  window.location.href = "player.html";
}

function openMovieByIndex(i){
  openMovie(AI()[i]);
}


// 🚀 INIT
render();
heroLoop();
