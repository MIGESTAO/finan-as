import { useFinance } from '@/react-app/context/FinanceContext';
import { TrendingUp, TrendingDown, CreditCard, Target, Wallet, PiggyBank, Sparkles } from 'lucide-react';

export default function ResumoCards() {
  const { resumo } = useFinance();

  if (!resumo) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 animate-pulse">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const cards = [
    {
      title: 'Saldo do Mês',
      value: resumo.saldo_total,
      icon: resumo.saldo_total >= 0 ? TrendingUp : TrendingDown,
      gradient: resumo.saldo_total >= 0 ? 'from-emerald-500 via-green-500 to-teal-600' : 'from-red-500 via-pink-500 to-rose-600',
      bgGradient: resumo.saldo_total >= 0 ? 'from-emerald-50 to-green-50' : 'from-red-50 to-pink-50',
      textColor: resumo.saldo_total >= 0 ? 'text-emerald-600' : 'text-red-600',
      description: resumo.saldo_total >= 0 ? 'Você está no positivo! 🎉' : 'Fique atento aos gastos'
    },
    {
      title: 'Receitas',
      value: resumo.receitas_mes,
      icon: Wallet,
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
      description: 'Entradas do mês'
    },
    {
      title: 'Despesas',
      value: resumo.despesas_mes,
      icon: TrendingDown,
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      bgGradient: 'from-orange-50 to-red-50',
      textColor: 'text-red-600',
      description: 'Saídas do mês'
    },
    {
      title: 'Dívidas',
      value: resumo.dividas_abertas,
      icon: CreditCard,
      gradient: 'from-purple-500 via-violet-500 to-purple-600',
      bgGradient: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-600',
      description: 'Total em aberto'
    },
    {
      title: 'Metas Ativas',
      value: resumo.metas_ativas,
      icon: Target,
      gradient: 'from-pink-500 via-rose-500 to-pink-600',
      bgGradient: 'from-pink-50 to-rose-50',
      textColor: 'text-pink-600',
      description: 'Objetivos em andamento',
      isCount: true
    },
    {
      title: 'Total Poupado',
      value: resumo.total_poupado,
      icon: PiggyBank,
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600',
      description: 'Soma de todas as metas'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`group relative bg-gradient-to-br ${card.bgGradient} rounded-3xl p-8 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden`}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-br from-white to-transparent rounded-full mix-blend-overlay"></div>
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-gradient-to-tl from-white to-transparent rounded-full mix-blend-overlay"></div>
          </div>
          
          {/* Sparkle decoration for positive saldo */}
          {index === 0 && resumo.saldo_total >= 0 && (
            <div className="absolute top-4 right-4 text-emerald-400 animate-float">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          
          <div className="relative z-10">
            {/* Icon with enhanced design */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                {/* Animated ring */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${card.gradient} rounded-2xl opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300`}></div>
              </div>
            </div>
            
            {/* Title and description */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
            
            {/* Value with enhanced styling */}
            <div className="space-y-1">
              <p className={`text-3xl font-black ${card.textColor} tracking-tight`}>
                {card.isCount ? card.value : formatCurrency(card.value)}
              </p>
              
              {/* Progress indicator for specific cards */}
              {index === 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  <div className={`w-3 h-3 rounded-full ${resumo.saldo_total >= 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-xs font-medium text-gray-600">
                    {resumo.saldo_total >= 0 ? 'Situação positiva' : 'Atenção necessária'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Hover effect overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
        </div>
      ))}
    </div>
  );
}
