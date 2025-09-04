import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { TrendingUp, Shield, Target, PiggyBank, Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="w-12 h-12 text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Micten</h1>
          </div>
          <button
            onClick={redirectToLogin}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Entrar com Google
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Controle total das suas
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600"> finanças</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Gerencie receitas, despesas, dívidas e metas de poupança em um só lugar. 
            Tenha insights inteligentes sobre seus hábitos financeiros.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Dashboard Inteligente</h3>
              <p className="text-gray-600 text-sm">Visualize seu saldo, gastos e economia em tempo real</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Controle de Dívidas</h3>
              <p className="text-gray-600 text-sm">Gerencie e quite suas dívidas com planejamento inteligente</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Metas de Poupança</h3>
              <p className="text-gray-600 text-sm">Defina objetivos e acompanhe seu progresso para alcançá-los</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Categorização</h3>
              <p className="text-gray-600 text-sm">Organize gastos por categorias com limites personalizados</p>
            </div>
          </div>

          <button
            onClick={redirectToLogin}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-lg font-semibold rounded-2xl hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Começar agora grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-white/20">
        <div className="text-center text-gray-600">
          <p>© 2024 Micten. Gestão financeira pessoal completa.</p>
        </div>
      </footer>
    </div>
  );
}
