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
  const spots = await sbGet(
    'spots',
    'select=pseudo,flag_origin,country_code,planted_at&status=eq.active&order=planted_at.desc&limit=5'
  );

  const list = document.getElementById('activity-list');
  if (!list) return;

  if (!spots || spots.length === 0) {
    list.innerHTML = '<div class="activity-item">Sois le premier à planter !</div>';
    return;
  }

  list.innerHTML = spots.map(spot => {
    const flag    = getFlagEmoji(spot.flag_origin);
    const country = countryNames[spot.country_code] || spot.country_code;
    const time    = timeAgo(spot.planted_at);
    return `<div class="activity-item">
      ${flag} <strong>${spot.pseudo || 'Anonyme'}</strong>
      a planté en <strong>${country}</strong>
      <span style="color:#666; float:right">${time}</span>
    </div>`;
  }).join('');
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