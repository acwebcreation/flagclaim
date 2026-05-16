// js/realtime.js

function initRealtime() {
  const url = `${SUPABASE_URL}/realtime/v1/websocket?apikey=${SUPABASE_ANON}&vsn=1.0.0`;
  const socket = new WebSocket(url);

  socket.onopen = () => {
    // Rejoindre le channel spots
    socket.send(JSON.stringify({
      topic: 'realtime:public:spots',
      event: 'phx_join',
      payload: {},
      ref: '1'
    }));
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.event === 'INSERT' && msg.topic === 'realtime:public:spots') {
      const newSpot = msg.payload.record;
      console.log('Nouveau spot planté :', newSpot);

      // Met à jour countryData
      const code = newSpot.country_code;
      if (countryData[code]) {
        countryData[code].occupied += 1;
        if (newSpot.flag_origin) {
          const emoji = getFlagEmoji(newSpot.flag_origin);
          if (!countryData[code].topFlags.includes(emoji)) {
            countryData[code].topFlags.unshift(emoji);
            countryData[code].topFlags = countryData[code].topFlags.slice(0, 3);
          }
        }
        countryData[code].isFull = countryData[code].occupied >= countryData[code].total;
      }

      // Redessine les badges et couleurs
      initCountries();
      renderBadges();

      // Notification visuelle
      showNotification(`🏴 Nouveau drapeau planté en ${countryNames[code] || code} !`);
    }
  };

  socket.onerror = (err) => console.log('Realtime erreur:', err);
  socket.onclose = () => {
    // Reconnexion automatique après 3 secondes
    setTimeout(initRealtime, 3000);
  };
}

function showNotification(message) {
  const notif = document.createElement('div');
  notif.className = 'notif';
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => notif.classList.add('notif-show'), 100);
  setTimeout(() => {
    notif.classList.remove('notif-show');
    setTimeout(() => notif.remove(), 500);
  }, 3000);
}