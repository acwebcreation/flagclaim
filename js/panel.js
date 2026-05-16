// js/panel.js
function openPanel(countryCode) {
  const data = countryData[countryCode]; // ← était mockData avant
  const name = countryNames[countryCode] || countryCode;
  const panel = document.getElementById('side-panel');
  const content = document.getElementById('panel-content');

  // Calcul état du pays
  const isFull = data ? data.occupied >= data.total : false;
  const warPrice = 12; // prix guerre 1 par défaut

  // Contenu du panel
  content.innerHTML = `

    <!-- En-tête pays -->
    <div class="panel-header">
      <h2>${name}</h2>
      ${data ? `
        <div class="panel-spots">
          <span class="${isFull ? 'full' : 'available'}">
            ${isFull ? '⚔️ PAYS PLEIN' : `${data.total - data.occupied} spots libres`}
          </span>
          <span class="spot-count">${data.occupied}/${data.total}</span>
        </div>
      ` : '<p class="no-data">Aucun spot planté — sois le premier !</p>'}
    </div>

    <!-- Barre de remplissage -->
    ${data ? `
    <div class="fill-bar-container">
      <div class="fill-bar" style="width:${Math.round(data.occupied/data.total*100)}%"></div>
    </div>
    ` : ''}

    <!-- Top nationalités -->
    ${data ? `
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
    </div>
    ` : ''}

    <!-- Occupants actuels -->
    ${data ? `
    <div class="panel-section">
      <h3>🏴 Occupants actuels</h3>
      <div class="occupants-list">
        ${data.topFlags.map((flag, i) => `
          <div class="occupant">
            <span>${flag}</span>
            <span class="occupant-pseudo">Pseudo${i+1}</span>
            ${i % 2 === 0 ? '<span class="premium-star">⭐</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Message rassurant -->
    <p class="reassurance">
      💡 Si tu te fais écraser, tu peux toujours revenir surenchérir.
    </p>

    <!-- Boutons d'action -->
    <div class="panel-actions">
      ${!isFull ? `
        <button class="btn-classic" onclick="buySpot('${countryCode}', 'classic')">
          🏴 Planter — 3€
        </button>
        <button class="btn-premium" onclick="buySpot('${countryCode}', 'premium')">
          ⭐ Planter + lien — 6€
        </button>
      ` : `
        <button class="btn-war" onclick="buySpot('${countryCode}', 'war')">
          ⚔️ Écraser un spot — ${warPrice}€
        </button>
      `}
    </div>

  `;

  // Ouvre le panel
  panel.classList.remove('hidden');

  // Ferme au clic sur X
  document.getElementById('close-panel').onclick = () => {
    panel.classList.add('hidden');
  };
}