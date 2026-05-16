// js/config.js
const SUPABASE_URL  = 'https://khxwzaqgayxzjtcvodqo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeHd6YXFnYXl4emp0Y3ZvZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTExMDcsImV4cCI6MjA5NDQ2NzEwN30.lg36RWmCusXr5T5QX1kLUw21NkYYIUgXCwQ8shLXGY4';

// Fonction universelle pour appeler Supabase sans bibliothèque
async function sbGet(table, params = '') {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${params}`,
    {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`
      }
    }
  );
  return res.json();
}

var countryData = {};