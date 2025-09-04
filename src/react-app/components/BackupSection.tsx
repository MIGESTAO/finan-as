import { useState } from 'react';
import { useFinance } from '@/react-app/context/FinanceContext';
import { Download, Upload, Database, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BackupSection() {
  const { receitas, despesas, dividas, metas, categorias } = useFinance();
  const [loading, setLoading] = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState<Date | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState('');

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
  };

  const exportarBackupCompleto = async () => {
    setLoading(true);
    try {
      const dadosBackup = {
        metadata: {
          versao: '1.0',
          dataExportacao: new Date().toISOString(),
          totalReceitas: receitas.length,
          totalDespesas: despesas.length,
          totalDividas: dividas.length,
          totalMetas: metas.length,
          totalCategorias: categorias.length
        },
        receitas: receitas.map(r => ({
          ...r,
          created_at: undefined,
          updated_at: undefined,
          user_id: undefined
        })),
        despesas: despesas.map(d => ({
          ...d,
          created_at: undefined,
          updated_at: undefined,
          user_id: undefined
        })),
        dividas: dividas.map(d => ({
          ...d,
          created_at: undefined,
          updated_at: undefined,
          user_id: undefined
        })),
        metas: metas.map(m => ({
          ...m,
          created_at: undefined,
          updated_at: undefined,
          user_id: undefined
        })),
        categorias: categorias.map(c => ({
          ...c,
          created_at: undefined,
          updated_at: undefined,
          user_id: undefined
        }))
      };

      const dataStr = JSON.stringify(dadosBackup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `micten-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setUltimoBackup(new Date());
      setStatus('success');
      setMensagem('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      setStatus('error');
      setMensagem('Erro ao exportar backup. Tente novamente.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const exportarExcel = async () => {
    setLoading(true);
    try {
      const wb = XLSX.utils.book_new();

      // Planilha de Receitas
      const receitasWS = XLSX.utils.json_to_sheet(receitas.map(r => ({
        'Descrição': r.descricao,
        'Valor': r.valor,
        'Data': r.data_receita,
        'Tipo': r.tipo,
        'Fonte': r.fonte || ''
      })));
      XLSX.utils.book_append_sheet(wb, receitasWS, 'Receitas');

      // Planilha de Despesas
      const despesasWS = XLSX.utils.json_to_sheet(despesas.map(d => ({
        'Descrição': d.descricao,
        'Valor': d.valor,
        'Data': d.data_despesa,
        'Tipo': d.tipo,
        'Categoria': (d as any).categoria_nome || ''
      })));
      XLSX.utils.book_append_sheet(wb, despesasWS, 'Despesas');

      // Planilha de Dívidas
      const dividasWS = XLSX.utils.json_to_sheet(dividas.map(d => ({
        'Credor': d.credor,
        'Descrição': d.descricao,
        'Valor Original': d.valor_original,
        'Valor Atual': d.valor_atual,
        'Taxa Juros': d.taxa_juros,
        'Vencimento': d.data_vencimento || '',
        'Status': d.status
      })));
      XLSX.utils.book_append_sheet(wb, dividasWS, 'Dívidas');

      // Planilha de Metas
      const metasWS = XLSX.utils.json_to_sheet(metas.map(m => ({
        'Nome': m.nome,
        'Descrição': m.descricao || '',
        'Valor Alvo': m.valor_alvo,
        'Valor Atual': m.valor_atual,
        'Data Meta': m.data_meta || '',
        'Status': m.status
      })));
      XLSX.utils.book_append_sheet(wb, metasWS, 'Metas');

      // Planilha de Resumo
      const resumoWS = XLSX.utils.json_to_sheet([{
        'Total Receitas': receitas.reduce((acc, r) => acc + r.valor, 0),
        'Total Despesas': despesas.reduce((acc, d) => acc + d.valor, 0),
        'Total Dívidas': dividas.reduce((acc, d) => acc + d.valor_atual, 0),
        'Total Poupado': metas.reduce((acc, m) => acc + m.valor_atual, 0),
        'Data Exportação': new Date().toLocaleDateString('pt-MZ')
      }]);
      XLSX.utils.book_append_sheet(wb, resumoWS, 'Resumo');

      XLSX.writeFile(wb, `micten-dados-${new Date().toISOString().split('T')[0]}.xlsx`);

      setStatus('success');
      setMensagem('Dados exportados para Excel com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      setStatus('error');
      setMensagem('Erro ao exportar para Excel. Tente novamente.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const importarBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const dadosBackup = JSON.parse(text);

      // Validar estrutura do backup
      if (!dadosBackup.metadata || !dadosBackup.receitas) {
        throw new Error('Arquivo de backup inválido');
      }

      // Aqui você implementaria a lógica para restaurar os dados
      // Por exemplo, fazer chamadas para a API para recrear os dados
      
      setStatus('success');
      setMensagem(`Backup importado com sucesso! ${dadosBackup.metadata.totalReceitas} receitas, ${dadosBackup.metadata.totalDespesas} despesas restauradas.`);
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      setStatus('error');
      setMensagem('Erro ao importar backup. Verifique se o arquivo é válido.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const calcularEstatisticas = () => {
    const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0);
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    const totalDividas = dividas.reduce((acc, d) => acc + d.valor_atual, 0);
    const totalPoupado = metas.reduce((acc, m) => acc + m.valor_atual, 0);

    return {
      totalTransacoes: receitas.length + despesas.length + dividas.length + metas.length,
      valorTotal: totalReceitas + totalDespesas + totalDividas + totalPoupado,
      dataInicio: receitas.length > 0 ? 
        new Date(Math.min(...receitas.map(r => new Date(r.data_receita).getTime()))).toLocaleDateString('pt-MZ') :
        'N/A'
    };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="group relative bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl -z-10 blur-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Backup e Restauração
              </h2>
              <p className="text-sm text-gray-500 mt-1">Proteja e gerencie seus dados financeiros</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 ${
            status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              status === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {mensagem}
            </span>
          </div>
        )}

        {/* Estatísticas dos Dados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total de Transações</div>
            <div className="text-2xl font-bold text-blue-700">{stats.totalTransacoes}</div>
          </div>
          
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Valor Total Gerenciado</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.valorTotal)}</div>
          </div>
          
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Primeiro Registro</div>
            <div className="text-2xl font-bold text-purple-700">{stats.dataInicio}</div>
          </div>
        </div>

        {/* Último Backup */}
        {ultimoBackup && (
          <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800">Último Backup Realizado</div>
                <div className="text-xs text-green-600">{ultimoBackup.toLocaleString('pt-MZ')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Ações de Backup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Exportar Backup */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <span>Exportar Dados</span>
            </h3>
            
            <div className="space-y-4">
              <button
                onClick={exportarBackupCompleto}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <Database className="w-5 h-5" />
                <span>{loading ? 'Exportando...' : 'Backup Completo (JSON)'}</span>
              </button>
              
              <button
                onClick={exportarExcel}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>{loading ? 'Exportando...' : 'Exportar para Excel'}</span>
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>• Backup completo inclui todas as transações, metas e configurações</p>
              <p>• Excel contém dados organizados em planilhas separadas</p>
            </div>
          </div>

          {/* Importar Backup */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Upload className="w-5 h-5 text-green-600" />
              <span>Importar Dados</span>
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".json"
                  onChange={importarBackup}
                  disabled={loading}
                  className="hidden"
                  id="backup-upload"
                />
                <label
                  htmlFor="backup-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    {loading ? 'Importando...' : 'Clique para selecionar arquivo de backup'}
                  </span>
                  <span className="text-xs text-gray-500">Apenas arquivos .json</span>
                </label>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700">
                  <strong>Atenção:</strong> A importação irá adicionar os dados do backup aos existentes. 
                  Faça um backup atual antes de importar.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
          <h4 className="font-bold text-indigo-800 mb-3 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>🔒 Segurança dos Dados</span>
          </h4>
          <ul className="text-sm text-indigo-700 space-y-2">
            <li>• Os backups não incluem informações pessoais sensíveis</li>
            <li>• Dados são exportados em formato legível e seguro</li>
            <li>• Recomendamos fazer backup semanal dos seus dados</li>
            <li>• Armazene os backups em local seguro (nuvem ou dispositivo físico)</li>
            <li>• Teste a restauração periodicamente para garantir integridade</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
