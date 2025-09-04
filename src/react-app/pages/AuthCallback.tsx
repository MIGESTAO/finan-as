import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/dashboard');
      } catch (error) {
        console.error('Erro na autenticação:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Loader2 className="w-12 h-12 text-emerald-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Finalizando login...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto configuramos sua conta
        </p>
      </div>
    </div>
  );
}
