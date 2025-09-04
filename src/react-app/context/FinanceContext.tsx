import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import type { 
  ResumoFinanceiro, 
  Receita, 
  Despesa, 
  Divida, 
  MetaPoupanca, 
  Categoria,
  NovaReceita,
  NovaDespesa,
  NovaDivida,
  NovaMetaPoupanca,
  NovaMovimentacaoPoupanca
} from '@/shared/types';

interface FinanceContextValue {
  // Estados
  resumo: ResumoFinanceiro | null;
  receitas: Receita[];
  despesas: Despesa[];
  dividas: Divida[];
  metas: MetaPoupanca[];
  categorias: Categoria[];
  loading: boolean;
  
  // Ações
  carregarDados: () => Promise<void>;
  adicionarReceita: (receita: NovaReceita) => Promise<void>;
  adicionarDespesa: (despesa: NovaDespesa) => Promise<void>;
  adicionarDivida: (divida: NovaDivida) => Promise<void>;
  adicionarMeta: (meta: NovaMetaPoupanca) => Promise<void>;
  movimentarPoupanca: (metaId: number, movimentacao: NovaMovimentacaoPoupanca) => Promise<void>;
  quitarDivida: (dividaId: number) => Promise<void>;
  excluirReceita: (receitaId: number) => Promise<void>;
  excluirDespesa: (despesaId: number) => Promise<void>;
  excluirDivida: (dividaId: number) => Promise<void>;
  excluirMeta: (metaId: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
}

export default function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [metas, setMetas] = useState<MetaPoupanca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [
        resumoRes,
        receitasRes,
        despesasRes,
        dividasRes,
        metasRes,
        categoriasRes
      ] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/receitas'),
        fetch('/api/despesas'),
        fetch('/api/dividas'),
        fetch('/api/metas'),
        fetch('/api/categorias')
      ]);

      if (resumoRes.ok) setResumo(await resumoRes.json());
      if (receitasRes.ok) setReceitas(await receitasRes.json());
      if (despesasRes.ok) setDespesas(await despesasRes.json());
      if (dividasRes.ok) setDividas(await dividasRes.json());
      if (metasRes.ok) setMetas(await metasRes.json());
      if (categoriasRes.ok) setCategorias(await categoriasRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarReceita = async (receita: NovaReceita) => {
    const response = await fetch('/api/receitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receita)
    });

    if (response.ok) {
      const novaReceita = await response.json();
      setReceitas(prev => [novaReceita, ...prev]);
      await carregarDados(); // Recarrega o resumo
    }
  };

  const adicionarDespesa = async (despesa: NovaDespesa) => {
    const response = await fetch('/api/despesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(despesa)
    });

    if (response.ok) {
      const novaDespesa = await response.json();
      setDespesas(prev => [novaDespesa, ...prev]);
      await carregarDados(); // Recarrega o resumo
    }
  };

  const adicionarDivida = async (divida: NovaDivida) => {
    const response = await fetch('/api/dividas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(divida)
    });

    if (response.ok) {
      const novaDivida = await response.json();
      setDividas(prev => [novaDivida, ...prev]);
      await carregarDados(); // Recarrega o resumo
    }
  };

  const adicionarMeta = async (meta: NovaMetaPoupanca) => {
    const response = await fetch('/api/metas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta)
    });

    if (response.ok) {
      const novaMeta = await response.json();
      setMetas(prev => [novaMeta, ...prev]);
      await carregarDados(); // Recarrega o resumo
    }
  };

  const movimentarPoupanca = async (metaId: number, movimentacao: NovaMovimentacaoPoupanca) => {
    const response = await fetch(`/api/metas/${metaId}/movimentacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movimentacao)
    });

    if (response.ok) {
      await carregarDados(); // Recarrega todos os dados
    }
  };

  const quitarDivida = async (dividaId: number) => {
    const response = await fetch(`/api/dividas/${dividaId}/quitar`, {
      method: 'PUT'
    });

    if (response.ok) {
      setDividas(prev => prev.map(divida => 
        divida.id === dividaId 
          ? { ...divida, status: 'quitada' as const, valor_atual: 0 }
          : divida
      ));
      await carregarDados(); // Recarrega o resumo
    }
  };

  const excluirReceita = async (receitaId: number) => {
    const response = await fetch(`/api/receitas/${receitaId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setReceitas(prev => prev.filter(receita => receita.id !== receitaId));
      await carregarDados(); // Recarrega o resumo
    }
  };

  const excluirDespesa = async (despesaId: number) => {
    const response = await fetch(`/api/despesas/${despesaId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setDespesas(prev => prev.filter(despesa => despesa.id !== despesaId));
      await carregarDados(); // Recarrega o resumo
    }
  };

  const excluirDivida = async (dividaId: number) => {
    const response = await fetch(`/api/dividas/${dividaId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setDividas(prev => prev.filter(divida => divida.id !== dividaId));
      await carregarDados(); // Recarrega o resumo
    }
  };

  const excluirMeta = async (metaId: number) => {
    const response = await fetch(`/api/metas/${metaId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setMetas(prev => prev.filter(meta => meta.id !== metaId));
      await carregarDados(); // Recarrega o resumo
    }
  };

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const value: FinanceContextValue = {
    resumo,
    receitas,
    despesas,
    dividas,
    metas,
    categorias,
    loading,
    carregarDados,
    adicionarReceita,
    adicionarDespesa,
    adicionarDivida,
    adicionarMeta,
    movimentarPoupanca,
    quitarDivida,
    excluirReceita,
    excluirDespesa,
    excluirDivida,
    excluirMeta,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}
