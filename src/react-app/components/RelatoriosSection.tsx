import { useFinance } from '@/react-app/context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileBarChart, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function RelatoriosSection() {
  const { receitas, despesas, categorias } = useFinance();

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  // Dados para gráficos
  const getGraficoPorCategoria = () => {
    const dados = categorias.map(categoria => {
      const totalDespesas = despesas
        .filter(despesa => despesa.categoria_id === categoria.id)
        .reduce((total, despesa) => total + despesa.valor, 0);
      
      return {
        nome: categoria.nome,
        valor: totalDespesas,
        cor: categoria.cor
      };
    }).filter(item => item.valor > 0);

    return dados;
  };

  const getGraficoMensal = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Aug', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosMensais = meses.map((mes, index) => {
      const receitasMes = receitas
        .filter(receita => new Date(receita.data_receita).getMonth() === index)
        .reduce((total, receita) => total + receita.valor, 0);
      
      const despesasMes = despesas
        .filter(despesa => new Date(despesa.data_despesa).getMonth() === index)
        .reduce((total, despesa) => total + despesa.valor, 0);

      return {
        mes,
        receitas: receitasMes,
        despesas: despesasMes,
        saldo: receitasMes - despesasMes
      };
    });

    return dadosMensais;
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório Financeiro - Micten', 20, 20);
    
    doc.setFontSize(12);
    doc.text('Período: ' + new Date().toLocaleDateString('pt-MZ'), 20, 40);
    
    let y = 60;
    doc.text('Resumo Financeiro:', 20, y);
    y += 10;
    
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    
    doc.text(`Total de Receitas: ${formatCurrency(totalReceitas)}`, 30, y);
    y += 8;
    doc.text(`Total de Despesas: ${formatCurrency(totalDespesas)}`, 30, y);
    y += 8;
    doc.text(`Saldo: ${formatCurrency(totalReceitas - totalDespesas)}`, 30, y);
    
    doc.save('relatorio-financeiro.pdf');
  };

  const exportarExcel = () => {
    const dados = [
      ['Tipo', 'Descrição', 'Valor', 'Data'],
      ...receitas.map(receita => ['Receita', receita.descricao, receita.valor, receita.data_receita]),
      ...despesas.map(despesa => ['Despesa', despesa.descricao, despesa.valor, despesa.data_despesa])
    ];

    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
    XLSX.writeFile(wb, 'relatorio-financeiro.xlsx');
  };

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileBarChart className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Relatórios Financeiros
              </h2>
              <p className="text-sm text-gray-500 mt-1">Análise visual dos seus dados</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportarPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={exportarExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Despesas por Categoria */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getGraficoPorCategoria()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => `${nome} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {getGraficoPorCategoria().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Evolução Mensal */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getGraficoMensal()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="despesas" stroke="#FF8042" strokeWidth={2} />
                <Line type="monotone" dataKey="saldo" stroke="#8884D8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Barras Comparativo */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Comparativo Receitas vs Despesas</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getGraficoMensal()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="receitas" fill="#00C49F" />
              <Bar dataKey="despesas" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
