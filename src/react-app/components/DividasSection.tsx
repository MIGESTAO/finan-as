import { useState } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Plus, CreditCard, Trash2, Calendar, CheckCircle, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import Modal from './Modal';
import type { NovaDivida } from '@/shared/types';

export default function DividasSection() {
  const { dividas, adicionarDivida, quitarDivida, excluirDivida } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const novaDivida: NovaDivida = {
      credor: formData.get('credor') as string,
      descricao: formData.get('descricao') as string,
      valor_original: parseFloat(formData.get('valor_original') as string),
      valor_atual: parseFloat(formData.get('valor_original') as string), // Inicialmente igual ao original
      taxa_juros: parseFloat(formData.get('taxa_juros') as string) || 0,
      data_vencimento: formData.get('data_vencimento') as string || undefined,
      status: 'aberta',
    };

    try {
      await adicionarDivida(novaDivida);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
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

  const isVencimentoProximo = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 7 && diffDias >= 0;
  };

  const isVencido = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    return vencimento < hoje;
  };

  const dividasAbertas = dividas.filter(divida => divida.status === 'aberta');
  const dividasRecentes = dividasAbertas.slice(0, 5);

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-violet-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Dívidas
              </h2>
              <p className="text-sm text-gray-500 mt-1">Controle e quite suas dívidas</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group/btn relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white font-medium rounded-2xl hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Nova Dívida</span>
          </button>
        </div>

        <div className="space-y-4">
          {dividasRecentes.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">🎉</span>
                </div>
              </div>
              <p className="text-lg font-medium text-green-600 mb-2">Nenhuma dívida registrada</p>
              <p className="text-sm text-gray-500">Ótimo! Você está livre de dívidas!</p>
            </div>
          ) : (
            dividasRecentes.map((divida) => (
              <div key={divida.id} className="group/item relative bg-white/60 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/80 transition-all duration-300 border border-white/40 hover:border-purple-200/50 hover:shadow-lg">
                {/* Item gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">{divida.descricao}</h3>
                      {divida.data_vencimento && isVencido(divida.data_vencimento) && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span className="text-xs font-medium text-red-600">Vencida</span>
                        </div>
                      )}
                      {divida.data_vencimento && isVencimentoProximo(divida.data_vencimento) && !isVencido(divida.data_vencimento) && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 rounded-full">
                          <Clock className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-600">Vence em breve</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-purple-600">{divida.credor}</span>
                      </div>
                      {divida.data_vencimento && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`font-medium ${
                            isVencido(divida.data_vencimento) ? 'text-red-600' :
                            isVencimentoProximo(divida.data_vencimento) ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {formatDate(divida.data_vencimento)}
                          </span>
                        </div>
                      )}
                      {divida.taxa_juros > 0 && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">
                          {divida.taxa_juros}% a.m.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(divida.valor_atual)}
                      </div>
                      {divida.valor_atual !== divida.valor_original && (
                        <div className="text-xs text-gray-500">
                          Original: {formatCurrency(divida.valor_original)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => quitarDivida(divida.id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Quitar dívida"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => excluirDivida(divida.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Excluir dívida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {dividasAbertas.length > 5 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-white/60 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
              Mostrando {dividasRecentes.length} de {dividasAbertas.length} dívidas abertas
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="💳 Nova Dívida"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Credor
            </label>
            <input
              type="text"
              name="credor"
              required
              placeholder="Ex: Banco, Cartão de Crédito, João..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Descrição
            </label>
            <input
              type="text"
              name="descricao"
              required
              placeholder="Ex: Empréstimo pessoal, Fatura cartão..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Valor Original (MT)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-600 font-bold">
                MT
              </div>
              <input
                type="number"
                name="valor_original"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Taxa de Juros (% ao mês)
            </label>
            <input
              type="number"
              name="taxa_juros"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Data de Vencimento (opcional)
            </label>
            <input
              type="date"
              name="data_vencimento"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
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
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-2xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? '💫 Salvando...' : '💳 Salvar Dívida'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
