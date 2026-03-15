
const accessToken = 'sbp_9da014db460f21eff98c51958e461e772deeb07c';
const projectRef = 'hmbyicviwrrayhztzkch';

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

-- Habilitar RLS
ALTER TABLE public.apoiadores ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Enable all for service role' AND polrelid = 'public.apoiadores'::regclass) THEN
        CREATE POLICY "Enable all for service role" ON public.apoiadores FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Enable all for authenticated users' AND polrelid = 'public.apoiadores'::regclass) THEN
        CREATE POLICY "Enable all for authenticated users" ON public.apoiadores FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
`;

async function applyMigration() {
  console.log('Tentando aplicar migração via Management API (fetch nativo)...');
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch(e) {
        data = text;
    }

    if (!response.ok) {
      console.error('Erro na API:', JSON.stringify(data, null, 2));
    } else {
      console.log('Migração aplicada com sucesso!');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Erro ao fazer a requisição:', err.message);
  }
}

applyMigration();
