// ---------- Strict Europe/Moscow time helpers ----------
const tz = 'Europe/Moscow';
function nowMSK_utc_ms(){
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz, hour12:false,
    year:'numeric', month:'numeric', day:'numeric',
    hour:'numeric', minute:'numeric', second:'numeric'
  }).formatToParts(new Date());
  const get = t => Number(parts.find(p=>p.type===t).value);
  return Date.UTC(get('year'), get('month')-1, get('day'), get('hour'), get('minute'), get('second'));
}
function targetMSK_utc_ms(month, day){
  const y = Number(new Intl.DateTimeFormat('ru-RU',{timeZone:tz,year:'numeric'}).format(new Date()));
  let t = Date.UTC(y, month-1, day, 0,0,0);
  if (t <= nowMSK_utc_ms()) t = Date.UTC(y+1, month-1, day, 0,0,0);
  return t;
}

// ---------- Config ----------
const FRIENDSHIP_START_MSK_UTC = Date.UTC(2017,8,1,0,0,0);
const NASTYA = { m:12, d:9 };
const EGOR   = { m:12, d:28 };

// ---------- Theme ----------
const root = document.documentElement;
const THEME_KEY = 'naste-theme';
const themeBtn = document.getElementById('themeToggle');
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
function applyTheme(t){ t==='dark'?root.setAttribute('data-theme','dark'):root.removeAttribute('data-theme'); themeBtn.textContent=t==='dark'?'☼':'☾'; }
themeBtn.addEventListener('click', ()=>{ const t=root.getAttribute('data-theme')==='dark'?'light':'dark'; localStorage.setItem(THEME_KEY,t); applyTheme(t); });

// ---------- Header clock ----------
const clockEl = document.getElementById('mskClock');
function renderClock(){ const d = new Date(nowMSK_utc_ms()); const pad=n=>String(n).padStart(2,'0'); clockEl.textContent = `МСК ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`; }
renderClock(); setInterval(renderClock, 500);

// ---------- Reveal ----------
const io = new IntersectionObserver(es => es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('appear'); }), {threshold:.2});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

// ---------- Days together ----------
const daysEl = document.getElementById('daysTogether');
function renderDays(){ const days = Math.floor((nowMSK_utc_ms() - FRIENDSHIP_START_MSK_UTC)/86400000); daysEl.textContent = days.toLocaleString('ru-RU'); }
renderDays(); setInterval(renderDays, 60000);

// ---------- Auto-fit digits per tile ----------
function fitRow(row){
  const tiles = Array.from(row.querySelectorAll('.tile'));
  tiles.forEach(tile=>{
    const wrap = tile.querySelector('.digits');
    const span = wrap.querySelector('span');
    span.style.transform = 'scale(1)';
    const maxW = wrap.clientWidth - 6; // safe padding
    const needW = span.scrollWidth;
    if (needW > maxW){
      const scale = Math.max(0.6, maxW / needW);
      span.style.transform = `scale(${scale})`;
    }
  });
}

function updateRow(rowId, spec){
  const row = document.getElementById(rowId);
  const t = targetMSK_utc_ms(spec.m, spec.d);
  const now = nowMSK_utc_ms();
  let sec = Math.max(0, Math.floor((t - now)/1000));
  const d = Math.floor(sec/86400); sec%=86400; const h = Math.floor(sec/3600); sec%=3600; const m = Math.floor(sec/60); const s = sec%60;
  const vals = [d,h,m,s];
  row.querySelectorAll('.tile').forEach((tile, i)=>{
    const span = tile.querySelector('.digits span');
    const text = String(vals[i]).padStart(i===0 && vals[i]>=100?3:2,'0');
    if (span.textContent !== text){ span.textContent = text; }
  });
  // rings
  const prefix = rowId.startsWith('na') ? 'na' : 'eg';
  const set = (id, ratio)=>{ const el = document.getElementById(id); if(el) el.style.setProperty('--pct',(ratio*100).toFixed(1)); };
  set(prefix+'HoursRing', m/60); set(prefix+'MinutesRing', s/60); set(prefix+'SecondsRing', (now%1000)/1000);
  // finally fit
  fitRow(row);
}

function tick(){ updateRow('naRow', NASTYA); updateRow('egRow', EGOR); }
tick(); setInterval(tick, 1000);
addEventListener('resize', ()=>{ fitRow(document.getElementById('naRow')); fitRow(document.getElementById('egRow')); });

// ---------- Tilt ----------
document.querySelectorAll('.tilt').forEach(c=>{
  c.addEventListener('mousemove', e=>{ const r=c.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-.5; const py=(e.clientY-r.top)/r.height-.5; c.style.transform=`rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg)`; });
  c.addEventListener('mouseleave', ()=> c.style.transform='rotateX(0) rotateY(0)');
});

// ---------- Lightbox ----------
const images = Array.from(document.querySelectorAll('.g-item img'));
const lb = document.getElementById('lightbox'); const lbImg = lb.querySelector('.lb-img');
let idx = 0;
function openLB(i){ idx=i; lbImg.src=images[idx].src; lb.classList.add('open'); }
function closeLB(){ lb.classList.remove('open'); }
function navLB(d){ const n=images.length; if(!n)return; idx=(idx+d+n)%n; lbImg.src=images[idx].src; }
images.forEach((im,i)=> im.addEventListener('click', ()=> openLB(i)));
lb.querySelector('.lb-close').addEventListener('click', closeLB);
lb.querySelector('.lb-prev').addEventListener('click', ()=> navLB(-1));
lb.querySelector('.lb-next').addEventListener('click', ()=> navLB(1));
