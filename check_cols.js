
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmbyicviwrrayhztzkch.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ0Nzc4NSwiZXhwIjoyMDg2MDIzNzg1fQ.ploo1AZPIOsFjvyiG3ZWSNevF7hlh1-syirNZ2VXp9k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'municipios' })
  // If no RPC, let's try a trick: insert a dummy row then rollback, but we can't rollback easily.
  // Let's try to search for the SQL that created the table in the codebase if available.
  
  // Or, I can try to find if there's a "votos" column by trying to select it.
  const { error: e1 } = await supabase.from('municipios').select('votacao_ale').limit(1)
  const { error: e2 } = await supabase.from('municipios').select('votos_ale').limit(1)
  
  if (!e1) console.log('Coluna votacao_ale existe.')
  if (!e2) console.log('Coluna votos_ale existe.')
  
  if (e1 && e2) console.log('Colunas de votação não encontradas via select direto.')
}

getColumns()
