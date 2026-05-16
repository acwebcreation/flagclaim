// js/payment.js
async function buySpot(countryCode, type) {
  const flagSelect  = document.getElementById('flag-select');
  const pseudoInput = document.getElementById('pseudo-input');

  const flagOrigin = flagSelect  ? flagSelect.value       : 'FR';
  const pseudo     = pseudoInput ? pseudoInput.value || 'Anonyme' : 'Anonyme';

  try {
    const res = await fetch(
      'https://khxwzaqgayxzjtcvodqo.supabase.co/functions/v1/smart-function',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({ countryCode, flagOrigin, pseudo, type })
      }
    );

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Erreur lors du paiement. Réessaie.');
      console.error(data);
    }

  } catch (err) {
    alert('Erreur lors du paiement. Réessaie.');
    console.error(err);
  }
}