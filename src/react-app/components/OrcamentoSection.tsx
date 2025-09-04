import { useState, useEffect } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Target, Plus, Edit3, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from './Modal';

interface OrcamentoCategoria {
  categoria_id: number;
  categoria_nome: string;
  limite: number;
  gasto: number;
  cor: string;
}

export default function OrcamentoSection() {
  const { categorias, despesas } = useFinance();
  const [orcamentos, setOrcamentos] = useState<OrcamentoCategoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  useEffect(() => {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const orcamentosAtualizados = categorias.map(categoria => {
      const gastoMensal = despesas
        .filter(despesa => {
          const dataDespesa = new Date(despesa.data_despesa);
          return despesa.categoria_id === categoria.id &&
                 dataDespesa.getMonth() === mesAtual &&
                 dataDespesa.getFullYear() === anoAtual;
        })
        .reduce((total, despesa) => total + despesa.valor, 0);

      return {
        categoria_id: categoria.id,
        categoria_nome: categoria.nome,
        limite: categoria.limite_mensal || 0,
        gasto: gastoMensal,
        cor: categoria.cor
      };
    });

    setOrcamentos(orcamentosAtualizados);
  }, [categorias, despesas]);

  const handleSalvarLimite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoriaId = parseInt(formData.get('categoria_id') as string);
    const limite = parseFloat(formData.get('limite') as string);

    // Atualizar limite na categoria
    try {
      const response = await fetch(`/api/categorias/${categoriaId}/limite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limite_mensal: limite })
      });

      if (response.ok) {
        setOrcamentos(prev => prev.map(orc => 
          orc.categoria_id === categoriaId 
            ? { ...orc, limite } 
            : orc
        ));
        setShowModal(false);
        setEditando(null);
      }
    } catch (error) {
      console.error('Erro ao salvar limite:', error);
    }
  };

  const calcularPorcentagem = (gasto: number, limite: number) => {
    if (limite === 0) return 0;
    return Math.min((gasto / limite) * 100, 100);
  };

  const getStatusColor = (porcentagem: number) => {
    if (porcentagem >= 100) return 'bg-red-500';
    if (porcentagem >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (porcentagem: number) => {
    if (porcentagem >= 100) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (porcentagem >= 80) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-blue-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Orçamento Mensal
              </h2>
              <p className="text-sm text-gray-500 mt-1">Controle seus limites por categoria</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group/btn relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 via-blue-600 to-green-700 text-white font-medium rounded-2xl hover:from-green-700 hover:via-blue-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Definir Limite</span>
          </button>
        </div>

        <div className="space-y-6">
          {orcamentos.filter(orc => orc.limite > 0).length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">Nenhum limite de orçamento definido</p>
              <p className="text-sm text-gray-500">Defina limites para suas categorias e controle melhor seus gastos!</p>
            </div>
          ) : (
            orcamentos
              .filter(orc => orc.limite > 0)
              .map((orcamento) => {
                const porcentagem = calcularPorcentagem(orcamento.gasto, orcamento.limite);
                
                return (
                  <div key={orcamento.categoria_id} className="group/item relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 border border-white/40 hover:border-green-200/50 hover:shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: orcamento.cor }}
                          />
                          <h3 className="font-bold text-gray-800 text-lg">{orcamento.categoria_nome}</h3>
                          {getStatusIcon(porcentagem)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditando(orcamento.categoria_id);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                              {formatCurrency(orcamento.gasto)}
                            </div>
                            <div className="text-sm text-gray-500">
                              de {formatCurrency(orcamento.limite)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              porcentagem >= 100 ? 'text-red-600' :
                              porcentagem >= 80 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {porcentagem.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {orcamento.limite - orcamento.gasto > 0 
                                ? `Restam ${formatCurrency(orcamento.limite - orcamento.gasto)}`
                                : `Excesso de ${formatCurrency(orcamento.gasto - orcamento.limite)}`
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-1000 ${getStatusColor(porcentagem)}`}
                              style={{ width: `${Math.min(porcentagem, 100)}%` }}
                            />
                          </div>
                          {porcentagem >= 100 && (
                            <div className="absolute -top-8 right-0 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                              LIMITE EXCEDIDO!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        title="🎯 Definir Limite de Orçamento"
      >
        <form onSubmit={handleSalvarLimite} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Categoria
            </label>
            <select
              name="categoria_id"
              required
              defaultValue={editando || ''}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Limite Mensal (MT)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">
                MT
              </div>
              <input
                type="number"
                name="limite"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                defaultValue={editando ? orcamentos.find(o => o.categoria_id === editando)?.limite : ''}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditando(null);
              }}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-2xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🎯 Salvar Limite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
