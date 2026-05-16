// js/map.js

// Centroïdes des pays (position des badges sur la carte)
const centroids = {
  FR: { x: 48, y: 56 }, DE: { x: 55, y: 42 }, GB: { x: 38, y: 35 },
  IT: { x: 58, y: 62 }, ES: { x: 32, y: 65 }, PT: { x: 24, y: 68 },
  BE: { x: 49, y: 40 }, NL: { x: 50, y: 37 }, PL: { x: 62, y: 40 },
  SE: { x: 58, y: 22 }, NO: { x: 52, y: 18 }, DK: { x: 53, y: 33 },
  FI: { x: 66, y: 18 }, GR: { x: 65, y: 75 }, RO: { x: 68, y: 55 },
  CZ: { x: 58, y: 44 }, AT: { x: 57, y: 50 }, CH: { x: 51, y: 52 },
  HU: { x: 63, y: 52 }, SK: { x: 62, y: 47 }, HR: { x: 59, y: 57 },
  SI: { x: 56, y: 54 }, RS: { x: 64, y: 59 }, BG: { x: 68, y: 62 },
  UA: { x: 74, y: 46 }, BY: { x: 70, y: 38 }, MD: { x: 72, y: 53 },
  LT: { x: 66, y: 33 }, LV: { x: 67, y: 29 }, EE: { x: 67, y: 25 },
  AL: { x: 62, y: 67 }, MK: { x: 64, y: 65 }, BA: { x: 61, y: 60 },
  ME: { x: 62, y: 63 }, IE: { x: 32, y: 38 }, LU: { x: 51, y: 45 },
  MT: { x: 58, y: 82 }, CY: { x: 74, y: 80 }, IS: { x: 22, y: 12 },
  TR: { x: 78, y: 68 }, XK: { x: 63, y: 63 }
};

// Données temporaires (avant Supabase)
const mockData = {
  FR: { occupied: 34, total: 100, topFlags: ['🇫🇷','🇲🇦','🇩🇿'], isFull: false },
  BE: { occupied: 40, total: 40,  topFlags: ['🇧🇪','🇲🇦','🇹🇷'], isFull: true  },
  DE: { occupied: 12, total: 100, topFlags: ['🇩🇪','🇹🇷','🇵🇱'], isFull: false },
  IT: { occupied: 8,  total: 100, topFlags: ['🇮🇹','🇷🇴','🇦🇱'], isFull: false },
  ES: { occupied: 5,  total: 100, topFlags: ['🇪🇸','🇲🇦','🇨🇴'], isFull: false },
};

// Pays européens qu'on active
const europeanCountries = [
  'FR','DE','GB','IT','ES','PT','BE','NL','PL','SE','NO','DK',
  'FI','GR','RO','CZ','AT','CH','HU','SK','HR','SI','RS','BG',
  'UA','BY','MD','LT','LV','EE','AL','MK','BA','ME','IE','LU',
  'MT','CY','IS','TR','XK'
];

// Charge le SVG et initialise la carte
fetch('assets/europe.svg')
  .then(r => r.text())
  .then(svgContent => {
    document.getElementById('map-container').innerHTML = svgContent;

    // Ajuste le SVG pour qu'il remplisse le container
    const svg = document.querySelector('#map-container svg');
    svg.style.width  = '100%';
    svg.style.height = 'auto';

    initCountries();
    renderBadges();
    initTooltip();
  });

function initCountries() {
  // Grise tous les pays par défaut
  document.querySelectorAll('#map-container path').forEach(path => {
    path.style.fill   = '#2a2a3a';
    path.style.stroke = '#444';
    path.style.strokeWidth = '0.5';
  });

  // Active les pays européens
  europeanCountries.forEach(code => {
    const el = document.getElementById(code)
             || document.getElementById(code.toLowerCase());
    if (!el) return;

    const data = mockData[code];

    // Couleur selon état
    if (data?.isFull) {
      el.style.fill = '#E74C3C'; // rouge = plein
    } else if (data?.occupied / data?.total > 0.8) {
      el.style.fill = '#E67E22'; // orange = presque plein
    } else {
      el.style.fill = '#1E3A5F'; // bleu = normal
    }

    el.style.cursor = 'pointer';
    el.style.transition = 'opacity 0.2s';

    el.addEventListener('mouseenter', () => el.style.opacity = '0.8');
    el.addEventListener('mouseleave', () => el.style.opacity = '1');
    el.addEventListener('click', () => openPanel(code));
  });
}

function renderBadges() {
  // Supprime les anciens badges
  document.querySelectorAll('.country-badge').forEach(b => b.remove());

  const svg = document.querySelector('#map-container svg');
  const rect = svg.getBoundingClientRect();
  const container = document.getElementById('map-container');

  europeanCountries.forEach(code => {
    const c = centroids[code];
    const data = mockData[code];
    if (!c || !data) return;

    const badge = document.createElement('div');
    badge.className = 'country-badge';
    badge.style.left = c.x + '%';
    badge.style.top  = c.y + '%';

    const top3 = data.topFlags.slice(0, 3).join(' ');
    const pct  = Math.round((data.occupied / data.total) * 100);

    badge.innerHTML = `
      <div class="badge-flags">${top3}</div>
      <div class="badge-count">${data.occupied}/${data.total}</div>
    `;

    badge.addEventListener('click', () => openPanel(code));
    container.appendChild(badge);
  });

  function initTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'tooltip';
  document.body.appendChild(tooltip);

  europeanCountries.forEach(code => {
    const el = document.getElementById(code)
             || document.getElementById(code.toLowerCase());
    if (!el) return;

    el.addEventListener('mousemove', (e) => {
      const name = countryNames[code] || code;
      const data = mockData[code];
      const info = data ? ` — ${data.occupied}/${data.total} spots` : ' — 0 spots';
      tooltip.textContent = name + info;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.pageX + 12) + 'px';
      tooltip.style.top  = (e.pageY - 28) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
}

// Noms des pays en français
const countryNames = {
  FR:'France', DE:'Allemagne', GB:'Royaume-Uni', IT:'Italie',
  ES:'Espagne', PT:'Portugal', BE:'Belgique', NL:'Pays-Bas',
  PL:'Pologne', SE:'Suède', NO:'Norvège', DK:'Danemark',
  FI:'Finlande', GR:'Grèce', RO:'Roumanie', CZ:'Tchéquie',
  AT:'Autriche', CH:'Suisse', HU:'Hongrie', SK:'Slovaquie',
  HR:'Croatie', SI:'Slovénie', RS:'Serbie', BG:'Bulgarie',
  UA:'Ukraine', BY:'Biélorussie', MD:'Moldavie', LT:'Lituanie',
  LV:'Lettonie', EE:'Estonie', AL:'Albanie', MK:'Macédoine',
  BA:'Bosnie', ME:'Monténégro', IE:'Irlande', LU:'Luxembourg',
  MT:'Malte', CY:'Chypre', IS:'Islande', TR:'Turquie', XK:'Kosovo'
};
}