import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import {
  NovaReceitaSchema,
  NovaDespesaSchema,
  NovaDividaSchema,
  NovaMetaPoupancaSchema,
  NovaMovimentacaoPoupancaSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Rotas de autenticação
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "Código de autorização não fornecido" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 dias
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  
  // Verifica se o usuário já existe na tabela usuarios
  const existingUser = await c.env.DB.prepare(
    "SELECT * FROM usuarios WHERE user_id = ?"
  ).bind(user.id).first();

  if (!existingUser) {
    // Cria o usuário na base de dados local
    await c.env.DB.prepare(
      "INSERT INTO usuarios (user_id, nome, email) VALUES (?, ?, ?)"
    ).bind(user.id, user.google_user_data.name || '', user.email).run();

    // Copia categorias padrão para o usuário
    await c.env.DB.prepare(`
      INSERT INTO categorias (user_id, nome, cor, icone, limite_mensal)
      SELECT ?, nome, cor, icone, limite_mensal FROM categorias WHERE user_id = 'default'
    `).bind(user.id).run();
  }

  return c.json(user);
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Dashboard - Resumo financeiro
app.get('/api/dashboard', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Receitas do mês
  const { receitas_mes } = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(valor), 0) as receitas_mes 
    FROM receitas 
    WHERE user_id = ? AND date(data_receita) >= ? AND date(data_receita) <= ?
  `).bind(user.id, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]).first() as any;

  // Despesas do mês
  const { despesas_mes } = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(valor), 0) as despesas_mes 
    FROM despesas 
    WHERE user_id = ? AND date(data_despesa) >= ? AND date(data_despesa) <= ?
  `).bind(user.id, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]).first() as any;

  // Dívidas abertas
  const { dividas_abertas } = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(valor_atual), 0) as dividas_abertas 
    FROM dividas 
    WHERE user_id = ? AND status = 'aberta'
  `).bind(user.id).first() as any;

  // Metas ativas
  const { metas_ativas } = await c.env.DB.prepare(`
    SELECT COUNT(*) as metas_ativas 
    FROM metas_poupanca 
    WHERE user_id = ? AND status = 'ativa'
  `).bind(user.id).first() as any;

  // Total poupado
  const { total_poupado } = await c.env.DB.prepare(`
    SELECT COALESCE(SUM(valor_atual), 0) as total_poupado 
    FROM metas_poupanca 
    WHERE user_id = ?
  `).bind(user.id).first() as any;

  const saldo_total = receitas_mes - despesas_mes;

  return c.json({
    saldo_total,
    receitas_mes,
    despesas_mes,
    dividas_abertas,
    metas_ativas,
    total_poupado,
  });
});

// Rotas de Receitas
app.get('/api/receitas', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM receitas WHERE user_id = ? ORDER BY data_receita DESC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/receitas', authMiddleware, zValidator('json', NovaReceitaSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO receitas (user_id, descricao, valor, data_receita, tipo, fonte) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(user.id, data.descricao, data.valor, data.data_receita, data.tipo, data.fonte).run();

  return c.json({ id: result.meta.last_row_id, ...data }, 201);
});

app.delete('/api/receitas/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const id = c.req.param('id');

  await c.env.DB.prepare(
    "DELETE FROM receitas WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).run();

  return c.json({ success: true });
});

// Rotas de Categorias
app.get('/api/categorias', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM categorias WHERE user_id = ? ORDER BY nome"
  ).bind(user.id).all();

  return c.json(results);
});

// Rotas de Despesas
app.get('/api/despesas', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const { results } = await c.env.DB.prepare(`
    SELECT d.*, c.nome as categoria_nome, c.cor as categoria_cor
    FROM despesas d
    LEFT JOIN categorias c ON d.categoria_id = c.id
    WHERE d.user_id = ? 
    ORDER BY d.data_despesa DESC
  `).bind(user.id).all();

  return c.json(results);
});

app.post('/api/despesas', authMiddleware, zValidator('json', NovaDespesaSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO despesas (user_id, categoria_id, descricao, valor, data_despesa, tipo, recibo_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(user.id, data.categoria_id, data.descricao, data.valor, data.data_despesa, data.tipo, data.recibo_url).run();

  return c.json({ id: result.meta.last_row_id, ...data }, 201);
});

app.delete('/api/despesas/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const id = c.req.param('id');

  await c.env.DB.prepare(
    "DELETE FROM despesas WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).run();

  return c.json({ success: true });
});

// Rotas de Dívidas
app.get('/api/dividas', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM dividas WHERE user_id = ? ORDER BY data_vencimento ASC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/dividas', authMiddleware, zValidator('json', NovaDividaSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO dividas (user_id, credor, descricao, valor_original, valor_atual, taxa_juros, data_vencimento, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(user.id, data.credor, data.descricao, data.valor_original, data.valor_atual, data.taxa_juros, data.data_vencimento, data.status).run();

  return c.json({ id: result.meta.last_row_id, ...data }, 201);
});

app.put('/api/dividas/:id/quitar', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const id = c.req.param('id');

  await c.env.DB.prepare(`
    UPDATE dividas SET status = 'quitada', valor_atual = 0, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `).bind(id, user.id).run();

  return c.json({ success: true });
});

app.delete('/api/dividas/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const id = c.req.param('id');

  await c.env.DB.prepare(
    "DELETE FROM dividas WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).run();

  return c.json({ success: true });
});

// Rotas de Metas de Poupança
app.get('/api/metas', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM metas_poupanca WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json(results);
});

app.post('/api/metas', authMiddleware, zValidator('json', NovaMetaPoupancaSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const data = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO metas_poupanca (user_id, nome, descricao, valor_alvo, data_meta, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(user.id, data.nome, data.descricao, data.valor_alvo, data.data_meta, data.status).run();

  return c.json({ id: result.meta.last_row_id, ...data, valor_atual: 0 }, 201);
});

app.post('/api/metas/:id/movimentacao', authMiddleware, zValidator('json', NovaMovimentacaoPoupancaSchema), async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const metaId = c.req.param('id');
  const data = c.req.valid('json');

  // Inserir movimentação
  await c.env.DB.prepare(`
    INSERT INTO movimentacoes_poupanca (meta_id, user_id, tipo, valor, motivo, data_movimentacao) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(metaId, user.id, data.tipo, data.valor, data.motivo, data.data_movimentacao).run();

  // Atualizar valor atual da meta
  const valorAjuste = data.tipo === 'deposito' ? data.valor : -data.valor;
  await c.env.DB.prepare(`
    UPDATE metas_poupanca 
    SET valor_atual = valor_atual + ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `).bind(valorAjuste, metaId, user.id).run();

  return c.json({ success: true });
});

app.delete('/api/metas/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const id = c.req.param('id');

  // Deletar movimentações primeiro
  await c.env.DB.prepare(
    "DELETE FROM movimentacoes_poupanca WHERE meta_id = ? AND user_id = ?"
  ).bind(id, user.id).run();

  // Deletar meta
  await c.env.DB.prepare(
    "DELETE FROM metas_poupanca WHERE id = ? AND user_id = ?"
  ).bind(id, user.id).run();

  return c.json({ success: true });
});

// Rota para estatísticas por categoria
app.get('/api/estatisticas/categorias', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { results } = await c.env.DB.prepare(`
    SELECT 
      c.nome, 
      c.cor, 
      c.limite_mensal,
      COALESCE(SUM(d.valor), 0) as total_gasto
    FROM categorias c
    LEFT JOIN despesas d ON c.id = d.categoria_id 
      AND d.user_id = ? 
      AND date(d.data_despesa) >= ? 
      AND date(d.data_despesa) <= ?
    WHERE c.user_id = ?
    GROUP BY c.id, c.nome, c.cor, c.limite_mensal
    ORDER BY total_gasto DESC
  `).bind(user.id, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0], user.id).all();

  return c.json(results);
});

// Rota para atualizar limite de categoria
app.put('/api/categorias/:id/limite', authMiddleware, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: "Usuário não autenticado" }, 401);
  }
  
  const categoriaId = c.req.param('id');
  const { limite_mensal } = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE categorias 
    SET limite_mensal = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND user_id = ?
  `).bind(limite_mensal, categoriaId, user.id).run();

  return c.json({ success: true });
});

export default app;
