import { useState, useEffect } from 'react';
import { Bell, Plus, Edit3, Trash2, Calendar, Clock, CheckCircle } from 'lucide-react';
import Modal from './Modal';

interface Lembrete {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  tipo: 'pagamento' | 'receita' | 'meta' | 'geral';
  recorrente: boolean;
  ativo: boolean;
  criado_em: Date;
}

export default function LembretesSection() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Lembrete | null>(null);
  const [loading, setLoading] = useState(false);

  const tiposLembrete = [
    { value: 'pagamento', label: '💳 Pagamento', cor: 'bg-red-100 text-red-700' },
    { value: 'receita', label: '💰 Receita', cor: 'bg-green-100 text-green-700' },
    { value: 'meta', label: '🎯 Meta', cor: 'bg-blue-100 text-blue-700' },
    { value: 'geral', label: '📝 Geral', cor: 'bg-gray-100 text-gray-700' }
  ];

  useEffect(() => {
    // Carregar lembretes do localStorage
    const lembretesStorage = localStorage.getItem('micten-lembretes');
    if (lembretesStorage) {
      const parsed = JSON.parse(lembretesStorage);
      setLembretes(parsed.map((l: any) => ({
        ...l,
        criado_em: new Date(l.criado_em)
      })));
    }
  }, []);

  const salvarLembretes = (novosLembretes: Lembrete[]) => {
    setLembretes(novosLembretes);
    localStorage.setItem('micten-lembretes', JSON.stringify(novosLembretes));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const novoLembrete: Lembrete = {
      id: editando?.id || `lembrete-${Date.now()}`,
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      data: formData.get('data') as string,
      hora: formData.get('hora') as string,
      tipo: formData.get('tipo') as any,
      recorrente: formData.get('recorrente') === 'on',
      ativo: true,
      criado_em: editando?.criado_em || new Date()
    };

    try {
      if (editando) {
        // Editar lembrete existente
        const novosLembretes = lembretes.map(l => 
          l.id === editando.id ? novoLembrete : l
        );
        salvarLembretes(novosLembretes);
      } else {
        // Adicionar novo lembrete
        salvarLembretes([...lembretes, novoLembrete]);
      }

      setShowModal(false);
      setEditando(null);
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
    } finally {
      setLoading(false);
    }
  };

  const excluirLembrete = (id: string) => {
    const novosLembretes = lembretes.filter(l => l.id !== id);
    salvarLembretes(novosLembretes);
  };

  const alternarStatus = (id: string) => {
    const novosLembretes = lembretes.map(l => 
      l.id === id ? { ...l, ativo: !l.ativo } : l
    );
    salvarLembretes(novosLembretes);
  };

  const getTipoInfo = (tipo: string) => {
    return tiposLembrete.find(t => t.value === tipo) || tiposLembrete[3];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-MZ');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const isVencimentoProximo = (data: string, hora: string) => {
    const agora = new Date();
    const dataLembrete = new Date(`${data}T${hora}`);
    const diffHoras = (dataLembrete.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diffHoras <= 24 && diffHoras >= 0;
  };

  const isVencido = (data: string, hora: string) => {
    const agora = new Date();
    const dataLembrete = new Date(`${data}T${hora}`);
    return dataLembrete < agora;
  };

  const lembretesAtivos = lembretes.filter(l => l.ativo);
  const lembretesOrdenados = lembretesAtivos.sort((a, b) => {
    const dataA = new Date(`${a.data}T${a.hora}`);
    const dataB = new Date(`${b.data}T${b.hora}`);
    return dataA.getTime() - dataB.getTime();
  });

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              {lembretesAtivos.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{lembretesAtivos.length}</span>
                </div>
              )}
              <div className="absolute -inset-1 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Lembretes Personalizados
              </h2>
              <p className="text-sm text-gray-500 mt-1">Nunca mais esqueça de nada importante</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group/btn relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-700 text-white font-medium rounded-2xl hover:from-yellow-700 hover:via-orange-700 hover:to-yellow-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Novo Lembrete</span>
          </button>
        </div>

        <div className="space-y-4">
          {lembretesOrdenados.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">Nenhum lembrete criado ainda</p>
              <p className="text-sm text-gray-500">Crie lembretes para não esquecer de pagamentos, metas e mais!</p>
            </div>
          ) : (
            lembretesOrdenados.slice(0, 8).map((lembrete) => {
              const tipoInfo = getTipoInfo(lembrete.tipo);
              const isProximo = isVencimentoProximo(lembrete.data, lembrete.hora);
              const isOverdue = isVencido(lembrete.data, lembrete.hora);
              
              return (
                <div key={lembrete.id} className={`group/item relative backdrop-blur-sm rounded-2xl p-5 transition-all duration-300 border hover:shadow-lg ${
                  isOverdue ? 'bg-red-50 border-red-200' :
                  isProximo ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white/60 border-white/40 hover:bg-white/80'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-gray-800 text-lg">{lembrete.titulo}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoInfo.cor}`}>
                          {tipoInfo.label}
                        </span>
                        {lembrete.recorrente && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            🔄 Recorrente
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                            VENCIDO
                          </span>
                        )}
                        {isProximo && !isOverdue && (
                          <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                            EM BREVE
                          </span>
                        )}
                      </div>
                      {lembrete.descricao && (
                        <p className="text-sm text-gray-600 mb-3">{lembrete.descricao}</p>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{formatDate(lembrete.data)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{formatTime(lembrete.hora)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => alternarStatus(lembrete.id)}
                        className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                          lembrete.ativo 
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                        title={lembrete.ativo ? 'Desativar' : 'Ativar'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditando(lembrete);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirLembrete(lembrete.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {lembretesOrdenados.length > 8 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-white/60 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
              Mostrando 8 de {lembretesOrdenados.length} lembretes ativos
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditando(null);
        }}
        title={editando ? "✏️ Editar Lembrete" : "🔔 Novo Lembrete"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              required
              defaultValue={editando?.titulo}
              placeholder="Ex: Pagar conta de luz, Receber salário..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Descrição (opcional)
            </label>
            <textarea
              name="descricao"
              rows={3}
              defaultValue={editando?.descricao}
              placeholder="Detalhes adicionais sobre o lembrete..."
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Data
              </label>
              <input
                type="date"
                name="data"
                required
                defaultValue={editando?.data || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Hora
              </label>
              <input
                type="time"
                name="hora"
                required
                defaultValue={editando?.hora || '09:00'}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tipo
            </label>
            <select
              name="tipo"
              defaultValue={editando?.tipo || 'geral'}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              {tiposLembrete.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="recorrente"
              id="recorrente"
              defaultChecked={editando?.recorrente}
              className="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label htmlFor="recorrente" className="text-sm font-medium text-gray-700">
              Lembrete recorrente (repetir mensalmente)
            </label>
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
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-2xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? '💫 Salvando...' : (editando ? '✏️ Atualizar' : '🔔 Criar Lembrete')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
