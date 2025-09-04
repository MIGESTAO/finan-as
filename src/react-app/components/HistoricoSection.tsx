import { useState, useMemo } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { History, Search, Filter, Calendar, TrendingUp, TrendingDown, Target, CreditCard } from 'lucide-react';

type TipoTransacao = 'todas' | 'receitas' | 'despesas' | 'dividas' | 'metas';
type Transacao = {
  id: number;
  tipo: TipoTransacao;
  descricao: string;
  valor: number;
  data: string;
  categoria?: string;
  cor?: string;
  icone: any;
};

export default function HistoricoSection() {
  const { receitas, despesas, dividas, metas } = useFinance();
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao>('todas');
  const [filtroData, setFiltroData] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-MZ');
  };

  const transacoes = useMemo(() => {
    const todasTransacoes: Transacao[] = [
      ...receitas.map(receita => ({
        id: receita.id,
        tipo: 'receitas' as TipoTransacao,
        descricao: receita.descricao,
        valor: receita.valor,
        data: receita.data_receita,
        categoria: receita.fonte || 'Receita',
        cor: '#10B981',
        icone: TrendingUp
      })),
      ...despesas.map(despesa => ({
        id: despesa.id,
        tipo: 'despesas' as TipoTransacao,
        descricao: despesa.descricao,
        valor: -despesa.valor,
        data: despesa.data_despesa,
        categoria: (despesa as any).categoria_nome || 'Despesa',
        cor: '#EF4444',
        icone: TrendingDown
      })),
      ...dividas.map(divida => ({
        id: divida.id,
        tipo: 'dividas' as TipoTransacao,
        descricao: `Dívida: ${divida.descricao}`,
        valor: -divida.valor_atual,
        data: divida.created_at.split('T')[0],
        categoria: divida.credor,
        cor: '#8B5CF6',
        icone: CreditCard
      })),
      ...metas.map(meta => ({
        id: meta.id,
        tipo: 'metas' as TipoTransacao,
        descricao: `Meta: ${meta.nome}`,
        valor: meta.valor_atual,
        data: meta.created_at.split('T')[0],
        categoria: 'Poupança',
        cor: '#F59E0B',
        icone: Target
      }))
    ];

    // Filtrar por tipo
    let filtradas = todasTransacoes;
    if (filtroTipo !== 'todas') {
      filtradas = filtradas.filter(t => t.tipo === filtroTipo);
    }

    // Filtrar por data
    if (filtroData) {
      const dataFiltro = new Date(filtroData);
      filtradas = filtradas.filter(t => {
        const dataTransacao = new Date(t.data);
        return dataTransacao.getMonth() === dataFiltro.getMonth() &&
               dataTransacao.getFullYear() === dataFiltro.getFullYear();
      });
    }

    // Filtrar por busca
    if (busca) {
      filtradas = filtradas.filter(t => 
        t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        t.categoria?.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Ordenar por data (mais recente primeiro)
    return filtradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [receitas, despesas, dividas, metas, filtroTipo, filtroData, busca]);

  const transacoesPaginadas = transacoes.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  const totalPaginas = Math.ceil(transacoes.length / itensPorPagina);

  const resumoTransacoes = useMemo(() => {
    return transacoes.reduce((acc, transacao) => {
      if (transacao.valor > 0) {
        acc.totalEntradas += transacao.valor;
      } else {
        acc.totalSaidas += Math.abs(transacao.valor);
      }
      acc.saldo = acc.totalEntradas - acc.totalSaidas;
      return acc;
    }, { totalEntradas: 0, totalSaidas: 0, saldo: 0 });
  }, [transacoes]);

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <History className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Histórico de Transações
              </h2>
              <p className="text-sm text-gray-500 mt-1">Visualize todas as suas movimentações</p>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-2xl p-4">
            <div className="text-sm text-green-600 font-medium">Total de Entradas</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(resumoTransacoes.totalEntradas)}</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="text-sm text-red-600 font-medium">Total de Saídas</div>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(resumoTransacoes.totalSaidas)}</div>
          </div>
          <div className={`rounded-2xl p-4 ${resumoTransacoes.saldo >= 0 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
            <div className={`text-sm font-medium ${resumoTransacoes.saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>Saldo</div>
            <div className={`text-2xl font-bold ${resumoTransacoes.saldo >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
              {formatCurrency(resumoTransacoes.saldo)}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoTransacao)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todas">Todas as transações</option>
                <option value="receitas">Receitas</option>
                <option value="despesas">Despesas</option>
                <option value="dividas">Dívidas</option>
                <option value="metas">Metas</option>
              </select>
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="month"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="space-y-3">
          {transacoesPaginadas.length === 0 ? (
            <div className="text-center py-12 bg-white/40 rounded-2xl">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-500">Tente ajustar os filtros ou adicionar novas transações</p>
            </div>
          ) : (
            transacoesPaginadas.map((transacao) => {
              const IconeTransacao = transacao.icone;
              return (
                <div key={`${transacao.tipo}-${transacao.id}`} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${transacao.cor}20` }}
                      >
                        <IconeTransacao className="w-6 h-6" style={{ color: transacao.cor }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{transacao.descricao}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{transacao.categoria}</span>
                          <span>•</span>
                          <span>{formatDate(transacao.data)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${transacao.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.valor >= 0 ? '+' : ''}{formatCurrency(transacao.valor)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setPagina(Math.max(1, pagina - 1))}
              disabled={pagina === 1}
              className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>
            
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => (
              <button
                key={numeroPagina}
                onClick={() => setPagina(numeroPagina)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  pagina === numeroPagina 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                {numeroPagina}
              </button>
            ))}
            
            <button
              onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
              disabled={pagina === totalPaginas}
              className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
