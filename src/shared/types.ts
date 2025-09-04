import z from "zod";

// Schemas para validação de dados financeiros
export const UsuarioSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  nome: z.string().optional(),
  email: z.string().optional(),
  salario_fixo: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CategoriaSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  nome: z.string(),
  cor: z.string().default('#3B82F6'),
  icone: z.string().default('DollarSign'),
  limite_mensal: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ReceitaSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  descricao: z.string(),
  valor: z.number(),
  data_receita: z.string(),
  tipo: z.enum(['unica', 'recorrente', 'extra']).default('unica'),
  fonte: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DespesaSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  categoria_id: z.number().optional(),
  descricao: z.string(),
  valor: z.number(),
  data_despesa: z.string(),
  tipo: z.enum(['unica', 'recorrente']).default('unica'),
  recibo_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DividaSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  credor: z.string(),
  descricao: z.string(),
  valor_original: z.number(),
  valor_atual: z.number(),
  taxa_juros: z.number().default(0),
  data_vencimento: z.string().optional(),
  status: z.enum(['aberta', 'quitada']).default('aberta'),
  created_at: z.string(),
  updated_at: z.string(),
});

export const MetaPoupancaSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  nome: z.string(),
  descricao: z.string().optional(),
  valor_alvo: z.number(),
  valor_atual: z.number().default(0),
  data_meta: z.string().optional(),
  status: z.enum(['ativa', 'concluida', 'cancelada']).default('ativa'),
  created_at: z.string(),
  updated_at: z.string(),
});

export const MovimentacaoPoupancaSchema = z.object({
  id: z.number(),
  meta_id: z.number(),
  user_id: z.string(),
  tipo: z.enum(['deposito', 'saque']),
  valor: z.number(),
  motivo: z.string().optional(),
  data_movimentacao: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schemas para criação de novos registros
export const NovaReceitaSchema = ReceitaSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const NovaDespesaSchema = DespesaSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const NovaDividaSchema = DividaSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const NovaMetaPoupancaSchema = MetaPoupancaSchema.omit({
  id: true,
  user_id: true,
  valor_atual: true,
  created_at: true,
  updated_at: true,
});

export const NovaMovimentacaoPoupancaSchema = MovimentacaoPoupancaSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

// Tipos derivados dos schemas
export type Usuario = z.infer<typeof UsuarioSchema>;
export type Categoria = z.infer<typeof CategoriaSchema>;
export type Receita = z.infer<typeof ReceitaSchema>;
export type Despesa = z.infer<typeof DespesaSchema>;
export type Divida = z.infer<typeof DividaSchema>;
export type MetaPoupanca = z.infer<typeof MetaPoupancaSchema>;
export type MovimentacaoPoupanca = z.infer<typeof MovimentacaoPoupancaSchema>;

export type NovaReceita = z.infer<typeof NovaReceitaSchema>;
export type NovaDespesa = z.infer<typeof NovaDespesaSchema>;
export type NovaDivida = z.infer<typeof NovaDividaSchema>;
export type NovaMetaPoupanca = z.infer<typeof NovaMetaPoupancaSchema>;
export type NovaMovimentacaoPoupanca = z.infer<typeof NovaMovimentacaoPoupancaSchema>;

// Schema para resumo financeiro do dashboard
export const ResumoFinanceiroSchema = z.object({
  saldo_total: z.number(),
  receitas_mes: z.number(),
  despesas_mes: z.number(),
  dividas_abertas: z.number(),
  metas_ativas: z.number(),
  total_poupado: z.number(),
});

export type ResumoFinanceiro = z.infer<typeof ResumoFinanceiroSchema>;
