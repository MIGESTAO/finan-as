import { useState, useMemo } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function ProjecoesSection() {
  const { receitas, despesas, metas } = useFinance();
  const [periodoProjecao, setPeriodoProjecao] = useState(12);
  const [cenario, setCenario] = useState<'conservador' | 'realista' | 'otimista'>('realista');

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const calcularMedias = () => {
    const hoje = new Date();
    const tresUltimosMeses = [];
    
    for (let i = 0; i < 3; i++) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      tresUltimosMeses.push(mes);
    }

    const medias = tresUltimosMeses.map(mes => {
      const receitasMes = receitas
        .filter(r => {
          const dataReceita = new Date(r.data_receita);
          return dataReceita.getMonth() === mes.getMonth() && 
                 dataReceita.getFullYear() === mes.getFullYear();
        })
        .reduce((total, r) => total + r.valor, 0);

      const despesasMes = despesas
        .filter(d => {
          const dataDespesa = new Date(d.data_despesa);
          return dataDespesa.getMonth() === mes.getMonth() && 
                 dataDespesa.getFullYear() === mes.getFullYear();
        })
        .reduce((total, d) => total + d.valor, 0);

      return { receitas: receitasMes, despesas: despesasMes };
    });

    const mediaReceitas = medias.reduce((acc, m) => acc + m.receitas, 0) / medias.length;
    const mediaDespesas = medias.reduce((acc, m) => acc + m.despesas, 0) / medias.length;

    return { mediaReceitas, mediaDespesas };
  };

  const projecoesFuturas = useMemo(() => {
    const { mediaReceitas, mediaDespesas } = calcularMedias();
    const hoje = new Date();
    const projecoes = [];

    // Fatores de ajuste por cenário
    const fatores = {
      conservador: { receitas: 0.9, despesas: 1.1 },
      realista: { receitas: 1.0, despesas: 1.0 },
      otimista: { receitas: 1.1, despesas: 0.9 }
    };

    let saldoAcumulado = 0;

    for (let i = 1; i <= periodoProjecao; i++) {
      const mesProjecao = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const receitasProjetadas = mediaReceitas * fatores[cenario].receitas;
      const despesasProjetadas = mediaDespesas * fatores[cenario].despesas;
      const saldoMes = receitasProjetadas - despesasProjetadas;
      
      saldoAcumulado += saldoMes;

      projecoes.push({
        mes: mesProjecao.toLocaleDateString('pt-MZ', { month: 'short', year: 'numeric' }),
        receitas: receitasProjetadas,
        despesas: despesasProjetadas,
        saldo: saldoMes,
        saldoAcumulado: saldoAcumulado,
        mesNumero: i
      });
    }

    return projecoes;
  }, [receitas, despesas, periodoProjecao, cenario]);

  const projecaoMetas = useMemo(() => {
    const { mediaReceitas, mediaDespesas } = calcularMedias();
    const saldoMedioMensal = (mediaReceitas - mediaDespesas) * 0.2; // 20% para poupança
    
    return metas
      .filter(meta => meta.status === 'ativa')
      .map(meta => {
        const valorRestante = meta.valor_alvo - meta.valor_atual;
        const mesesParaConclusao = saldoMedioMensal > 0 ? Math.ceil(valorRestante / saldoMedioMensal) : null;
        
        return {
          ...meta,
          mesesParaConclusao,
          dataEstimada: mesesParaConclusao ? 
            new Date(Date.now() + mesesParaConclusao * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-MZ') :
            'Indefinido'
        };
      });
  }, [metas, receitas, despesas]);

  const alertas = useMemo(() => {
    const alertasProjecao = [];
    
    // Verificar se há meses com saldo negativo
    const mesesNegativos = projecoesFuturas.filter(p => p.saldo < 0);
    if (mesesNegativos.length > 0) {
      alertasProjecao.push({
        tipo: 'alerta',
        titulo: 'Saldos Negativos Previstos',
        mensagem: `${mesesNegativos.length} mês(es) com saldo negativo identificado(s)`
      });
    }

    // Verificar tendência do saldo acumulado
    const ultimaProjecao = projecoesFuturas[projecoesFuturas.length - 1];
    if (ultimaProjecao && ultimaProjecao.saldoAcumulado < 0) {
      alertasProjecao.push({
        tipo: 'alerta',
        titulo: 'Tendência Negativa',
        mensagem: 'Saldo acumulado negativo ao final do período'
      });
    }

    return alertasProjecao;
  }, [projecoesFuturas]);

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Projeções Financeiras
              </h2>
              <p className="text-sm text-gray-500 mt-1">Visualize o futuro das suas finanças</p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Período de Projeção
            </label>
            <select
              value={periodoProjecao}
              onChange={(e) => setPeriodoProjecao(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80"
            >
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
              <option value={24}>24 meses</option>
              <option value={36}>36 meses</option>
            </select>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cenário
            </label>
            <select
              value={cenario}
              onChange={(e) => setCenario(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80"
            >
              <option value="conservador">📉 Conservador</option>
              <option value="realista">📊 Realista</option>
              <option value="otimista">📈 Otimista</option>
            </select>
          </div>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="mb-8 space-y-3">
            {alertas.map((alerta, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">{alerta.titulo}</h4>
                  <p className="text-sm text-red-600">{alerta.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico de Projeções */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Evolução Projetada</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={projecoesFuturas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="receitas" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Receitas Projetadas"
              />
              <Area 
                type="monotone" 
                dataKey="despesas" 
                stackId="2"
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.6}
                name="Despesas Projetadas"
              />
              <Line 
                type="monotone" 
                dataKey="saldoAcumulado" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Saldo Acumulado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projeção de Metas */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Projeção para Metas</h3>
          {projecaoMetas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma meta ativa para projetar</p>
          ) : (
            <div className="space-y-4">
              {projecaoMetas.map((meta) => (
                <div key={meta.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-800">{meta.nome}</h4>
                    <p className="text-sm text-gray-600">
                      Faltam {formatCurrency(meta.valor_alvo - meta.valor_atual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {meta.mesesParaConclusao ? `${meta.mesesParaConclusao} meses` : 'Indefinido'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {meta.dataEstimada}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo das Projeções */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Receitas Médias Projetadas</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(projecoesFuturas.length > 0 ? projecoesFuturas[0].receitas : 0)}
            </div>
          </div>
          
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium">Despesas Médias Projetadas</div>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(projecoesFuturas.length > 0 ? projecoesFuturas[0].despesas : 0)}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Saldo Final Projetado</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(projecoesFuturas.length > 0 ? projecoesFuturas[projecoesFuturas.length - 1].saldoAcumulado : 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
