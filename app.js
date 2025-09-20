const MSK_OFFSET_MIN = -180;
function nowMSKms(){ const localOff=new Date().getTimezoneOffset(); return Date.now() + (MSK_OFFSET_MIN - localOff)*60000; }
function targetMSKms(month, day){
  const n = new Date(nowMSKms()); let y = n.getUTCFullYear();
  let t = Date.UTC(y, month-1, day, 0,0,0) - (3*3600000);
  if (t <= nowMSKms()) t = Date.UTC(y+1, month-1, day, 0,0,0) - (3*3600000);
  return t;
}
const FRIENDSHIP_START = Date.UTC(2017,8,1,0,0,0) - (3*3600000);
const NASTYA = { m:12, d:9 }; const EGOR = { m:12, d:28 };

const root=document.documentElement, themeBtn=document.getElementById('themeToggle'), THEME_KEY='naste-theme';
applyTheme(localStorage.getItem(THEME_KEY)||'dark');
function applyTheme(t){ t==='dark'?root.setAttribute('data-theme','dark'):root.removeAttribute('data-theme'); themeBtn.textContent=t==='dark'?'☼':'☾'; }
themeBtn.addEventListener('click', ()=>{ const t=root.getAttribute('data-theme')==='dark'?'light':'dark'; localStorage.setItem(THEME_KEY,t); applyTheme(t); });

const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('appear'); }),{threshold:.2});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

const daysEl=document.getElementById('daysTogether');
function renderDays(){ const days=Math.floor((nowMSKms()-FRIENDSHIP_START)/86400000); daysEl.textContent=days.toLocaleString('ru-RU'); }
renderDays(); setInterval(renderDays,60000);

function update(prefix,spec){
  const now=nowMSKms(); const t=targetMSKms(spec.m,spec.d); let s=Math.max(0,Math.floor((t-now)/1000));
  const d=Math.floor(s/86400); s%=86400; const h=Math.floor(s/3600); s%=3600; const m=Math.floor(s/60); const sec=s%60;
  const pad=n=>String(n).padStart(2,'0');
  document.getElementById(prefix+'Days').textContent=pad(d);
  document.getElementById(prefix+'Hours').textContent=pad(h);
  document.getElementById(prefix+'Minutes').textContent=pad(m);
  document.getElementById(prefix+'Seconds').textContent=pad(sec);
  const setRing=(id,ratio)=>{ const el=document.getElementById(id); if(el) el.style.setProperty('--pct',(ratio*100).toFixed(1)); };
  setRing(prefix+'HoursRing', m/60); setRing(prefix+'MinutesRing', sec/60); setRing(prefix+'SecondsRing', (now%1000)/1000);
}
function tick(){ update('na',NASTYA); update('eg',EGOR); }
tick(); setInterval(tick,1000);
