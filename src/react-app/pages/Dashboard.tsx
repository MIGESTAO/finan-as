import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import Navbar from '@/react-app/components/Navbar';
import ResumoCards from '@/react-app/components/ResumoCards';
import ReceitasSection from '@/react-app/components/ReceitasSection';
import DespesasSection from '@/react-app/components/DespesasSection';
import DividasSection from '@/react-app/components/DividasSection';
import MetasSection from '@/react-app/components/MetasSection';
import RelatoriosSection from '@/react-app/components/RelatoriosSection';
import OrcamentoSection from '@/react-app/components/OrcamentoSection';
import HistoricoSection from '@/react-app/components/HistoricoSection';
import CalculadoraSection from '@/react-app/components/CalculadoraSection';
import NotificacoesSection from '@/react-app/components/NotificacoesSection';
import ProjecoesSection from '@/react-app/components/ProjecoesSection';
import BackupSection from '@/react-app/components/BackupSection';
import MetricasSection from '@/react-app/components/MetricasSection';
import LembretesSection from '@/react-app/components/LembretesSection';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const { loading } = useFinance();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative inline-block mb-8">
            <div className="animate-spin">
              <Loader2 className="w-16 h-16 text-emerald-600 mx-auto" />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Carregando seus dados financeiros
          </h2>
          <p className="text-gray-600 animate-pulse">Preparando seu dashboard personalizado...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="container mx-auto px-6 py-12 space-y-12">
          {/* Enhanced welcome section */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
                Olá, {user.google_user_data.given_name || user.email}!
              </h1>
              <div className="absolute -top-2 -right-2 animate-bounce">
                <span className="text-4xl">👋</span>
              </div>
            </div>
            
            <div className="relative">
              <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                Aqui está o resumo completo das suas finanças hoje
              </p>
              
              {/* Decorative elements */}
              <div className="flex items-center justify-center space-x-2 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Dashboard Financeiro</span>
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Enhanced cards section */}
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Visão Geral</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mx-auto"></div>
            </div>
            <ResumoCards />
          </div>

          {/* Enhanced sections grid */}
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Gestão Financeira</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <ReceitasSection />
              <DespesasSection />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <DividasSection />
              <MetasSection />
            </div>

            <div className="text-center mb-8 mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📈 Análise e Planejamento</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <OrcamentoSection />
              <NotificacoesSection />
            </div>

            <div className="space-y-8">
              <RelatoriosSection />
              <MetricasSection />
            </div>

            <div className="text-center mb-8 mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🛠️ Ferramentas Avançadas</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <CalculadoraSection />
              <LembretesSection />
            </div>

            <div className="space-y-8">
              <HistoricoSection />
              <ProjecoesSection />
            </div>

            <div className="text-center mb-8 mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🔒 Gestão de Dados</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto"></div>
            </div>

            <div className="space-y-8">
              <BackupSection />
            </div>
          </div>
          
          {/* Footer section */}
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/40">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600 font-medium">Gestão financeira inteligente com Micten</span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
