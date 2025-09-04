import { useState, useEffect } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Bell, AlertTriangle, CheckCircle, Clock, X, Settings } from 'lucide-react';
import Modal from './Modal';

interface Notificacao {
  id: string;
  tipo: 'alerta' | 'sucesso' | 'lembrete';
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
  acao?: () => void;
}

export default function NotificacoesSection() {
  const { dividas, despesas, categorias, metas } = useFinance();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    vencimentoDividas: true,
    limiteOrcamento: true,
    metasConcluidas: true,
    lembretesPagamento: true
  });

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const gerarNotificacoes = () => {
    const novas: Notificacao[] = [];
    const hoje = new Date();
    
    // Verificar vencimentos de dívidas
    if (configuracoes.vencimentoDividas) {
      dividas.forEach(divida => {
        if (divida.status === 'aberta' && divida.data_vencimento) {
          const vencimento = new Date(divida.data_vencimento);
          const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDias <= 0) {
            novas.push({
              id: `divida-vencida-${divida.id}`,
              tipo: 'alerta',
              titulo: '🚨 Dívida Vencida',
              mensagem: `A dívida "${divida.descricao}" de ${formatCurrency(divida.valor_atual)} está vencida!`,
              data: hoje,
              lida: false
            });
          } else if (diffDias <= 3) {
            novas.push({
              id: `divida-vencendo-${divida.id}`,
              tipo: 'lembrete',
              titulo: '⏰ Dívida Vencendo',
              mensagem: `A dívida "${divida.descricao}" vence em ${diffDias} dia(s)`,
              data: hoje,
              lida: false
            });
          }
        }
      });
    }

    // Verificar limites de orçamento
    if (configuracoes.limiteOrcamento) {
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      categorias.forEach(categoria => {
        if (categoria.limite_mensal > 0) {
          const gastoMensal = despesas
            .filter(despesa => {
              const dataDespesa = new Date(despesa.data_despesa);
              return despesa.categoria_id === categoria.id &&
                     dataDespesa.getMonth() === mesAtual &&
                     dataDespesa.getFullYear() === anoAtual;
            })
            .reduce((total, despesa) => total + despesa.valor, 0);

          const porcentagem = (gastoMensal / categoria.limite_mensal) * 100;

          if (porcentagem >= 100) {
            novas.push({
              id: `orcamento-excedido-${categoria.id}`,
              tipo: 'alerta',
              titulo: '🔥 Orçamento Excedido',
              mensagem: `Você ultrapassou o limite da categoria "${categoria.nome}" em ${formatCurrency(gastoMensal - categoria.limite_mensal)}`,
              data: hoje,
              lida: false
            });
          } else if (porcentagem >= 80) {
            novas.push({
              id: `orcamento-proximo-${categoria.id}`,
              tipo: 'lembrete',
              titulo: '⚠️ Limite Próximo',
              mensagem: `Você já gastou ${porcentagem.toFixed(0)}% do orçamento da categoria "${categoria.nome}"`,
              data: hoje,
              lida: false
            });
          }
        }
      });
    }

    // Verificar metas concluídas
    if (configuracoes.metasConcluidas) {
      metas.forEach(meta => {
        if (meta.status === 'ativa') {
          const progresso = (meta.valor_atual / meta.valor_alvo) * 100;
          
          if (progresso >= 100) {
            novas.push({
              id: `meta-concluida-${meta.id}`,
              tipo: 'sucesso',
              titulo: '🎉 Meta Alcançada!',
              mensagem: `Parabéns! Você conquistou a meta "${meta.nome}" de ${formatCurrency(meta.valor_alvo)}`,
              data: hoje,
              lida: false
            });
          } else if (progresso >= 75) {
            novas.push({
              id: `meta-progresso-${meta.id}`,
              tipo: 'lembrete',
              titulo: '📈 Meta Quase Alcançada',
              mensagem: `Você está a ${(100 - progresso).toFixed(0)}% de completar a meta "${meta.nome}"`,
              data: hoje,
              lida: false
            });
          }
        }
      });
    }

    return novas;
  };

  useEffect(() => {
    const novasNotificacoes = gerarNotificacoes();
    setNotificacoes(prev => {
      const existentes = prev.filter(n => n.lida);
      const naoLidas = novasNotificacoes.filter(nova => 
        !prev.some(existente => existente.id === nova.id)
      );
      return [...existentes, ...naoLidas];
    });
  }, [dividas, despesas, categorias, metas, configuracoes]);

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ));
  };

  const removerNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const limparTodas = () => {
    setNotificacoes([]);
  };

  const notificacaoesNaoLidas = notificacoes.filter(n => !n.lida);
  const notificacoesRecentes = notificacoes.slice(0, 5);

  const getIconeNotificacao = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'alerta': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'sucesso': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'lembrete': return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getCorNotificacao = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'alerta': return 'from-red-50 to-red-100 border-red-200';
      case 'sucesso': return 'from-green-50 to-green-100 border-green-200';
      case 'lembrete': return 'from-yellow-50 to-yellow-100 border-yellow-200';
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-yellow-500/5 to-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              {notificacaoesNaoLidas.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{notificacaoesNaoLidas.length}</span>
                </div>
              )}
              <div className="absolute -inset-1 bg-gradient-to-br from-red-500/20 to-yellow-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Notificações e Alertas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {notificacaoesNaoLidas.length > 0 
                  ? `${notificacaoesNaoLidas.length} notificação(ões) não lida(s)`
                  : 'Tudo em dia!'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </button>
            {notificacoes.length > 0 && (
              <button
                onClick={limparTodas}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                Limpar Todas
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {notificacoesRecentes.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
              <p className="text-lg font-medium text-green-600 mb-2">Tudo tranquilo!</p>
              <p className="text-sm text-gray-500">Não há notificações ou alertas no momento</p>
            </div>
          ) : (
            notificacoesRecentes.map((notificacao) => (
              <div key={notificacao.id} className={`group/item relative bg-gradient-to-r ${getCorNotificacao(notificacao.tipo)} backdrop-blur-sm rounded-2xl p-5 border transition-all duration-300 ${!notificacao.lida ? 'shadow-lg' : 'opacity-70'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getIconeNotificacao(notificacao.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-gray-800">{notificacao.titulo}</h3>
                        {!notificacao.lida && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{notificacao.mensagem}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{notificacao.data.toLocaleString('pt-MZ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notificacao.lida && (
                      <button
                        onClick={() => marcarComoLida(notificacao.id)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        title="Marcar como lida"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removerNotificacao(notificacao.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      title="Remover"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notificacoes.length > 5 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-white/60 rounded-full px-4 py-2 inline-block backdrop-blur-sm">
              Mostrando {notificacoesRecentes.length} de {notificacoes.length} notificações
            </p>
          </div>
        )}
      </div>

      {/* Modal de Configurações */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="⚙️ Configurações de Notificações"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-800">Vencimento de Dívidas</h4>
                <p className="text-sm text-gray-500">Alertas sobre dívidas próximas do vencimento</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracoes.vencimentoDividas}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, vencimentoDividas: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-800">Limite de Orçamento</h4>
                <p className="text-sm text-gray-500">Avisos quando se aproximar dos limites</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracoes.limiteOrcamento}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, limiteOrcamento: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-800">Metas Concluídas</h4>
                <p className="text-sm text-gray-500">Comemorações quando alcançar suas metas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracoes.metasConcluidas}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, metasConcluidas: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <button
            onClick={() => setShowModal(false)}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            💾 Salvar Configurações
          </button>
        </div>
      </Modal>
    </div>
  );
}
