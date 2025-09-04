import { useMemo } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, Zap, Activity } from 'lucide-react';

export default function MetricasSection() {
  const { receitas, despesas, dividas, metas, categorias } = useFinance();

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const metricas = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const mesPassado = mesAtual === 0 ? 11 : mesAtual - 1;
    const anoMesPassado = mesAtual === 0 ? anoAtual - 1 : anoAtual;

    // Receitas do mês atual e passado
    const receitasMesAtual = receitas.filter(r => {
      const data = new Date(r.data_receita);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).reduce((acc, r) => acc + r.valor, 0);

    const receitasMesPassado = receitas.filter(r => {
      const data = new Date(r.data_receita);
      return data.getMonth() === mesPassado && data.getFullYear() === anoMesPassado;
    }).reduce((acc, r) => acc + r.valor, 0);

    // Despesas do mês atual e passado
    const despesasMesAtual = despesas.filter(d => {
      const data = new Date(d.data_despesa);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).reduce((acc, d) => acc + d.valor, 0);

    const despesasMesPassado = despesas.filter(d => {
      const data = new Date(d.data_despesa);
      return data.getMonth() === mesPassado && data.getFullYear() === anoMesPassado;
    }).reduce((acc, d) => acc + d.valor, 0);

    // Cálculos de crescimento
    const crescimentoReceitas = receitasMesPassado > 0 ? 
      ((receitasMesAtual - receitasMesPassado) / receitasMesPassado) * 100 : 0;
    
    const crescimentoDespesas = despesasMesPassado > 0 ? 
      ((despesasMesAtual - despesasMesPassado) / despesasMesPassado) * 100 : 0;

    // Taxa de poupança
    const taxaPoupanca = receitasMesAtual > 0 ? 
      ((receitasMesAtual - despesasMesAtual) / receitasMesAtual) * 100 : 0;

    // Média de gastos por categoria
    const gastosPorCategoria = categorias.map(cat => {
      const gastos = despesas
        .filter(d => d.categoria_id === cat.id)
        .reduce((acc, d) => acc + d.valor, 0);
      return {
        nome: cat.nome,
        valor: gastos,
        cor: cat.cor,
        limite: cat.limite_mensal,
        utilizacao: cat.limite_mensal > 0 ? (gastos / cat.limite_mensal) * 100 : 0
      };
    }).filter(cat => cat.valor > 0);

    // Progresso das metas
    const progressoMetas = metas
      .filter(m => m.status === 'ativa')
      .map(m => ({
        nome: m.nome,
        progresso: (m.valor_atual / m.valor_alvo) * 100,
        valor_atual: m.valor_atual,
        valor_alvo: m.valor_alvo
      }));

    // Saúde financeira (score de 0 a 100)
    const saldoAtual = receitasMesAtual - despesasMesAtual;
    const dividasAbertas = dividas.filter(d => d.status === 'aberta').reduce((acc, d) => acc + d.valor_atual, 0);
    const razaoDivida = receitasMesAtual > 0 ? (dividasAbertas / receitasMesAtual) : 0;
    
    let saudeFinanceira = 100;
    if (saldoAtual < 0) saudeFinanceira -= 30;
    if (razaoDivida > 0.3) saudeFinanceira -= 25;
    if (taxaPoupanca < 10) saudeFinanceira -= 20;
    if (crescimentoReceitas < 0) saudeFinanceira -= 15;
    if (crescimentoDespesas > 10) saudeFinanceira -= 10;
    
    saudeFinanceira = Math.max(0, saudeFinanceira);

    return {
      receitasMesAtual,
      despesasMesAtual,
      crescimentoReceitas,
      crescimentoDespesas,
      taxaPoupanca,
      saudeFinanceira,
      gastosPorCategoria,
      progressoMetas,
      saldoAtual,
      dividasAbertas,
      razaoDivida: razaoDivida * 100
    };
  }, [receitas, despesas, dividas, metas, categorias]);

  const dadosRadial = [
    { name: 'Saúde Financeira', value: metricas.saudeFinanceira, fill: '#10B981' }
  ];

  const kpis = [
    {
      titulo: 'Crescimento de Receitas',
      valor: formatPercent(metricas.crescimentoReceitas),
      icone: metricas.crescimentoReceitas >= 0 ? TrendingUp : TrendingDown,
      cor: metricas.crescimentoReceitas >= 0 ? 'text-green-600' : 'text-red-600',
      bgCor: metricas.crescimentoReceitas >= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50'
    },
    {
      titulo: 'Taxa de Poupança',
      valor: formatPercent(metricas.taxaPoupanca),
      icone: Target,
      cor: metricas.taxaPoupanca >= 20 ? 'text-blue-600' : metricas.taxaPoupanca >= 10 ? 'text-yellow-600' : 'text-red-600',
      bgCor: metricas.taxaPoupanca >= 20 ? 'from-blue-50 to-cyan-50' : metricas.taxaPoupanca >= 10 ? 'from-yellow-50 to-orange-50' : 'from-red-50 to-pink-50'
    },
    {
      titulo: 'Controle de Despesas',
      valor: formatPercent(-metricas.crescimentoDespesas),
      icone: Activity,
      cor: metricas.crescimentoDespesas <= 0 ? 'text-green-600' : 'text-red-600',
      bgCor: metricas.crescimentoDespesas <= 0 ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50'
    },
    {
      titulo: 'Razão Dívida/Renda',
      valor: formatPercent(metricas.razaoDivida),
      icone: Award,
      cor: metricas.razaoDivida <= 30 ? 'text-green-600' : metricas.razaoDivida <= 50 ? 'text-yellow-600' : 'text-red-600',
      bgCor: metricas.razaoDivida <= 30 ? 'from-green-50 to-emerald-50' : metricas.razaoDivida <= 50 ? 'from-yellow-50 to-orange-50' : 'from-red-50 to-pink-50'
    }
  ];

  const getNivelSaude = (score: number) => {
    if (score >= 80) return { nivel: 'Excelente', cor: 'text-green-600', emoji: '🏆' };
    if (score >= 60) return { nivel: 'Boa', cor: 'text-blue-600', emoji: '👍' };
    if (score >= 40) return { nivel: 'Regular', cor: 'text-yellow-600', emoji: '⚠️' };
    return { nivel: 'Precisa Melhorar', cor: 'text-red-600', emoji: '🚨' };
  };

  const nivelSaude = getNivelSaude(metricas.saudeFinanceira);

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Métricas e KPIs
              </h2>
              <p className="text-sm text-gray-500 mt-1">Indicadores de performance financeira</p>
            </div>
          </div>
        </div>

        {/* Score de Saúde Financeira */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Saúde Financeira</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={dadosRadial}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill="#10B981"
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-800">
                    {metricas.saudeFinanceira.toFixed(0)}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <div className={`text-xl font-bold ${nivelSaude.cor}`}>
                {nivelSaude.emoji} {nivelSaude.nivel}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Score baseado em saldo, dívidas, poupança e crescimento
              </p>
            </div>
          </div>

          {/* Resumo Mensal */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Resumo do Mês</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm font-medium text-green-700">Receitas</span>
                <span className="font-bold text-green-800">{formatCurrency(metricas.receitasMesAtual)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-sm font-medium text-red-700">Despesas</span>
                <span className="font-bold text-red-800">{formatCurrency(metricas.despesasMesAtual)}</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-xl ${
                metricas.saldoAtual >= 0 ? 'bg-blue-50' : 'bg-yellow-50'
              }`}>
                <span className={`text-sm font-medium ${
                  metricas.saldoAtual >= 0 ? 'text-blue-700' : 'text-yellow-700'
                }`}>Saldo</span>
                <span className={`font-bold ${
                  metricas.saldoAtual >= 0 ? 'text-blue-800' : 'text-yellow-800'
                }`}>{formatCurrency(metricas.saldoAtual)}</span>
              </div>
              {metricas.dividasAbertas > 0 && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm font-medium text-purple-700">Dívidas</span>
                  <span className="font-bold text-purple-800">{formatCurrency(metricas.dividasAbertas)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => {
            const IconeKPI = kpi.icone;
            return (
              <div key={index} className={`bg-gradient-to-br ${kpi.bgCor} rounded-2xl p-4 border border-white/40`}>
                <div className="flex items-center justify-between mb-2">
                  <IconeKPI className={`w-6 h-6 ${kpi.cor}`} />
                </div>
                <div className="text-sm font-medium text-gray-600 mb-1">{kpi.titulo}</div>
                <div className={`text-2xl font-bold ${kpi.cor}`}>{kpi.valor}</div>
              </div>
            );
          })}
        </div>

        {/* Gastos por Categoria */}
        {metricas.gastosPorCategoria.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricas.gastosPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'valor' ? formatCurrency(value) : formatPercent(value),
                    name === 'valor' ? 'Gasto' : 'Utilização'
                  ]}
                />
                <Legend />
                <Bar dataKey="valor" fill="#3B82F6" name="Valor Gasto" />
                <Bar dataKey="utilizacao" fill="#EF4444" name="% do Limite" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Progresso das Metas */}
        {metricas.progressoMetas.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Progresso das Metas</h3>
            <div className="space-y-4">
              {metricas.progressoMetas.map((meta, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">{meta.nome}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatPercent(meta.progresso)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(meta.valor_atual)} de {formatCurrency(meta.valor_alvo)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
