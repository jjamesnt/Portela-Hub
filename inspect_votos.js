
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmbyicviwrrayhztzkch.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ0Nzc4NSwiZXhwIjoyMDg2MDIzNzg1fQ.ploo1AZPIOsFjvyiG3ZWSNevF7hlh1-syirNZ2VXp9k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectVotos() {
  const { data, error } = await supabase.from('votos').select('*').limit(5)
  if (error) {
    console.error('Erro ao buscar dados da tabela votos:', error.message)
    return
  }
  console.log('Exemplo de dados na tabela votos:', JSON.stringify(data, null, 2))
  
  if (data.length > 0) {
    console.log('Colunas da tabela votos:', Object.keys(data[0]))
  }
}

inspectVotos()
