const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hmbyicviwrrayhztzkch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbWJ5aWN2aXdycmF5aHp0emtjaCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NzA0NDc3ODUsImV4cCI6MjA4NjAyMzc4NX0.ploo1AZPIOsFjvyiG3ZWSNevF7hlh1-syirNZ2VXp9k'; // wait, it might be that previous key failed. I'll use correctly loaded local .env loaded string instead!

async function check() {
  require('dotenv').config({ path: '.env.local' });
  const localUrl = process.env.VITE_SUPABASE_URL;
  const localKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(localUrl, localKey);

  try {
    const { data, error } = await supabase.from('municipios').select('id, nome, codigo_ibge').limit(5);
    if (error) {
      console.error('Erro:', error.message);
    } else {
      console.log('Dados encontrados:', data);
    }
  } catch (err) {
    console.error('Erro de execução:', err.message);
  }
}

check();
