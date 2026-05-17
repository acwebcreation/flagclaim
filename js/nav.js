// js/nav.js

// Vérifie si l'utilisateur a un spot sauvegardé
function checkMyPosition() {
  const user = JSON.parse(localStorage.getItem('flagclaim_user') || 'null');
  if (user && user.pseudo) {
    document.getElementById('ma-position-btn').style.display = 'block';
  }
}

// Va à ma position sur la carte
function goToMyPosition() {
  const user = JSON.parse(localStorage.getItem('flagclaim_user') || 'null');
  if (!user) return;
  openPanel(user.country);
}

// Recherche par pseudo
async function searchPseudo() {
  const pseudo = document.getElementById('search-pseudo').value.trim();
  if (!pseudo) return;

  const spots = await sbGet('spots', `select=*&pseudo=eq.${pseudo}&order=planted_at.desc`);

  if (!spots || spots.length === 0) {
    alert('Aucun drapeau trouvé pour ce pseudo.');
    return;
  }

  // Ouvre le panel du premier pays trouvé
  openPanel(spots[0].country_code, pseudo);
}

// Vérifie au chargement
document.addEventListener('DOMContentLoaded', checkMyPosition);

// Vérifie si URL contient ?pseudo=xxx
const urlParams = new URLSearchParams(window.location.search);
const urlPseudo = urlParams.get('pseudo');
if (urlPseudo) {
  document.getElementById('search-pseudo').value = urlPseudo;
  searchPseudo();
}

// Widget dernière activité

async function loadActivityFeed() {
  const ticker = document.getElementById('ticker-content');
  if (!ticker) return;

  const spots = await sbGet('spots',
    'select=pseudo,flag_origin,country_code,planted_at&status=eq.active&order=planted_at.desc&limit=8'
  );

  if (!spots || spots.length === 0) return;

  const items = spots.map(spot => {
    const flag    = getFlagEmoji(spot.flag_origin);
    const country = countryNames[spot.country_code] || spot.country_code;
    const time    = timeAgo(spot.planted_at);
    return `<span class="ticker-item">${flag} <strong>${spot.pseudo || 'Anonyme'}</strong> a planté en <strong>${country}</strong> — ${time}</span>`;
  }).join('');

  // Double le contenu pour un défilement infini fluide
  ticker.innerHTML = items + items;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)}h`;
  return `il y a ${Math.floor(diff/86400)} jours`;
}

// Lance le feed au chargement
document.addEventListener('DOMContentLoaded', () => {
  checkMyPosition();
  setTimeout(loadActivityFeed, 1000);
  // Rafraîchit toutes les 30 secondes
  setInterval(loadActivityFeed, 30000);
});

// Rempli le dropdown drapeaux de la waitlist
async function loadWaitlistFlags() {
  const select = document.getElementById('wl-flag');
  if (!select) return;

  const allFlags = [
    {code:'MA',name:'🇲🇦 Maroc'},{code:'DZ',name:'🇩🇿 Algérie'},
    {code:'TN',name:'🇹🇳 Tunisie'},{code:'US',name:'🇺🇸 USA'},
    {code:'CA',name:'🇨🇦 Canada'},{code:'BR',name:'🇧🇷 Brésil'},
    {code:'AU',name:'🇦🇺 Australie'},{code:'JP',name:'🇯🇵 Japon'},
    {code:'CN',name:'🇨🇳 Chine'},{code:'SN',name:'🇸🇳 Sénégal'},
    {code:'CI',name:"🇨🇮 Côte d'Ivoire"},{code:'CM',name:'🇨🇲 Cameroun'},
    {code:'NG',name:'🇳🇬 Nigeria'},{code:'GH',name:'🇬🇭 Ghana'},
    {code:'MX',name:'🇲🇽 Mexique'},{code:'AR',name:'🇦🇷 Argentine'},
    {code:'ZA',name:'🇿🇦 Afrique du Sud'},
  ].sort((a,b) => a.name.localeCompare(b.name));

  allFlags.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.code;
    opt.text  = f.name;
    select.appendChild(opt);
  });
}

async function loadAmbassadeurs() {
  const container = document.getElementById('ambassadeurs-list');
  if (!container) return;

  const countRes = await sbGet('spots',
    'select=id&status=eq.active&has_link=eq.true'
  );
  
  const total = countRes ? countRes.length : 0;
  if (total === 0) return;

  const offset = total > 6 ? Math.floor(Math.random() * (total - 6)) : 0;

  const spots = await sbGet('spots',
    `select=pseudo,flag_origin,country_code,social_url,tagline,planted_at&status=eq.active&has_link=eq.true&limit=6&offset=${offset}`
  );

  if (!spots || spots.length === 0) return;

  container.innerHTML = spots.map(spot => {
    const flag    = getFlagEmoji(spot.flag_origin);
    const country = countryNames[spot.country_code] || spot.country_code;
    const days    = Math.floor((Date.now() - new Date(spot.planted_at)) / 86400000);
    const isNew   = days === 0;
    const link    = spot.social_url
      ? `<a href="https://${spot.social_url}" target="_blank" class="amb-link">🔗 ${spot.social_url}</a>`
      : '';
    const tagline = spot.tagline
      ? `<div class="amb-tagline">💼 ${spot.tagline}</div>`
      : '';

    return `
      <div class="amb-card">
        ${isNew ? '<span class="amb-new">🆕 Nouveau</span>' : ''}
        <div class="amb-flag">${flag}</div>
        <div class="amb-pseudo">${spot.pseudo || 'Anonyme'}</div>
        ${tagline}
        ${link}
        <div class="amb-meta">${country} · ${days}j</div>
      </div>
    `;
  }).join('');
}

// Charge les compteurs par pays
async function loadWaitlistCounters() {
  const container = document.getElementById('wl-counters');
  if (!container) return;

  const entries = await sbGet('waitlist', 'select=country_wish');
  if (!entries || entries.length === 0) return;

  const counts = {};
  entries.forEach(e => {
    counts[e.country_wish] = (counts[e.country_wish] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 8);

  const wlCountryNames = {
    MA:'Maroc', DZ:'Algérie', TN:'Tunisie', US:'USA',
    CA:'Canada', BR:'Brésil', AU:'Australie', JP:'Japon',
    CN:'Chine', SN:'Sénégal', CI:"Côte d'Ivoire",
    CM:'Cameroun', NG:'Nigeria', GH:'Ghana',
    MX:'Mexique', AR:'Argentine', ZA:'Afrique du Sud'
  };

  container.innerHTML = sorted.map(([code, count]) =>
    `<div class="wl-counter-item">
      ${getFlagEmoji(code)} ${wlCountryNames[code] || code}
      — <span>${count}</span> inscrit${count > 1 ? 's' : ''}
    </div>`
  ).join('');
}

// Inscription waitlist
async function joinWaitlist() {
  const flag    = document.getElementById('wl-flag').value;
  const country = document.getElementById('wl-country').value;
  const email   = document.getElementById('wl-email').value.trim();
  const msg     = document.getElementById('wl-message');

  if (!flag || !country || !email) {
    msg.innerHTML = '<span style="color:#E74C3C">Remplis tous les champs !</span>';
    return;
  }

  if (!email.includes('@')) {
    msg.innerHTML = '<span style="color:#E74C3C">Email invalide.</span>';
    return;
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist`,
    {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({
        email:        email,
        flag_origin:  flag,
        country_wish: country
      })
    }
  );

  if (res.ok) {
    msg.innerHTML = '<span style="color:#2ECC71">✅ Inscrit ! Tu seras notifié en premier.</span>';
    document.getElementById('wl-flag').value    = '';
    document.getElementById('wl-country').value = '';
    document.getElementById('wl-email').value   = '';
    loadWaitlistCounters();
  } else {
    msg.innerHTML = '<span style="color:#E74C3C">Erreur — réessaie.</span>';
  }
}

// Lance au chargement
document.addEventListener('DOMContentLoaded', () => {
  checkMyPosition();
  setTimeout(loadActivityFeed, 1000);
  setInterval(loadActivityFeed, 30000);
  loadWaitlistFlags();
  loadWaitlistCounters();
  loadAmbassadeurs();
  setInterval(loadAmbassadeurs, 60000); // Rafraîchit toutes les minutes
});