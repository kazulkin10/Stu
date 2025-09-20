// Даты
const FRIENDSHIP_START = new Date('2017-09-01T00:00:00');
const BIRTHDAY_NASTYA = { month: 12, day: 9 };
const BIRTHDAY_EGOR   = { month: 12, day: 28 };

// Тема
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const THEME_KEY = 'naste-theme';
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
function applyTheme(t){ t==='dark' ? root.setAttribute('data-theme','dark') : root.removeAttribute('data-theme'); themeBtn.textContent = t==='dark' ? '☼' : '☾' }
themeBtn.addEventListener('click', ()=>{ const t = root.getAttribute('data-theme')==='dark'?'light':'dark'; localStorage.setItem(THEME_KEY,t); applyTheme(t); });

// Появление
const io = new IntersectionObserver((entries)=>{ for (const e of entries) if (e.isIntersecting) e.target.classList.add('appear'); }, {threshold:.2});
for (const el of document.querySelectorAll('.fade-up')) io.observe(el);

// Дни дружбы
const daysEl = document.getElementById('daysTogether');
function renderDays(){ const now=new Date(); const days=Math.floor((now-FRIENDSHIP_START)/86400000); daysEl.textContent=days.toLocaleString('ru-RU'); }
renderDays(); setInterval(renderDays, 60000);

// Два таймера
function targetDate(spec){ const now=new Date(); let t=new Date(now.getFullYear(),spec.month-1,spec.day,0,0,0); if(t<=now)t=new Date(now.getFullYear()+1,spec.month-1,spec.day,0,0,0); return t; }
function setRing(el, ratio){ if (el) el.style.setProperty('--pct', (ratio*100).toFixed(1)); }
function run(prefix, spec){
  const now=new Date();
  const t=targetDate(spec), s=Math.floor((t-now)/1000);
  const d=Math.max(0,Math.floor(s/86400)), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), se=s%60;
  document.getElementById(prefix+'Days').textContent=String(d).padStart(2,'0');
  document.getElementById(prefix+'Hours').textContent=String(h).padStart(2,'0');
  document.getElementById(prefix+'Minutes').textContent=String(m).padStart(2,'0');
  document.getElementById(prefix+'Seconds').textContent=String(se).padStart(2,'0');
  setRing(document.getElementById(prefix+'HoursRing'), m/60);
  setRing(document.getElementById(prefix+'MinutesRing'), se/60);
  setRing(document.getElementById(prefix+'SecondsRing'), now.getMilliseconds()/1000);
}
function tick(){ run('na', BIRTHDAY_NASTYA); run('eg', BIRTHDAY_EGOR); }
tick(); setInterval(tick,1000);
