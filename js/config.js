// js/config.js
const SUPABASE_URL  = 'https://khxwzaqgayxzjtcvodqo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeHd6YXFnYXl4emp0Y3ZvZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTExMDcsImV4cCI6MjA5NDQ2NzEwN30.lg36RWmCusXr5T5QX1kLUw21NkYYIUgXCwQ8shLXGY4'; // ta clé anon

// Initialise le client Supabase
// Renommé en "db" pour éviter le conflit avec le CDN
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);