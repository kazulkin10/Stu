// Europe/Moscow time
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

// Config
const FRIENDSHIP_START_MSK_UTC = Date.UTC(2017,8,1,0,0,0);
const NASTYA = { m:12, d:9 };
const EGOR   = { m:12, d:28 };

// Theme
const root = document.documentElement;
const THEME_KEY = 'naste-theme';
const themeBtn = document.getElementById('themeToggle');
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
function applyTheme(t){ t==='dark'?root.setAttribute('data-theme','dark'):root.removeAttribute('data-theme'); themeBtn.textContent=t==='dark'?'☼':'☾'; }
themeBtn.addEventListener('click', ()=>{ const t=root.getAttribute('data-theme')==='dark'?'light':'dark'; localStorage.setItem(THEME_KEY,t); applyTheme(t); });

// Splash
window.addEventListener('load', ()=>{ const s = document.getElementById('splash'); setTimeout(()=> s.classList.add('hide'), 400); });

// Clock
const clockEl = document.getElementById('mskClock');
function renderClock(){ const d = new Date(nowMSK_utc_ms()); const pad=n=>String(n).padStart(2,'0'); clockEl.textContent = `МСК ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`; }
renderClock(); setInterval(renderClock, 500);

// Reveal
const io = new IntersectionObserver(es => es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('appear'); }), {threshold:.2});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

// Days together
const daysEl = document.getElementById('daysTogether');
function renderDays(){ const days = Math.floor((nowMSK_utc_ms() - FRIENDSHIP_START_MSK_UTC)/86400000); daysEl.textContent = days.toLocaleString('ru-RU'); }
renderDays(); setInterval(renderDays, 60000);

// Split-flip countdown
function setTile(tile, value){
  const top = tile.querySelector('.top');
  const bottom = tile.querySelector('.bottom');
  const current = top.textContent;
  const next = String(value);
  if (current === next) return;
  top.textContent = current; bottom.textContent = next;
  const flip = tile.querySelector('.flip');
  flip.classList.remove('animate'); void flip.offsetWidth; flip.classList.add('animate');
  setTimeout(()=>{ top.textContent = next; }, 400);
}
function pad(val, isDays){
  const v = Number(val);
  if (isDays && v>=100) return String(v).padStart(3,'0');
  return String(v).padStart(2,'0');
}
function updateRow(rowId, spec, ringsPrefix){
  const row = document.getElementById(rowId);
  const tiles = row.querySelectorAll('.flip-tile');
  const t = targetMSK_utc_ms(spec.m, spec.d);
  const now = nowMSK_utc_ms();
  let sec = Math.max(0, Math.floor((t - now)/1000));
  const d = Math.floor(sec/86400); sec%=86400; const h = Math.floor(sec/3600); sec%=3600; const m = Math.floor(sec/60); const s = sec%60;
  const vals = [pad(d,true), pad(h), pad(m), pad(s)];
  vals.forEach((v, i)=> setTile(tiles[i], v));
  setRing(ringsPrefix+'H', m/60);
  setRing(ringsPrefix+'M', s/60);
  setRing(ringsPrefix+'S', (now%1000)/1000);
}
function tick(){ updateRow('naRow', NASTYA, 'na'); updateRow('egRow', EGOR, 'eg'); }
tick(); setInterval(tick, 1000);

// SVG rings
function ringTemplate(ratio){
  const size = 92, r = 34, c = size/2; const P = Math.PI*2*r; const off = P*(1-ratio);
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img">
    <defs>
      <filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3d9a"/><stop offset="1" stop-color="#7c5cff"/></linearGradient>
    </defs>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="url(#grad)" stroke-width="10" stroke-dasharray="${P}" stroke-dashoffset="${off}" filter="url(#g)"/>
  </svg>`;
}
function setRing(id, ratio){
  const el = document.getElementById(id);
  if (!el) return;
  const r = Math.max(0, Math.min(1, ratio));
  el.innerHTML = ringTemplate(r);
}

// Lightbox
const images = Array.from(document.querySelectorAll('.g-item img'));
const captions = images.map((im)=> im.closest('figure').querySelector('figcaption')?.textContent || '');
const lb = document.getElementById('lightbox'); const lbImg = lb.querySelector('.lb-img'); const lbCap = lb.querySelector('.lb-cap');
let idx = 0;
function openLB(i){ idx=i; lbImg.src=images[idx].src; lbCap.textContent=captions[idx]||''; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
function closeLB(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); }
function navLB(d){ const n=images.length; if(!n)return; idx=(idx+d+n)%n; lbImg.src=images[idx].src; lbCap.textContent=captions[idx]||''; }
images.forEach((im,i)=> im.addEventListener('click', ()=> openLB(i)));
lb.querySelector('.lb-close').addEventListener('click', closeLB);
lb.querySelector('.lb-prev').addEventListener('click', ()=> navLB(-1));
lb.querySelector('.lb-next').addEventListener('click', ()=> navLB(1));

// Canvas background
const canvas = document.getElementById('bg'); const ctx = canvas.getContext('2d');
let w,h,points=[];
function size(){ w=canvas.width=innerWidth*devicePixelRatio; h=canvas.height=innerHeight*devicePixelRatio; makePoints(); }
function makePoints(){
  const base = Math.floor((innerWidth*innerHeight)/9000);
  const count = Math.max(60, Math.min(160, base));
  points = [];
  for(let i=0;i<count;i++){ points.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.28,vy:(Math.random()-0.5)*0.28}); }
}
function step(){
  ctx.clearRect(0,0,w,h); ctx.fillStyle='rgba(255,255,255,0.6)';
  for(const p of points){ p.x+=p.vx*devicePixelRatio; p.y+=p.vy*devicePixelRatio; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,1.2*devicePixelRatio,0,Math.PI*2); ctx.fill(); }
  for(let i=0;i<points.length;i++){ for(let j=i+1;j<points.length;j++){ const dx=points[i].x-points[j].x, dy=points[i].y-points[j].y, d2=dx*dx+dy*dy; if(d2<(130*devicePixelRatio)**2){ const a=.14*(1-d2/((130*devicePixelRatio)**2)); ctx.strokeStyle=`rgba(200,200,255,${a.toFixed(3)})`; ctx.lineWidth=devicePixelRatio; ctx.beginPath(); ctx.moveTo(points[i].x,points[i].y); ctx.lineTo(points[j].x,points[j].y); ctx.stroke(); } } }
  requestAnimationFrame(step);
}
window.addEventListener('resize', size); size(); requestAnimationFrame(step);

// 20s sequence trigger on brand click
const brand = document.getElementById('brand');
const seq = document.getElementById('sequence');
let seqTimer=null;
brand.addEventListener('click', (e)=>{
  e.preventDefault();
  if(seqTimer){ clearTimeout(seqTimer); seq.classList.remove('play'); }
  void seq.offsetWidth;
  seq.classList.add('play');
  seqTimer = setTimeout(()=>{ seq.classList.remove('play'); seqTimer=null; }, 20000);
});
