const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

const envContent = `VITE_SUPABASE_URL=https://hmbyicviwrrayhztzkch.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDc3ODUsImV4cCI6MjA4NjAyMzc4NX0.DW_nfBi41LsnJvQqUOpDlWh6FrN-QdnMsBKOdVhE5Sg
`;

fs.writeFileSync(envPath, envContent, 'utf8');
console.log("SUCESSO: Arquivo .env.local gerado automaticamente sem aspas nocivas! Pode rodar o npm run dev.");
