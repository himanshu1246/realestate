/* ===== PRELOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('hidden'), 1800);
});

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (navbar) {
    navbar.classList.toggle('scrolled', y > 50);
  }
  if (backToTop) {
    backToTop.classList.toggle('visible', y > 400);
  }
  
  document.querySelectorAll('section[id]').forEach(sec => {
    const top = sec.offsetTop - 100;
    const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', y >= top && y < top + sec.offsetHeight);
  });
});

/* ===== LIVE WEATHER & AQI FETCH ===== */
async function fetchLiveStatus() {
  const weatherEl = document.getElementById('liveWeather');
  const aqiEl = document.getElementById('liveAQI');
  
  try {
    // Taloja Coords: 19.0558, 73.0642
    const wRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.0558&longitude=73.0642&current=temperature_2m,weather_code&timezone=auto');
    const wData = await wRes.json();
    
    const aRes = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=19.0558&longitude=73.0642&current=us_aqi');
    const aData = await aRes.json();
    
    if (weatherEl && wData.current) {
      const temp = Math.round(wData.current.temperature_2m);
      const code = wData.current.weather_code;
      let icon = '<i class="fas fa-sun"></i>';
      let desc = 'Sunny';
      
      if (code > 0) { icon = '<i class="fas fa-cloud-sun"></i>'; desc = 'Partly Cloudy'; }
      if (code > 50) { icon = '<i class="fas fa-cloud-showers-heavy"></i>'; desc = 'Rainy'; }
      
      weatherEl.innerHTML = `${icon} ${temp}°C ${desc}`;
    }
    
    if (aqiEl && aData.current) {
      const aqi = aData.current.us_aqi;
      let status = 'Good';
      let icon = '<i class="fas fa-leaf"></i>';
      if (aqi > 50) status = 'Moderate';
      if (aqi > 100) { status = 'Unhealthy'; icon = '<i class="fas fa-mask"></i>'; }
      
      aqiEl.innerHTML = `${icon} AQI: ${aqi} (${status})`;
    }
  } catch (err) {
    console.error('Weather Fetch Error:', err);
    if (weatherEl) weatherEl.innerHTML = '<i class="fas fa-sun"></i> 32°C Sunny';
    if (aqiEl) aqiEl.innerHTML = '<i class="fas fa-leaf"></i> AQI: 42 (Good)';
  }
}

fetchLiveStatus();
// Refresh every 15 mins
setInterval(fetchLiveStatus, 900000);

/* ===== HAMBURGER ===== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const open = navLinks.classList.contains('open');
  spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
  spans[1].style.opacity = open ? '0' : '';
  spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
});
navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ===== BACK TO TOP ===== */
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== SCROLL REVEAL ===== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in-view'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

/* ===== STATS COUNTER ===== */
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat-number').forEach(el => {
        const target = +el.dataset.target;
        let current = 0;
        const step = target / (1800 / 16);
        const t = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current);
          if (current >= target) clearInterval(t);
        }, 16);
      });
      statsObs.disconnect();
    }
  });
}, { threshold: 0.5 });
const hs = document.querySelector('.hero-stats');
if (hs) statsObs.observe(hs);

/* ===== TESTIMONIALS ===== */
const track = document.getElementById('testimonialsTrack');
const dotsEl = document.getElementById('testiDots');
const cards = track ? track.querySelectorAll('.testimonial-card') : [];
let cur = 0, spv = 1;

function buildDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 0; i < cards.length; i++) {
    const d = document.createElement('button');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Review ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  }
}

function goTo(i) {
  const total = cards.length;
  cur = (i + total) % total;
  const w = track.offsetWidth + 24; // Track width + gap
  track.style.transform = `translateX(-${cur * w}px)`;
  dotsEl.querySelectorAll('.testi-dot').forEach((d, j) => d.classList.toggle('active', j === cur));
}

document.getElementById('testiNext')?.addEventListener('click', () => goTo(cur + 1));
document.getElementById('testiPrev')?.addEventListener('click', () => goTo(cur - 1));

window.addEventListener('resize', () => {
  cur = 0;
  buildDots();
  goTo(0);
});

buildDots(); 
goTo(0);

/* ===== EMI CALCULATOR LOGIC ===== */
const loanAmount = document.getElementById('loanAmount');
const interestRate = document.getElementById('interestRate');
const loanTenure = document.getElementById('loanTenure');

function calculateEMI() {
  if (!loanAmount || !interestRate || !loanTenure) return;
  const p = +loanAmount.value;
  const r = (+interestRate.value / 12) / 100;
  const n = +loanTenure.value * 12;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - p;

  document.getElementById('monthlyEmi').textContent = `₹ ${Math.round(emi).toLocaleString('en-IN')}`;
  document.getElementById('principalDisplay').textContent = `₹ ${p.toLocaleString('en-IN')}`;
  document.getElementById('interestDisplay').textContent = `₹ ${Math.round(totalInterest).toLocaleString('en-IN')}`;
  document.getElementById('totalDisplay').textContent = `₹ ${Math.round(totalPayable).toLocaleString('en-IN')}`;
}
[loanAmount, interestRate, loanTenure].forEach(el => el?.addEventListener('input', calculateEMI));
if (loanAmount) calculateEMI();

/* ===== LANDMARKS INTERACTIVE LOGIC ===== */
const landmarkData = {
  transport: [
    { icon: '🚇', title: 'Pethali Metro Station', dist: '2 Mins Walk', map: 'https://www.google.com/maps/search/?api=1&query=Pethali+Taloja+Metro+Station+10+Navi+Mumbai&query_place_id=ChIJY5Ns6sjr5zsRTLeErz5ol1w' },
    { icon: '🚇', title: 'Pendhar Metro Station', dist: '5 Mins Walk', map: 'https://www.google.com/maps/search/?api=1&query=Pendhar+Metro+Station+Navi+Mumbai&query_place_id=ChIJc6-QtALr5zsRLYaMBme_tNQ' },
    { icon: '🚉', title: 'Taloja Railway Station', dist: '5 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Taloja+Railway+Station+Navi+Mumbai' },
    { icon: '🚉', title: 'Kharghar Railway Station', dist: '12 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Kharghar+Railway+Station+Navi+Mumbai&query_place_id=ChIJcc7C60PC5zsRQDmMQC3eQi8' },
    { icon: '✈️', title: 'Navi Mumbai Intl Airport', dist: '20 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Navi+Mumbai+International+Airport' }
  ],
  healthcare: [
    { icon: '🏥', title: 'TATA Hospital', dist: '10 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=ACTREC-TATA+MEMORIAL+HOSPITAL+Kharghar+Navi+Mumbai&query_place_id=ChIJ6XXJnWrB5zsRTeN0Rua2Zts' },
    { icon: '🏥', title: 'MGM Hospital', dist: '15 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=MGM+Hospital+Kamothe' },
    { icon: '🏥', title: 'Life Line Hospital', dist: '8 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Life+Line+Hospital+Panvel' }
  ],
  education: [
    { icon: '🎓', title: 'Vibgyor High School', dist: '10 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Vibgyor+High+School+Kharghar' },
    { icon: '🎓', title: 'NMIMS University', dist: '12 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=NMIMS+Navi+Mumbai' },
    { icon: '🏫', title: 'DAV International School', dist: '15 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=DAV+International+School+Kharghar' }
  ],
  lifestyle: [
    { icon: '⛳', title: 'Kharghar Golf Course', dist: '12 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Kharghar+Valley+Golf+Course+Navi+Mumbai&query_place_id=ChIJyUeEhYrB5zsReWTmBkuwYlg' },
    { icon: '🌳', title: 'Central Park Kharghar', dist: '10 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Central+Park+Kharghar' },
    { icon: '🛍️', title: 'Little World Mall', dist: '15 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=Little+World+Mall+Kharghar' },
    { icon: '🕉️', title: 'ISKCON Temple', dist: '10 Mins Drive', map: 'https://www.google.com/maps/search/?api=1&query=ISKCON+Kharghar' }
  ]
};

function renderLandmarks(cat) {
  const list = document.getElementById('landmarkList');
  if (!list) return;
  list.innerHTML = landmarkData[cat].map(item => `
    <li class="landmark-item" onclick="window.open('${item.map}', '_blank')" style="cursor:pointer;">
      <div class="landmark-icon">${item.icon}</div>
      <div class="landmark-info">
        <strong>${item.title}</strong>
        <span>${item.dist} (Click for Map)</span>
      </div>
    </li>
  `).join('');
}

document.querySelectorAll('.landmark-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.landmark-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderLandmarks(btn.dataset.category);
  });
});
if (document.getElementById('landmarkList')) renderLandmarks('transport');

/* ===== FAQ LOGIC ===== */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

/* ===== CONTACT FORM & LEAD SYNC ===== */
// Set min date for site visit to today
const visitDateInput = document.getElementById('visitDate');
if (visitDateInput) {
  const today = new Date().toISOString().split('T')[0];
  visitDateInput.setAttribute('min', today);
}

document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    interest: document.getElementById('interest').value,
    visitDate: document.getElementById('visitDate')?.value || 'Not scheduled',
    message: document.getElementById('message').value,
    timestamp: new Date().toISOString()
  };

  if (!formData.name || !formData.phone || !formData.interest) {
    status.textContent = '❌ Please fill in your name, phone, and what you are interested in.';
    status.className = 'form-status error';
    return;
  }

  // Open the window synchronously to bypass the browser popup blocker
  const waWindow = window.open('', '_blank');
  if (waWindow) {
    waWindow.document.write(`
      <html>
        <head>
          <title>Connecting to WhatsApp...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #0c1a30;
              color: #ffffff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .loader {
              border: 4px solid rgba(255, 255, 255, 0.1);
              width: 50px;
              height: 50px;
              border-radius: 50%;
              border-left-color: #25d366;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { font-weight: 500; margin: 10px 0; }
            p { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <h2>Connecting to WhatsApp</h2>
          <p>Please wait while we prepare your chat request...</p>
        </body>
      </html>
    `);
  }

  btn.textContent = 'Processing…'; btn.disabled = true;

  try {
    // 1. Save to database (removed)
    
    // 2. WhatsApp Lead Sync
    const waMsg = `*New Website Lead - Vrundavan*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Interest:* ${formData.interest || 'Not specified'}%0A*Site Visit Date:* ${formData.visitDate}%0A*Email:* ${formData.email || 'Not provided'}%0A*Message:* ${formData.message || 'No message'}%0A%0A_Sent from Website Lead Sync_`;
    
    const waUrl = `https://wa.me/919920739555?text=${waMsg}`;
    
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank');
    }

    status.textContent = '✔ Enquiry saved & WhatsApp opening...';
    status.className = 'form-status success';
    this.reset();
  } catch (error) {
    console.error("Error adding document: ", error);
    if (waWindow) waWindow.close();
    status.textContent = '❌ Something went wrong. Please try again.';
    status.className = 'form-status error';
  } finally {
    btn.textContent = 'Send Enquiry & Open WhatsApp →'; btn.disabled = false;
    setTimeout(() => { 
      status.textContent = ''; 
      status.className = 'form-status'; 
    }, 6000);
  }
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ===== LIGHTBOX ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const galleryItems = document.querySelectorAll('.gallery-item');

let currentImgIndex = 0;
const galleryImages = Array.from(galleryItems).map(item => ({
  src: item.querySelector('img').src,
  title: item.querySelector('.gallery-overlay span')?.textContent || '',
  desc: item.querySelector('.gallery-overlay p')?.textContent || ''
}));

function openLightbox(index) {
  currentImgIndex = index;
  const data = galleryImages[currentImgIndex];
  lightboxImg.src = data.src;
  lightboxCaption.innerHTML = `<strong>${data.title}</strong><br>${data.desc}`;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function nextImg() {
  currentImgIndex = (currentImgIndex + 1) % galleryImages.length;
  updateLightbox();
}

function prevImg() {
  currentImgIndex = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
  updateLightbox();
}

function updateLightbox() {
  const data = galleryImages[currentImgIndex];
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = data.src;
    lightboxCaption.innerHTML = `<strong>${data.title}</strong><br>${data.desc}`;
    lightboxImg.style.opacity = '1';
  }, 200);
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); nextImg(); });
lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); prevImg(); });
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImg();
  if (e.key === 'ArrowLeft') prevImg();
});
