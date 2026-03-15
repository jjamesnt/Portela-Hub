
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmbyicviwrrayhztzkch.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ0Nzc4NSwiZXhwIjoyMDg2MDIzNzg1fQ.ploo1AZPIOsFjvyiG3ZWSNevF7hlh1-syirNZ2VXp9k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listAllTables() {
  const { data, error } = await supabase.rpc('get_table_names') // If exists
  if (error) {
    // Try a direct query to a known metadata table if possible or just more guesses
    console.log('RPC get_table_names falhou. Tentando adivinhar...')
    const guesses = ['municipios_votos', 'votos_2022', 'votos_municipio', 'votos_resumo']
    for (const g of guesses) {
      const { error: e } = await supabase.from(g).select('*').limit(1)
      if (!e) console.log(`Encontrada: ${g}`)
    }
  } else {
    console.log('Tabelas:', data)
  }
}

listAllTables()
