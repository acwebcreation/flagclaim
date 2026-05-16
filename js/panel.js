// js/panel.js

async function loadPanelSpots(countryCode) {
  const spots = await sbGet(
    'spots',
    `select=pseudo,flag_origin,has_link,planted_at&country_code=eq.${countryCode}&status=eq.active&order=planted_at.desc&limit=5`
  );

  const container = document.getElementById('panel-spots-list');
  if (!container) return;

  if (!spots || spots.length === 0) {
    container.innerHTML = '<p class="no-data">Aucun spot planté — sois le premier !</p>';
    return;
  }

  container.innerHTML = spots.map(spot => {
    const flag = getFlagEmoji(spot.flag_origin);
    const time = timeAgo(spot.planted_at);
    return `
      <div class="occupant">
        <span>${flag}</span>
        <span class="occupant-pseudo">${spot.pseudo || 'Anonyme'}</span>
        ${spot.has_link ? '<span class="premium-star">⭐</span>' : ''}
        <span style="color:#666; font-size:11px; margin-left:auto">${time}</span>
      </div>
    `;
  }).join('');
}

function openPanel(countryCode) {
  const data     = countryData[countryCode];
  const name     = countryNames[countryCode] || countryCode;
  const panel    = document.getElementById('side-panel');
  const content  = document.getElementById('panel-content');
  const isFull   = data ? data.occupied >= data.total : false;
  const warPrice = data ? data.warPrice : 12;

  const flags = [
    {code:'FR',name:'🇫🇷 France'},{code:'BE',name:'🇧🇪 Belgique'},
    {code:'MA',name:'🇲🇦 Maroc'},{code:'DZ',name:'🇩🇿 Algérie'},
    {code:'TN',name:'🇹🇳 Tunisie'},{code:'PT',name:'🇵🇹 Portugal'},
    {code:'IT',name:'🇮🇹 Italie'},{code:'ES',name:'🇪🇸 Espagne'},
    {code:'DE',name:'🇩🇪 Allemagne'},{code:'GB',name:'🇬🇧 Royaume-Uni'},
    {code:'NL',name:'🇳🇱 Pays-Bas'},{code:'PL',name:'🇵🇱 Pologne'},
    {code:'TR',name:'🇹🇷 Turquie'},{code:'RO',name:'🇷🇴 Roumanie'},
    {code:'SN',name:'🇸🇳 Sénégal'},{code:'CI',name:"🇨🇮 Côte d'Ivoire"},
    {code:'CM',name:'🇨🇲 Cameroun'},{code:'CD',name:'🇨🇩 Congo'},
    {code:'BR',name:'🇧🇷 Brésil'},{code:'US',name:'🇺🇸 USA'},
    {code:'CA',name:'🇨🇦 Canada'},{code:'MX',name:'🇲🇽 Mexique'},
    {code:'CN',name:'🇨🇳 Chine'},{code:'JP',name:'🇯🇵 Japon'},
    {code:'IN',name:'🇮🇳 Inde'},{code:'NG',name:'🇳🇬 Nigeria'},
    {code:'GH',name:'🇬🇭 Ghana'},{code:'ML',name:'🇲🇱 Mali'},
  ].sort((a,b) => a.name.localeCompare(b.name));

  content.innerHTML = `

    <!-- En-tête -->
    <div class="panel-header">
      <h2>${name} ${data?.warCount > 0 ? '🔥' : ''}</h2>
      <div class="panel-spots">
        <span class="${isFull ? 'full' : 'available'}">
          ${isFull ? '⚔️ PAYS PLEIN' : `${data ? data.total - data.occupied : '?'} spots libres`}
        </span>
        <span class="spot-count">${data ? `${data.occupied}/${data.total}` : ''}</span>
      </div>
    </div>

    <!-- Barre de remplissage -->
    ${data ? `
    <div class="fill-bar-container">
      <div class="fill-bar" style="width:${Math.round(data.occupied/data.total*100)}%"></div>
    </div>` : ''}

    <!-- Composition -->
    ${data && data.topFlags.length > 0 ? `
    <div class="panel-section">
      <h3>🌍 Composition</h3>
      <div class="flag-composition">
        ${data.topFlags.map((flag, i) => `
          <div class="flag-row">
            <span class="flag-emoji">${flag}</span>
            <div class="flag-bar-wrap">
              <div class="flag-bar" style="width:${[40,30,20][i] || 10}%"></div>
            </div>
            <span class="flag-pct">${[40,30,20][i] || 10}%</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- Derniers inscrits -->
    <div class="panel-section">
      <h3>🕐 Derniers inscrits</h3>
      <div id="panel-spots-list">
        <div class="activity-item">Chargement...</div>
      </div>
    </div>

    <!-- Formulaire -->
    <div class="panel-section">
      <h3>🏴 Plante ton drapeau</h3>

      <label class="form-label">Ton pays d'origine</label>
      <select id="flag-select" class="form-select">
        ${flags.map(f => `<option value="${f.code}">${f.name}</option>`).join('')}
      </select>

      <label class="form-label">Ton pseudo</label>
      <input id="pseudo-input" class="form-input"
             type="text" placeholder="Pseudo (max 20 car.)"
             maxlength="20" />

      ${!isFull ? `
      <label class="form-label" id="social-label" style="display:none">
        Lien réseau social
      </label>
      <input id="social-input" class="form-input"
             type="text" placeholder="instagram.com/tonpseudo"
             style="display:none" />
      ` : ''}
    </div>

    <p class="reassurance">
      💡 Si tu te fais écraser, tu peux toujours revenir surenchérir.
    </p>

    <div class="panel-actions">
      ${!isFull ? `
        <button class="btn-classic" onclick="validateAndBuy('${countryCode}', 'classic')">
          🏴 Planter — 3€
        </button>
        <button class="btn-premium" onclick="togglePremium('${countryCode}')">
          ⭐ Planter + lien — 6€
        </button>
      ` : `
        <button class="btn-war" onclick="buySpot('${countryCode}', 'war1')">
          ⚔️ Écraser un spot — ${warPrice}€
        </button>
      `}
    </div>
  `;


  panel.classList.remove('hidden');
  document.getElementById('close-panel').onclick = () => panel.classList.add('hidden');

  // Charge les vrais derniers inscrits
  loadPanelSpots(countryCode);
}


function togglePremium(countryCode) {
  const socialLabel = document.getElementById('social-label');
  const socialInput = document.getElementById('social-input');
  const btnPremium  = document.querySelector('.btn-premium');

  if (socialLabel) socialLabel.style.display = 'block';
  if (socialInput) socialInput.style.display = 'block';

  // Remplace le bouton par "Confirmer"
  if (btnPremium) {
    btnPremium.textContent = '✅ Confirmer — 6€';
    btnPremium.onclick = () => validateAndBuy(countryCode, 'premium');
  }
}

function validateAndBuy(countryCode, type) {
  const pseudo = document.getElementById('pseudo-input')?.value.trim();
  const social = document.getElementById('social-input')?.value.trim();

  // Pseudo obligatoire pour tous
  if (!pseudo) {
    showFieldError('pseudo-input', 'Le pseudo est obligatoire');
    return;
  }

  // Lien obligatoire pour premium
  if (type === 'premium' && !social) {
    showFieldError('social-input', 'Le lien réseau social est obligatoire');
    return;
  }

  // Valide le format du lien
  if (social && !social.includes('.')) {
    showFieldError('social-input', 'Lien invalide — ex: instagram.com/tonpseudo');
    return;
  }

  buySpot(countryCode, type);
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.style.border = '1px solid #E74C3C';

  // Supprime l'ancien message d'erreur si présent
  const existing = document.getElementById(fieldId + '-error');
  if (existing) existing.remove();

  const err = document.createElement('p');
  err.id    = fieldId + '-error';
  err.style.cssText = 'color:#E74C3C; font-size:11px; margin:4px 0 0';
  err.textContent   = message;
  field.insertAdjacentElement('afterend', err);

  // Remet la bordure normale après 3 secondes
  setTimeout(() => {
    field.style.border = '1px solid #1E3A5F';
    err.remove();
  }, 3000);
}