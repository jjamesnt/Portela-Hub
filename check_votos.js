
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmbyicviwrrayhztzkch.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ0Nzc4NSwiZXhwIjoyMDg2MDIzNzg1fQ.ploo1AZPIOsFjvyiG3ZWSNevF7hlh1-syirNZ2VXp9k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkVotacaoData() {
  // Check for tables that might contain voting data
  const { data: tables, error: tableError } = await supabase
    .from('votos_municipios') // Guessing name
    .select('*')
    .limit(1)
  
  if (tableError) {
    console.log('Tabela votos_municipios não encontrada.')
  } else {
    console.log('Tabela votos_municipios encontrada com dados.')
  }

  // Check information_schema if possible via RPC or direct query
  // Since I can't use RPC easily, I'll try to select from likely names
  const potentialTables = ['votos', 'votacao', 'resultados_eleitorais', 'votos_2022']
  for (const t of potentialTables) {
    const { error } = await supabase.from(t).select('*').limit(1)
    if (!error) console.log(`Tabela ${t} encontrada.`)
  }
}

checkVotacaoData()
