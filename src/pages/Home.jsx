import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { postgresAPI } from "../lib/api";
import { Package, TrendingUp, AlertTriangle, DollarSign, Clock, Activity } from "lucide-react";

export default function Home({ empresaId, onNavigate }) {
  const [stats, setStats] = useState({
    entradaItens: 240,
    saidaItens: 190,
    importacoes: 3,
    custoTotal: 10000.0,
    produtosEstoque: 0,
    produtosProximoVencimento: 0,
    produtosEstoqueBaixo: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    document.getElementById('xml-file-input').click();
  };

  useEffect(() => {
    fetchStats();
  }, [empresaId]);

  const fetchStats = async () => {
    try {
      const [quantidadeEstoque, proximoValidade, estoqueBaixo, entradas, saidas] = await Promise.all([
        postgresAPI.getProductStockQuantity(empresaId),
        postgresAPI.getProductsNearExpiration(empresaId),
        postgresAPI.getProductsLowStock(empresaId),
        postgresAPI.listEntryMovements(empresaId).catch(() => []),
        postgresAPI.listExitMovements(empresaId).catch(() => []),
      ]);

      const totalEntradas = entradas.reduce((sum, mov) => sum + (mov.diferenca || 0), 0);
      const totalSaidas = saidas.reduce((sum, mov) => sum + Math.abs(mov.diferenca || 0), 0);

      setStats(prev => ({
        ...prev,
        entradaItens: totalEntradas,
        saidaItens: totalSaidas,
        produtosEstoque: quantidadeEstoque || 0,
        produtosProximoVencimento: proximoValidade || 0,
        produtosEstoqueBaixo: estoqueBaixo || 0,
      }));
    } catch {
      // Ignora erros de API
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[#333333] text-2xl font-semibold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#002a45]/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#002a45]" />
            </div>
            <div>
              <p className="text-sm text-[#666666]">Entrada de itens</p>
              <p className="text-[#002a45] font-semibold">{stats.entradaItens}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#002a45]/10 rounded-lg">
              <Activity className="w-5 h-5 text-[#002a45]" />
            </div>
            <div>
              <p className="text-sm text-[#666666]">Saída de itens</p>
              <p className="text-[#002a45] font-semibold">{stats.saidaItens}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#002a45]/10 rounded-lg">
              <Package className="w-5 h-5 text-[#002a45]" />
            </div>
            <div>
              <p className="text-sm text-[#666666]">Importações</p>
              <p className="text-[#002a45] font-semibold">{stats.importacoes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#002a45]/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#002a45]" />
            </div>
            <div>
              <p className="text-sm text-[#666666]">Custo Total</p>
              <p className="text-[#002a45] font-semibold">
                R$ {stats.custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Import Section */}
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-[#333333] mb-4 font-semibold">Importar Nota Fiscal (XML)</h2>
            <p className="text-[#444444] mb-4">
              Importe os arquivos XML recebidos de fornecedores para manter o controle
              atualizado de todas as notas fiscais.
            </p>
            <input
              type="file"
              id="xml-file-input"
              accept=".xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button 
              onClick={handleImportClick}
              className="bg-[#002a45] text-white px-6 py-2 rounded-md hover:bg-[#003a5f] transition-colors"
            >
              Importar
            </button>
            {selectedFile && (
              <p className="mt-3 text-sm text-[#666666]">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <h2 className="text-[#333333] mb-4 font-semibold">Atividades recentes</h2>
            <div className="space-y-4">
              {[
                "Entrada de ingredientes",
                "Cadastro de fornecedor",
                "Saída de produto",
                "Nota XML: NF-1234",
                "Atualização de cadastro",
                "Edição de nota",
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 text-[#333333]">
                  <Clock className="w-4 h-4 text-[#444444]" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Next Audits */}
          <Card className="p-6">
            <h2 className="text-[#333333] mb-4 font-semibold">Próximas auditorias</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#333333]">
                <Clock className="w-4 h-4 text-[#444444]" />
                <span>Segunda, 8:30</span>
              </div>
              <div className="border-t border-[#ebebeb] my-2" />
              <div className="flex items-center gap-3 text-[#333333]">
                <Clock className="w-4 h-4 text-[#444444]" />
                <span>Quinta, 10:40</span>
              </div>
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-6">
            <h2 className="text-[#333333] mb-4 font-semibold">Links rápidos</h2>
            <div className="space-y-3">
              <div>
                <button 
                  onClick={() => onNavigate?.('produtos')}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#444444]" />
                    <span>Criar Produto</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
                <div className="border-t border-[#ebebeb] my-1" />
              </div>
              <div>
                <button 
                  onClick={() => onNavigate?.('xml')}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#444444]" />
                    <span>Importar XML</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
                <div className="border-t border-[#ebebeb] my-1" />
              </div>
              <div>
                <button 
                  onClick={() => onNavigate?.('pedidos')}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#444444]" />
                    <span>Marcar Auditoria</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
                <div className="border-t border-[#ebebeb] my-1" />
              </div>
              <div>
                <button 
                  onClick={() => onNavigate?.('relatorios')}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#444444]" />
                    <span>Visualizar Relatórios</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
                <div className="border-t border-[#ebebeb] my-1" />
              </div>
              <div>
                <button 
                  onClick={() => {/* Chatbot já está visível */}}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#444444]" />
                    <span>Falar com ChefIA</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
