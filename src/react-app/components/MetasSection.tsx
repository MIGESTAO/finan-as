import { useState } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Plus, Target, Trash2, Calendar, PiggyBank, TrendingUp, Star } from 'lucide-react';
import Modal from './Modal';
import type { NovaMetaPoupanca, NovaMovimentacaoPoupanca } from '@/shared/types';

export default function MetasSection() {
  const { metas, adicionarMeta, movimentarPoupanca, excluirMeta } = useFinance();
  const [showModalMeta, setShowModalMeta] = useState(false);
  const [showModalMovimentacao, setShowModalMovimentacao] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitMeta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const novaMeta: NovaMetaPoupanca = {
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string || undefined,
      valor_alvo: parseFloat(formData.get('valor_alvo') as string),
      data_meta: formData.get('data_meta') as string || undefined,
      status: 'ativa',
    };

    try {
      await adicionarMeta(novaMeta);
      setShowModalMeta(false);
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMovimentacao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!metaSelecionada) return;
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const movimentacao: NovaMovimentacaoPoupanca = {
      meta_id: metaSelecionada,
      tipo: formData.get('tipo') as 'deposito' | 'saque',
      valor: parseFloat(formData.get('valor') as string),
      motivo: formData.get('motivo') as string || undefined,
      data_movimentacao: formData.get('data_movimentacao') as string,
    };

    try {
      await movimentarPoupanca(metaSelecionada, movimentacao);
      setShowModalMovimentacao(false);
      setMetaSelecionada(null);
    } catch (error) {
      console.error('Erro ao movimentar poupança:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularProgresso = (valorAtual: number, valorAlvo: number) => {
    return Math.min((valorAtual / valorAlvo) * 100, 100);
  };

  const metasAtivas = metas.filter(meta => meta.status === 'ativa');
  const metasRecentes = metasAtivas.slice(0, 4);

  const abrirMovimentacao = (metaId: number) => {
    setMetaSelecionada(metaId);
    setShowModalMovimentacao(true);
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/20 to-rose-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Metas de Poupança
              </h2>
              <p className="text-sm text-gray-500 mt-1">Alcance seus objetivos financeiros</p>
            </div>
          </div>
          <button
            onClick={() => setShowModalMeta(true)}
            className="group/btn relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white font-medium rounded-2xl hover:from-pink-700 hover:via-rose-700 hover:to-pink-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Nova Meta</span>
          </button>
        </div>

        <div className="space-y-6">
          {metasRecentes.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">Nenhuma meta de poupança criada</p>
              <p className="text-sm text-gray-500">Defina seus objetivos financeiros e comece a poupar!</p>
            </div>
          ) : (
            metasRecentes.map((meta) => {
              const progresso = calcularProgresso(meta.valor_atual, meta.valor_alvo);
              const isCompleta = progresso >= 100;
              
              return (
                <div key={meta.id} className="group/item relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 border border-white/40 hover:border-pink-200/50 hover:shadow-lg">
                  {/* Item gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  
                  {/* Completion celebration */}
                  {isCompleta && (
                    <div className="absolute -top-2 -right-2 animate-bounce">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">{meta.nome}</h3>
                          {isCompleta && (
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                              🎉 Concluída!
                            </span>
                          )}
                        </div>
                        {meta.descricao && (
                          <p className="text-sm text-gray-600 mb-3">{meta.descricao}</p>
                        )}
                        {meta.data_meta && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Meta: {formatDate(meta.data_meta)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => abrirMovimentacao(meta.id)}
                          className="p-3 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-2xl transition-all duration-200 hover:scale-110"
                          title="Movimentar"
                        >
                          <PiggyBank className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => excluirMeta(meta.id)}
                          className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all duration-200 hover:scale-110"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Valores */}
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                            {formatCurrency(meta.valor_atual)}
                          </div>
                          <div className="text-sm text-gray-500">
                            de {formatCurrency(meta.valor_alvo)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm font-bold text-pink-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>{progresso.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Restam {formatCurrency(meta.valor_alvo - meta.valor_atual)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              isCompleta 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-glow' 
                                : 'bg-gradient-to-r from-pink-500 to-rose-600'
                            }`}
                            style={{ width: `${Math.min(progresso, 100)}%` }}
                          />
                        </div>
                        {/* Progress indicators */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs font-bold text-white drop-shadow-lg">
                            {progresso >= 20 && `${progresso.toFixed(0)}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {metasAtivas.length > 4 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-white/60 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
              Mostrando {metasRecentes.length} de {metasAtivas.length} metas ativas
            </p>
          </div>
        )}
      </div>

      {/* Modal Nova Meta */}
      <Modal
        isOpen={showModalMeta}
        onClose={() => setShowModalMeta(false)}
        title="🎯 Nova Meta de Poupança"
      >
        <form onSubmit={handleSubmitMeta} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nome da Meta
            </label>
            <input
              type="text"
              name="nome"
              required
              placeholder="Ex: Viagem, Carro, Casa..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Descrição (opcional)
            </label>
            <textarea
              name="descricao"
              rows={3}
              placeholder="Descreva mais detalhes sobre sua meta..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Valor Alvo (MT)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-600 font-bold">
                MT
              </div>
              <input
                type="number"
                name="valor_alvo"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Data da Meta (opcional)
            </label>
            <input
              type="date"
              name="data_meta"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => setShowModalMeta(false)}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-2xl hover:from-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? '💫 Salvando...' : '🎯 Criar Meta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Movimentação */}
      <Modal
        isOpen={showModalMovimentacao}
        onClose={() => {
          setShowModalMovimentacao(false);
          setMetaSelecionada(null);
        }}
        title="🐷 Movimentar Poupança"
      >
        <form onSubmit={handleSubmitMovimentacao} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tipo de Movimentação
            </label>
            <select
              name="tipo"
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <option value="deposito">💰 Depósito</option>
              <option value="saque">📤 Saque</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Valor (MT)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-600 font-bold">
                MT
              </div>
              <input
                type="number"
                name="valor"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Data
            </label>
            <input
              type="date"
              name="data_movimentacao"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Motivo (opcional)
            </label>
            <input
              type="text"
              name="motivo"
              placeholder="Ex: Economia mensal, Compra emergencial..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowModalMovimentacao(false);
                setMetaSelecionada(null);
              }}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-2xl hover:from-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? '💫 Salvando...' : '🐷 Confirmar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
