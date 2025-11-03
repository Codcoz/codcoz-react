import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { postgresAPI, mongoAPI } from "../lib/api";
import { Button } from "../components/ui/Button";
import {
  TrendingUp,
  Clock,
  Activity,
  Package,
  UtensilsCrossed,
  ChefHat,
  FileText,
} from "lucide-react";

export default function Home({ empresaId, onNavigate }) {
  const [stats, setStats] = useState({
    entradaItens: 0,
    saidaItens: 0,
    produtosEstoque: 0,
    produtosProximoVencimento: 0,
    produtosEstoqueBaixo: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [proximasTarefas, setProximasTarefas] = useState([]);
  const [loadingTarefas, setLoadingTarefas] = useState(true);
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);
  const [loadingAtividades, setLoadingAtividades] = useState(true);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    document.getElementById("xml-file-input").click();
  };

  useEffect(() => {
    fetchStats();
    fetchProximasTarefas();
    fetchAtividadesRecentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  const fetchStats = async () => {
    try {
      const [
        quantidadeEstoque,
        proximoValidade,
        estoqueBaixo,
        entradas,
        saidas,
      ] = await Promise.all([
        postgresAPI.getProductStockQuantity(empresaId),
        postgresAPI.getProductsNearExpiration(empresaId),
        postgresAPI.getProductsLowStock(empresaId),
        postgresAPI.listEntryMovements(empresaId).catch(() => []),
        postgresAPI.listExitMovements(empresaId).catch(() => []),
      ]);

      // Contar quantidade de movimentações retornadas
      const countEntradas = Array.isArray(entradas) ? entradas.length : 0;
      const countSaidas = Array.isArray(saidas) ? saidas.length : 0;

      setStats((prev) => ({
        ...prev,
        entradaItens: countEntradas,
        saidaItens: countSaidas,
        produtosEstoque: quantidadeEstoque || 0,
        produtosProximoVencimento: proximoValidade || 0,
        produtosEstoqueBaixo: estoqueBaixo || 0,
      }));
    } catch {
      // Ignora erros de API
    }
  };

  const fetchProximasTarefas = async () => {
    if (!empresaId) return;

    try {
      setLoadingTarefas(true);
      const todasTarefas = await postgresAPI.listTasks(empresaId);

      // Filtrar tarefas com dataLimite >= hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data

      const tarefasFiltradas = todasTarefas
        .filter((tarefa) => {
          if (!tarefa.dataLimite) return false;
          const dataLimite = new Date(tarefa.dataLimite);
          dataLimite.setHours(0, 0, 0, 0);
          return dataLimite >= hoje;
        })
        .sort((a, b) => {
          // Ordenar por dataLimite mais próxima primeiro
          const dataA = new Date(a.dataLimite);
          const dataB = new Date(b.dataLimite);
          return dataA - dataB;
        })
        .slice(0, 2); // Limitar a 2 tarefas mais próximas

      setProximasTarefas(tarefasFiltradas);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setProximasTarefas([]);
    } finally {
      setLoadingTarefas(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const dia = data.getDate();
    const mes = data.getMonth();

    // Verificar se é hoje
    if (
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    ) {
      return "Hoje";
    }

    // Verificar se é amanhã
    if (
      data.getDate() === amanha.getDate() &&
      data.getMonth() === amanha.getMonth() &&
      data.getFullYear() === amanha.getFullYear()
    ) {
      return "Amanhã";
    }

    // Formatar data normal
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return `${dia} de ${meses[mes]}`;
  };

  const fetchAtividadesRecentes = async () => {
    if (!empresaId) return;

    try {
      setLoadingAtividades(true);
      const historico = await mongoAPI.getHistoricoBaixas(empresaId);

      // Ordenar por data mais recente primeiro e pegar as 5 mais recentes
      const atividades = historico
        .sort((a, b) => {
          const dataA = new Date(a.data_acontecimento);
          const dataB = new Date(b.data_acontecimento);
          return dataB - dataA; // Mais recente primeiro
        })
        .slice(0, 5)
        .map((item) => {
          // Formatar a atividade
          const tipo = item.tipo_registro === "Entrada" ? "Entrada" : "Saída";
          const quantidade = item.quantidade_movimentada
            ? `${item.quantidade_movimentada}${
                item.unidade_medida ? ` ${item.unidade_medida}` : ""
              }`
            : "";
          const nomeProduto = item.nome_produto || "Produto desconhecido";

          // Formatar data
          let dataFormatada = "";
          if (item.data_acontecimento) {
            const data = new Date(item.data_acontecimento);
            const hoje = new Date();
            const ontem = new Date(hoje);
            ontem.setDate(hoje.getDate() - 1);

            // Verificar se é hoje
            if (
              data.getDate() === hoje.getDate() &&
              data.getMonth() === hoje.getMonth() &&
              data.getFullYear() === hoje.getFullYear()
            ) {
              // Tem hora? Formatar hora
              if (item.data_acontecimento.includes(" ")) {
                const hora = data.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                dataFormatada = `Hoje às ${hora}`;
              } else {
                dataFormatada = "Hoje";
              }
            }
            // Verificar se é ontem
            else if (
              data.getDate() === ontem.getDate() &&
              data.getMonth() === ontem.getMonth() &&
              data.getFullYear() === ontem.getFullYear()
            ) {
              dataFormatada = "Ontem";
            } else {
              // Formatar data completa
              const dia = data.getDate();
              const mes = data.getMonth();
              const meses = [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
              ];
              if (item.data_acontecimento.includes(" ")) {
                const hora = data.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                dataFormatada = `${dia} de ${meses[mes]} às ${hora}`;
              } else {
                dataFormatada = `${dia} de ${meses[mes]}`;
              }
            }
          }

          return {
            texto: quantidade
              ? `${tipo} de ${quantidade} ${nomeProduto}`
              : `${tipo} de ${nomeProduto}`,
            data: dataFormatada,
          };
        });

      setAtividadesRecentes(atividades);
    } catch (error) {
      console.error("Erro ao buscar atividades recentes:", error);
      setAtividadesRecentes([]);
    } finally {
      setLoadingAtividades(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[#333333] text-2xl font-semibold">Home</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#002a45]/10 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 text-[#002a45]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#666666] mb-1">Entrada de itens</p>
              <p className="text-2xl text-[#002a45] font-semibold">
                {stats.entradaItens}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#002a45]/10 rounded-lg shrink-0">
              <Activity className="w-5 h-5 text-[#002a45]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#666666] mb-1">Saída de itens</p>
              <p className="text-2xl text-[#002a45] font-semibold">
                {stats.saidaItens}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 grid grid-cols-1 gap-6">
          {/* Import XML Section */}
          <Card className="p-6">
            <h2 className="text-lg text-[#333333] mb-4 font-semibold">
              Importar Nota Fiscal (XML)
            </h2>
            <p className="text-[#444444] mb-4">
              Importe os arquivos XML recebidos de fornecedores para manter o
              controle atualizado de todas as notas fiscais.
            </p>
            <input
              type="file"
              id="xml-file-input"
              accept=".xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={handleImportClick}
              className="bg-[#002a45] hover:bg-[#003a5f]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Importar
            </Button>
            {selectedFile && (
              <p className="mt-3 text-sm text-[#666666]">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <h2 className="text-lg text-[#333333] mb-4 font-semibold">
              Atividades recentes
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {loadingAtividades ? (
                <p className="text-center text-[#666666] text-sm py-4">
                  Carregando atividades...
                </p>
              ) : atividadesRecentes.length === 0 ? (
                <p className="text-center text-[#666666] text-sm py-4">
                  Nenhuma atividade recente
                </p>
              ) : (
                atividadesRecentes.map((atividade, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-[#333333]"
                  >
                    <Clock className="w-4 h-4 text-[#444444] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm">{atividade.texto}</span>
                      <span className="text-xs text-[#666666]">
                        {atividade.data}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="grid grid-cols-1 gap-6">
          {/* Next Tasks */}
          <Card className="p-6">
            <h2 className="text-lg text-[#333333] mb-4 font-semibold">
              Próximas tarefas
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {loadingTarefas ? (
                <p className="text-center text-[#666666] text-xs py-3">
                  Carregando tarefas...
                </p>
              ) : proximasTarefas.length === 0 ? (
                <p className="text-center text-[#666666] text-xs py-3">
                  Nenhuma tarefa pendente
                </p>
              ) : (
                proximasTarefas.map((tarefa, index) => (
                  <div key={tarefa.id || index}>
                    {index > 0 && (
                      <div className="border-t border-[#ebebeb] my-2" />
                    )}
                    <div className="flex items-start gap-2 py-1">
                      <Clock className="w-3.5 h-3.5 text-[#444444] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          {tarefa.ingrediente || tarefa.pedido || "Sem nome"}
                        </p>
                        <p className="text-xs text-[#666666] leading-tight">
                          {tarefa.tipoTarefa || "Tarefa"}
                        </p>
                        <p className="text-xs text-[#002a45] font-medium mt-0.5 leading-tight">
                          {formatarData(tarefa.dataLimite)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-6">
            <h2 className="text-lg text-[#333333] mb-4 font-semibold">
              Links rápidos
            </h2>
            <div className="space-y-3">
              <div>
                <button
                  onClick={() => onNavigate?.("pedidos")}
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
                  onClick={() => onNavigate?.("relatorios")}
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
                  onClick={() => onNavigate?.("produtos")}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-[#444444]" />
                    <span>Ver Produtos</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
                <div className="border-t border-[#ebebeb] my-1" />
              </div>
              <div>
                <button
                  onClick={() => {
                    sessionStorage.setItem("gastronomiaTab", "receitas");
                    onNavigate?.("gastronomia");
                  }}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChefHat className="w-4 h-4 text-[#444444]" />
                    <span>Visualizar Receitas</span>
                  </div>
                  <span className="text-[#555555]">›</span>
                </button>
                <div className="border-t border-[#ebebeb] my-1" />
              </div>
              <div>
                <button
                  onClick={() => {
                    sessionStorage.setItem("gastronomiaTab", "ingredientes");
                    onNavigate?.("gastronomia");
                  }}
                  className="w-full text-left flex items-center justify-between py-2 text-[#333333] hover:text-[#002a45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-4 h-4 text-[#444444]" />
                    <span>Ver Ingredientes</span>
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
