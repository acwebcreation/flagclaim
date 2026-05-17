// js/map.js

const centroids = {
  FR: { x: 48, y: 56 }, DE: { x: 55, y: 42 }, GB: { x: 38, y: 35 },
  IT: { x: 63, y: 62 }, ES: { x: 39, y: 65 }, PT: { x: 29, y: 68 },
  BE: { x: 50, y: 45 }, NL: { x: 50, y: 42 }, PL: { x: 67, y: 40 },
  SE: { x: 63, y: 19 }, NO: { x: 52, y: 18 }, DK: { x: 53, y: 33 },
  FI: { x: 71, y: 18 }, GR: { x: 65, y: 75 }, RO: { x: 68, y: 55 },
  CZ: { x: 58, y: 44 }, AT: { x: 57, y: 50 }, CH: { x: 51, y: 57 },
  HU: { x: 63, y: 52 }, SK: { x: 62, y: 47 }, HR: { x: 66, y: 57 },
  SI: { x: 56, y: 54 }, RS: { x: 71, y: 59 }, BG: { x: 79, y: 62 },
  UA: { x: 79, y: 46 }, BY: { x: 70, y: 38 }, MD: { x: 82, y: 53 },
  LT: { x: 69, y: 33 }, LV: { x: 70, y: 29 }, EE: { x: 70, y: 25 },
  AL: { x: 74, y: 67 }, MK: { x: 71, y: 65 }, BA: { x: 68, y: 60 },
  ME: { x: 69, y: 63 }, IE: { x: 32, y: 38 }, LU: { x: 51, y: 45 },
  MT: { x: 58, y: 82 }, CY: { x: 74, y: 80 }, IS: { x: 17, y: 14 },
  TR: { x: 84, y: 68 }, XK: { x: 76, y: 63 }
};

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


const europeanCountries = [
  'FR','DE','GB','IT','ES','PT','BE','NL','PL','SE','NO','DK',
  'FI','GR','RO','CZ','AT','CH','HU','SK','HR','SI','RS','BG',
  'UA','BY','MD','LT','LV','EE','AL','MK','BA','ME','IE','LU',
  'MT','CY','IS','TR','XK'
];




function initCountries() {
  document.querySelectorAll('#map-container path').forEach(path => {
    path.style.fill        = '#2a2a3a';
    path.style.stroke      = '#444';
    path.style.strokeWidth = '0.5';
  });

  europeanCountries.forEach(code => {
    // Récupère TOUS les éléments avec cet ID (gère les doublons comme PT)
    const els = [
      ...document.querySelectorAll(`#map-container #${code}`),
      ...document.querySelectorAll(`#map-container #${code.toLowerCase()}`)
    ];
    if (els.length === 0) return;

    const data = countryData[code];
    els.forEach(el => {
      if (data?.isFull) {
        el.style.fill = '#E74C3C';
      } else if (data?.occupied / data?.total > 0.8) {
        el.style.fill = '#E67E22';
      } else {
        el.style.fill = '#1E3A5F';
      }
      el.style.cursor     = 'pointer';
      el.style.transition = 'opacity 0.2s';
      el.addEventListener('mouseenter', () => els.forEach(e => e.style.opacity = '0.8'));
      el.addEventListener('mouseleave', () => els.forEach(e => e.style.opacity = '1'));
      el.addEventListener('click', () => openPanel(code));
    });
  });
}

function initTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'tooltip';
  document.body.appendChild(tooltip);

  europeanCountries.forEach(code => {
    const els = [
      ...document.querySelectorAll(`#map-container #${code}`),
      ...document.querySelectorAll(`#map-container #${code.toLowerCase()}`)
    ];
    if (els.length === 0) return;

    els.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const name = countryNames[code] || code;
        const data = countryData[code];
        const info = data ? ` — ${data.occupied}/${data.total} spots` : ' — 0 spots';
        tooltip.textContent   = name + info;
        tooltip.style.display = 'block';
        tooltip.style.left    = (e.pageX + 12) + 'px';
        tooltip.style.top     = (e.pageY - 28) + 'px';
      });
      el.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  });
}


async function loadCountryData() {
  const countries = await sbGet('countries', 'select=*');
  const spots = await sbGet('spots', 'select=country_code,flag_origin&status=eq.active');
  if (countries) {
    countries.forEach(country => {
      const countrySpots = spots ? spots.filter(s => s.country_code === country.code) : [];
      const flagCounts = {};
      countrySpots.forEach(s => { flagCounts[s.flag_origin] = (flagCounts[s.flag_origin] || 0) + 1; });
      const topFlags = Object.entries(flagCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([f])=>getFlagEmoji(f));
      countryData[country.code] = {
        total: country.max_spots,
        occupied: countrySpots.length,
        topFlags: topFlags.length > 0 ? topFlags : [],
        isFull: countrySpots.length >= country.max_spots,
        warCount: country.war_count,
        warPrice: country.current_war_price
      };
    });
  }
  console.log('countryData chargé ✅', countryData);
}

async function init() {
  await loadCountryData();
  fetch('assets/europe.svg')
    .then(r => r.text())
    .then(svgContent => {
      document.getElementById('map-container').innerHTML = svgContent;
      const svg = document.querySelector('#map-container svg');
      svg.style.width = '100%';
      svg.style.height = 'auto';
      initCountries();
      renderBadges();
      initTooltip();
      initRealtime();
    });
}

init();

function renderBadges() {
  document.querySelectorAll('.country-badge').forEach(b => b.remove());
  const container = document.getElementById('map-container');

  europeanCountries.forEach(code => {
    const c    = centroids[code];
    const data = countryData[code];
    if (!c || !data || data.occupied === 0) return;

    const badge = document.createElement('div');
    badge.className  = 'country-badge';
    badge.style.left = (c.x + 5) + '%';
    badge.style.top  = (c.y + 14) + '%';

    const flagGroups = data.topFlags.map(flag => `<span class="flag-group">${flag}<sup>${data.occupied}</sup></span>`).join("");

    badge.innerHTML = `<div class="badge-flags">${flagGroups || '🏴'}</div>`;
    badge.addEventListener('click', () => openPanel(code));
    badge.addEventListener("mousemove", function(e){ var t=document.getElementById("tooltip"); if(!t)return; var libre=(countryData[code]?countryData[code].total-countryData[code].occupied:0); t.textContent=(countryNames[code]||code)+" - "+libre+" spots libres"; t.style.display="block"; t.style.left=(e.pageX+12)+"px"; t.style.top=(e.pageY-28)+"px"; });
    badge.addEventListener("mouseleave", function(){ var t=document.getElementById("tooltip"); if(t)t.style.display="none"; });
    container.appendChild(badge);
  });
}
