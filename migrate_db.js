
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmbyicviwrrayhztzkch.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtYnlpY3Zpd3JyYXloenR6a2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ0Nzc4NSwiZXhwIjoyMDg2MDIzNzg1fQ.ploo1AZPIOsFjvyiG3ZWSNevF7hlh1-syirNZ2VXp9k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sql = `
-- Adicionar colunas na tabela municipios
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS status_prefeito TEXT;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS idene BOOLEAN DEFAULT FALSE;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS lincoln_fechado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS status_atendimento TEXT;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS tipo_atendimento TEXT;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS principal_demanda TEXT;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS sugestao_sedese TEXT;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE public.municipios ADD COLUMN IF NOT EXISTS assessor_id UUID REFERENCES public.assessores(id);

-- Criar tabela de apoiadores
CREATE TABLE IF NOT EXISTS public.apoiadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipio_id UUID REFERENCES public.municipios(id),
    nome TEXT NOT NULL,
    cargo TEXT,
    telefone TEXT,
    endereco TEXT,
    email TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS e permissões básicas para Service Role
ALTER TABLE public.apoiadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for service role" ON public.apoiadores FOR ALL TO service_role USING (true) WITH CHECK (true);
`

async function migrate() {
  console.log('Iniciando migração do banco...')
  // Como não temos um endpoint direto de SQL no supabase-js v2 sem RPC, 
  // e o RPC 'exec_sql' pode não existir, vamos tentar via migrations ou informar o erro.
  // Se falhar o RPC, orientar o usuário a rodar no painel do Supabase.
  
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
  
  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
        console.error('\n[ERRO CRÍTICO] A função RPC "exec_sql" não existe no seu projeto Supabase.')
        console.error('Por favor, execute o seguinte SQL manualmente no SQL Editor do seu painel Supabase:\n')
        console.log(sql)
    } else {
        console.error('Erro na migração:', error.message)
    }
  } else {
    console.log('Migração concluída com sucesso.')
  }
}

migrate()
