
-- Tabela de usuários (informações adicionais)
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  nome TEXT,
  email TEXT,
  salario_fixo REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de despesas
CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  icone TEXT DEFAULT 'DollarSign',
  limite_mensal REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de receitas
CREATE TABLE receitas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_receita DATE NOT NULL,
  tipo TEXT DEFAULT 'unica', -- 'unica', 'recorrente', 'extra'
  fonte TEXT, -- salario, freelance, bonus, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de despesas
CREATE TABLE despesas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  categoria_id INTEGER,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_despesa DATE NOT NULL,
  tipo TEXT DEFAULT 'unica', -- 'unica', 'recorrente'
  recibo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dívidas
CREATE TABLE dividas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  credor TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_original REAL NOT NULL,
  valor_atual REAL NOT NULL,
  taxa_juros REAL DEFAULT 0,
  data_vencimento DATE,
  status TEXT DEFAULT 'aberta', -- 'aberta', 'quitada'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de metas de poupança
CREATE TABLE metas_poupanca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_alvo REAL NOT NULL,
  valor_atual REAL DEFAULT 0,
  data_meta DATE,
  status TEXT DEFAULT 'ativa', -- 'ativa', 'concluida', 'cancelada'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de poupança
CREATE TABLE movimentacoes_poupanca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meta_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'deposito', 'saque'
  valor REAL NOT NULL,
  motivo TEXT,
  data_movimentacao DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias padrão
INSERT INTO categorias (user_id, nome, cor, icone) VALUES
('default', 'Alimentação', '#EF4444', 'UtensilsCrossed'),
('default', 'Transporte', '#3B82F6', 'Car'),
('default', 'Saúde', '#10B981', 'Heart'),
('default', 'Lazer', '#F59E0B', 'Gamepad2'),
('default', 'Educação', '#8B5CF6', 'GraduationCap'),
('default', 'Casa', '#F97316', 'Home'),
('default', 'Roupas', '#EC4899', 'Shirt'),
('default', 'Outros', '#6B7280', 'MoreHorizontal');
