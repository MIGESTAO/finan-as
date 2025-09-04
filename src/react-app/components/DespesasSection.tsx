import { useState } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Plus, TrendingDown, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import type { NovaDespesa } from '@/shared/types';

export default function DespesasSection() {
  const { despesas, categorias, adicionarDespesa, excluirDespesa } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const novaDespesa: NovaDespesa = {
      descricao: formData.get('descricao') as string,
      valor: parseFloat(formData.get('valor') as string),
      data_despesa: formData.get('data_despesa') as string,
      categoria_id: parseInt(formData.get('categoria_id') as string) || undefined,
      tipo: (formData.get('tipo') as 'unica' | 'recorrente') || 'unica',
    };

    try {
      await adicionarDespesa(novaDespesa);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
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

  const despesasRecentes = despesas.slice(0, 5);

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Despesas
              </h2>
              <p className="text-sm text-gray-500 mt-1">Controle seus gastos mensais</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group/btn relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 via-red-600 to-red-700 text-white font-medium rounded-2xl hover:from-orange-700 hover:via-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Nova Despesa</span>
          </button>
        </div>

        <div className="space-y-4">
          {despesasRecentes.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">Nenhuma despesa registrada ainda</p>
              <p className="text-sm text-gray-500">Adicione sua primeira despesa para começar o controle!</p>
            </div>
          ) : (
            despesasRecentes.map((despesa) => (
              <div key={despesa.id} className="group/item relative bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/80 transition-all duration-300 border border-white/40 hover:border-orange-200/50 hover:shadow-lg">
                {/* Item gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">{despesa.descricao}</h3>
                      {(despesa as any).categoria_nome && (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                          style={{ backgroundColor: (despesa as any).categoria_cor }}
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {(despesa as any).categoria_nome}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                        despesa.tipo === 'recorrente' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                      }`}>
                        {despesa.tipo === 'recorrente' ? '🔄 Recorrente' : '📝 Única'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{formatDate(despesa.data_despesa)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        {formatCurrency(despesa.valor)}
                      </div>
                      <div className="flex items-center text-xs text-red-600 font-medium">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Saída
                      </div>
                    </div>
                    <button
                      onClick={() => excluirDespesa(despesa.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {despesas.length > 5 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-white/60 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
              Mostrando {despesasRecentes.length} de {despesas.length} despesas
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="💸 Nova Despesa"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              required
              placeholder="Ex: Supermercado, Combustível, Academia..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Valor (MT)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-600 font-bold">
                MT
              </div>
              <input
                type="number"
                name="valor"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Data
            </label>
            <input
              type="date"
              name="data_despesa"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Categoria
            </label>
            <select
              name="categoria_id"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <option value="">🏷️ Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tipo
            </label>
            <select
              name="tipo"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <option value="unica">📝 Única</option>
              <option value="recorrente">🔄 Recorrente</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? '💫 Salvando...' : '💸 Salvar Despesa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
