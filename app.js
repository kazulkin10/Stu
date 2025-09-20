// ---------- Strict Europe/Moscow time using Intl.formatToParts ----------
const tz = 'Europe/Moscow';
function nowMSK_utc_ms(){
  // get current wall-clock time in MSK as parts, convert to UTC ms
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz, hour12:false,
    year:'numeric', month:'numeric', day:'numeric',
    hour:'numeric', minute:'numeric', second:'numeric'
  }).formatToParts(new Date());
  const get = t => Number(parts.find(p=>p.type===t).value);
  const y = get('year'), m = get('month'), d = get('day');
  const h = get('hour'), min = get('minute'), s = get('second');
  return Date.UTC(y, m-1, d, h, min, s); // UTC ms that corresponds to MSK parts
}
function targetMSK_utc_ms(month, day){
  // midnight in MSK -> build from MSK wall time then to UTC
  const nowParts = new Intl.DateTimeFormat('ru-RU', { timeZone: tz, hour12:false, year:'numeric' }).formatToParts(new Date());
  let y = Number(nowParts.find(p=>p.type==='year').value);
  let t = Date.UTC(y, month-1, day, 0,0,0); // this represents 00:00:00 in MSK
  if (t <= nowMSK_utc_ms()) t = Date.UTC(y+1, month-1, day, 0,0,0);
  return t;
}

// ---------- Config ----------
const FRIENDSHIP_START_MSK_UTC = Date.UTC(2017,8,1,0,0,0); // 01.09.2017 00:00:00 MSK
const NASTYA = { m:12, d:9 };
const EGOR   = { m:12, d:28 };

// ---------- Theme ----------
const root = document.documentElement;
const THEME_KEY = 'naste-theme';
const themeBtn = document.getElementById('themeToggle');
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
function applyTheme(t){ t==='dark'?root.setAttribute('data-theme','dark'):root.removeAttribute('data-theme'); themeBtn.textContent=t==='dark'?'☼':'☾'; }
themeBtn.addEventListener('click', ()=>{ const t=root.getAttribute('data-theme')==='dark'?'light':'dark'; localStorage.setItem(THEME_KEY,t); applyTheme(t); });

// ---------- Header clock (MSK) ----------
const clockEl = document.getElementById('mskClock');
function renderClock(){
  const d = new Date(nowMSK_utc_ms());
  const pad = n=>String(n).padStart(2,'0');
  clockEl.textContent = `МСК ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
renderClock(); setInterval(renderClock, 500);

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(es => es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('appear'); }), {threshold:.2});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

// ---------- Days together ----------
const daysEl = document.getElementById('daysTogether');
function renderDays(){
  const days = Math.floor((nowMSK_utc_ms() - FRIENDSHIP_START_MSK_UTC)/86400000);
  daysEl.textContent = days.toLocaleString('ru-RU');
}
renderDays(); setInterval(renderDays, 60000);

// ---------- Flip counters (no double rows, auto-wide for 3+ digits) ----------
function setRings(prefix, m, s, ms){
  const set = (id, ratio) => { const el = document.getElementById(id); if (!el) return; el.style.setProperty('--pct', (ratio*100).toFixed(1)); };
  set(prefix+'HoursRing', m/60);
  set(prefix+'MinutesRing', s/60);
  set(prefix+'SecondsRing', ms/1000);
}
function updateFlip(prefix, month, day){
  const target = targetMSK_utc_ms(month, day);
  const now = nowMSK_utc_ms();
  let sec = Math.max(0, Math.floor((target - now)/1000));
  const d = Math.floor(sec/86400); sec%=86400;
  const h = Math.floor(sec/3600);  sec%=3600;
  const m = Math.floor(sec/60);
  const s = sec%60;

  const box = document.getElementById(prefix+'Flip');
  const units = [d,h,m,s];
  box.querySelectorAll('.flip').forEach((el, i)=>{
    const val = units[i];
    const dg = el.querySelector('.digit');
    // widen days if >= 100
    if (i===0) el.classList.toggle('wide', val>=100);
    dg.textContent = String(val).padStart(val>=100?3:2,'0');
    // quick scale pulse
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
  });
  setRings(prefix, m, s, now%1000);
}
function tick(){ updateFlip('na', NASTYA.m, NASTYA.d); updateFlip('eg', EGOR.m, EGOR.d); }
tick(); setInterval(tick, 1000);

// ---------- Tilt ----------
document.querySelectorAll('.tilt').forEach(c=>{
  c.addEventListener('mousemove', e=>{
    const r=c.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-.5; const py=(e.clientY-r.top)/r.height-.5;
    c.style.transform = `rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg)`;
  });
  c.addEventListener('mouseleave', ()=> c.style.transform='rotateX(0) rotateY(0)');
});

// ---------- Lightbox (from v5) ----------
const images = Array.from(document.querySelectorAll('.g-item img'));
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('.lb-img');
const btnPrev = lb.querySelector('.lb-prev');
const btnNext = lb.querySelector('.lb-next');
const btnClose = lb.querySelector('.lb-close');
let idx = 0;
function openLB(i){ idx = i; lbImg.src = images[idx].src; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
function closeLB(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); }
function navLB(delta){ const len = images.length; if (!len) return; idx = (idx + delta + len) % len; lbImg.src = images[idx].src; }
images.forEach((im, i)=> im.addEventListener('click', ()=> openLB(i)));
btnClose.addEventListener('click', closeLB);
btnPrev.addEventListener('click', ()=> navLB(-1));
btnNext.addEventListener('click', ()=> navLB(1));
window.addEventListener('keydown', e=>{ if(!lb.classList.contains('open')) return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') navLB(-1); if(e.key==='ArrowRight') navLB(1); });
let touchX=null;
lb.addEventListener('touchstart', e=>{ touchX=e.changedTouches[0].clientX; }, {passive:true});
lb.addEventListener('touchend', e=>{ if(touchX==null) return; const dx=e.changedTouches[0].clientX - touchX; if(Math.abs(dx)>40) navLB(dx<0?1:-1); touchX=null; }, {passive:true});

// ---------- Canvas background ----------
const canvas = document.getElementById('bg'); const ctx = canvas.getContext('2d');
let w,h,points;
function resize(){ w=canvas.width=innerWidth*devicePixelRatio; h=canvas.height=innerHeight*devicePixelRatio; points=makePoints(); }
addEventListener('resize', resize); resize();
function makePoints(){ const count = Math.min(130, Math.floor((innerWidth*innerHeight)/9000)); const ps=[]; for(let i=0;i<count;i++) ps.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.28,vy:(Math.random()-0.5)*0.28}); return ps; }
function step(){ ctx.clearRect(0,0,w,h); ctx.fillStyle='rgba(255,255,255,0.6)';
  points.forEach(p=>{ p.x+=p.vx*devicePixelRatio; p.y+=p.vy*devicePixelRatio; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1; ctx.beginPath(); ctx.arc(p.x,p.y,1.2*devicePixelRatio,0,Math.PI*2); ctx.fill(); });
  for(let i=0;i<points.length;i++){ for(let j=i+1;j<points.length;j++){ const dx=points[i].x-points[j].x, dy=points[i].y-points[j].y, d2=dx*dx+dy*dy; if(d2<(130*devicePixelRatio)**2){ const a=.14*(1-d2/((130*devicePixelRatio)**2)); ctx.strokeStyle=`rgba(200,200,255,${a.toFixed(3)})`; ctx.lineWidth=devicePixelRatio; ctx.beginPath(); ctx.moveTo(points[i].x,points[i].y); ctx.lineTo(points[j].x,points[j].y); ctx.stroke(); } } }
  requestAnimationFrame(step);
}
requestAnimationFrame(step);
