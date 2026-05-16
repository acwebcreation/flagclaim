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