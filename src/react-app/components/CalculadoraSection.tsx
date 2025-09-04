import { useState } from 'react';
import { Calculator, Percent, DollarSign, Calendar } from 'lucide-react';

type TipoCalculo = 'juros_simples' | 'juros_compostos' | 'emprestimo' | 'poupanca';

export default function CalculadoraSection() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('juros_simples');
  const [resultado, setResultado] = useState<number | null>(null);
  const [detalhes, setDetalhes] = useState<string>('');

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const calcularJurosSimples = (principal: number, taxa: number, tempo: number) => {
    const juros = principal * (taxa / 100) * tempo;
    const montante = principal + juros;
    
    setResultado(montante);
    setDetalhes(`
      Capital inicial: ${formatCurrency(principal)}
      Taxa de juros: ${taxa}% ao mês
      Tempo: ${tempo} meses
      Juros: ${formatCurrency(juros)}
      Montante final: ${formatCurrency(montante)}
    `);
  };

  const calcularJurosCompostos = (principal: number, taxa: number, tempo: number) => {
    const montante = principal * Math.pow(1 + taxa / 100, tempo);
    const juros = montante - principal;
    
    setResultado(montante);
    setDetalhes(`
      Capital inicial: ${formatCurrency(principal)}
      Taxa de juros: ${taxa}% ao mês
      Tempo: ${tempo} meses
      Juros compostos: ${formatCurrency(juros)}
      Montante final: ${formatCurrency(montante)}
    `);
  };

  const calcularEmprestimo = (valor: number, taxa: number, parcelas: number) => {
    const taxaMensal = taxa / 100;
    const pmt = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / 
                (Math.pow(1 + taxaMensal, parcelas) - 1);
    const totalPago = pmt * parcelas;
    const jurosTotal = totalPago - valor;
    
    setResultado(pmt);
    setDetalhes(`
      Valor do empréstimo: ${formatCurrency(valor)}
      Taxa de juros: ${taxa}% ao mês
      Número de parcelas: ${parcelas}
      Valor da parcela: ${formatCurrency(pmt)}
      Total a pagar: ${formatCurrency(totalPago)}
      Total de juros: ${formatCurrency(jurosTotal)}
    `);
  };

  const calcularPoupanca = (valorMensal: number, taxa: number, tempo: number) => {
    let montante = 0;
    let totalDepositado = 0;
    
    for (let i = 0; i < tempo; i++) {
      montante = (montante + valorMensal) * (1 + taxa / 100);
      totalDepositado += valorMensal;
    }
    
    const rendimento = montante - totalDepositado;
    
    setResultado(montante);
    setDetalhes(`
      Depósito mensal: ${formatCurrency(valorMensal)}
      Taxa de rendimento: ${taxa}% ao mês
      Tempo: ${tempo} meses
      Total depositado: ${formatCurrency(totalDepositado)}
      Rendimento: ${formatCurrency(rendimento)}
      Montante final: ${formatCurrency(montante)}
    `);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const valor1 = parseFloat(formData.get('valor1') as string);
    const valor2 = parseFloat(formData.get('valor2') as string);
    const valor3 = parseFloat(formData.get('valor3') as string);

    switch (tipoCalculo) {
      case 'juros_simples':
        calcularJurosSimples(valor1, valor2, valor3);
        break;
      case 'juros_compostos':
        calcularJurosCompostos(valor1, valor2, valor3);
        break;
      case 'emprestimo':
        calcularEmprestimo(valor1, valor2, valor3);
        break;
      case 'poupanca':
        calcularPoupanca(valor1, valor2, valor3);
        break;
    }
  };

  const getFormFields = () => {
    switch (tipoCalculo) {
      case 'juros_simples':
      case 'juros_compostos':
        return [
          { name: 'valor1', label: 'Capital Inicial (MT)', type: 'number', step: '0.01', icon: DollarSign },
          { name: 'valor2', label: 'Taxa de Juros (% ao mês)', type: 'number', step: '0.01', icon: Percent },
          { name: 'valor3', label: 'Tempo (meses)', type: 'number', step: '1', icon: Calendar }
        ];
      case 'emprestimo':
        return [
          { name: 'valor1', label: 'Valor do Empréstimo (MT)', type: 'number', step: '0.01', icon: DollarSign },
          { name: 'valor2', label: 'Taxa de Juros (% ao mês)', type: 'number', step: '0.01', icon: Percent },
          { name: 'valor3', label: 'Número de Parcelas', type: 'number', step: '1', icon: Calendar }
        ];
      case 'poupanca':
        return [
          { name: 'valor1', label: 'Depósito Mensal (MT)', type: 'number', step: '0.01', icon: DollarSign },
          { name: 'valor2', label: 'Taxa de Rendimento (% ao mês)', type: 'number', step: '0.01', icon: Percent },
          { name: 'valor3', label: 'Tempo (meses)', type: 'number', step: '1', icon: Calendar }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Calculadora Financeira
              </h2>
              <p className="text-sm text-gray-500 mt-1">Calcule juros, empréstimos e investimentos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de Cálculo
              </label>
              <select
                value={tipoCalculo}
                onChange={(e) => setTipoCalculo(e.target.value as TipoCalculo)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80"
              >
                <option value="juros_simples">📈 Juros Simples</option>
                <option value="juros_compostos">📊 Juros Compostos</option>
                <option value="emprestimo">💳 Empréstimo</option>
                <option value="poupanca">🏦 Poupança</option>
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {getFormFields().map((field, index) => {
                const IconeField = field.icon;
                return (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-600">
                        <IconeField className="w-5 h-5" />
                      </div>
                      <input
                        type={field.type}
                        name={field.name}
                        step={field.step}
                        min="0"
                        required
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 bg-white/80"
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                🧮 Calcular
              </button>
            </form>
          </div>

          {/* Resultado */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Resultado</h3>
            
            {resultado !== null ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                  <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {tipoCalculo === 'emprestimo' ? 'Parcela: ' : 'Total: '}
                    {formatCurrency(resultado)}
                  </div>
                  {tipoCalculo === 'emprestimo' && (
                    <p className="text-sm text-gray-600">Valor de cada parcela mensal</p>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Detalhes do Cálculo:</h4>
                  <pre className="text-sm text-gray-600 whitespace-pre-line font-mono">
                    {detalhes}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Preencha os campos e clique em "Calcular" para ver o resultado</p>
              </div>
            )}
          </div>
        </div>

        {/* Dicas */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-3">💡 Dicas Importantes:</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Juros Simples:</strong> Os juros são calculados apenas sobre o capital inicial</li>
            <li>• <strong>Juros Compostos:</strong> Os juros são calculados sobre o capital + juros anteriores</li>
            <li>• <strong>Empréstimos:</strong> Use para calcular parcelas de financiamentos</li>
            <li>• <strong>Poupança:</strong> Simule o crescimento de depósitos mensais regulares</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
