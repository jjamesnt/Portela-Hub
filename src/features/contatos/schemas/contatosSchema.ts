import { z } from 'zod';

export const contatoSchema = z.object({
    id: z.string(),
    originalId: z.string(),
    nome: z.string(),
    tipo: z.enum(['Liderança', 'Assessor', 'Apoiador']),
    cargoOuPartido: z.string(),
    municipioOuRegiao: z.string(),
    telefone: z.string().optional(),
    email: z.string().optional(),
    avatarUrl: z.string().optional(),
    origem: z.string(),
    cadastradoPorNome: z.string().optional()
});

export type ContatoUnificado = z.infer<typeof contatoSchema>;
