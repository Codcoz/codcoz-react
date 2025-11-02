import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { toast } from "sonner";
import {
  Plus,
  CheckCircle,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Package,
  ShoppingCart,
} from "lucide-react";
import { postgresAPI } from "../lib/api";

export default function TarefasPage({ empresaId }) {
  const [tarefas, setTarefas] = useState([]);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Tipos de tarefa fixos
  const tiposTarefa = [
    { id: 1, nome: "Conferência de Estoque" },
    { id: 2, nome: "Atividade" },
  ];

  // Dados para os selects
  const [ingredientes, setIngredientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  // Filtros
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtros, setFiltros] = useState({
    search: "",
    situacao: "",
    tipoTarefa: "",
    ingrediente: "",
    responsavel: "",
    dataInicio: "",
    dataFim: "",
    dataLimiteInicio: "",
    dataLimiteFim: "",
  });

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    tipoTarefaId: "",
    ingredienteId: "",
    responsavelId: "",
    dataLimite: "",
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (empresaId) {
      carregarDados();
    }
  }, [empresaId]);

  // Carregar tarefas quando empresaId mudar
  useEffect(() => {
    if (empresaId) {
      carregarTarefas();
    }
  }, [empresaId]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, tarefas]);

  const carregarDados = async () => {
    setLoadingData(true);
    try {
      // Carregar ingredientes
      const ingreds = await postgresAPI.listIngredientes(empresaId);
      setIngredientes(Array.isArray(ingreds) ? ingreds : []);

      // Carregar funcionários
      const funcs = await postgresAPI.listEmployees(empresaId);
      setFuncionarios(Array.isArray(funcs) ? funcs : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const carregarTarefas = async () => {
    try {
      const data = await postgresAPI.listTasks(empresaId);
      setTarefas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      toast.error("Erro ao carregar tarefas");
      setTarefas([]);
    }
  };

  const aplicarFiltros = () => {
    let filtradas = [...tarefas];

    // Filtro de busca por texto
    if (filtros.search) {
      const search = filtros.search.toLowerCase();
      filtradas = filtradas.filter(
        (t) =>
          (t.tipoTarefa || "").toLowerCase().includes(search) ||
          (t.ingrediente || "").toLowerCase().includes(search) ||
          (t.responsavel || "").toLowerCase().includes(search) ||
          (t.relator || "").toLowerCase().includes(search) ||
          (t.pedido || "").toLowerCase().includes(search)
      );
    }

    // Filtro por situação
    if (filtros.situacao) {
      filtradas = filtradas.filter(
        (t) =>
          (t.situacao || "").toUpperCase() === filtros.situacao.toUpperCase()
      );
    }

    // Filtro por tipo de tarefa
    if (filtros.tipoTarefa) {
      filtradas = filtradas.filter(
        (t) => (t.tipoTarefa || "") === filtros.tipoTarefa
      );
    }

    // Filtro por ingrediente
    if (filtros.ingrediente) {
      filtradas = filtradas.filter(
        (t) => (t.ingrediente || "") === filtros.ingrediente
      );
    }

    // Filtro por responsável
    if (filtros.responsavel) {
      filtradas = filtradas.filter((t) =>
        (t.responsavel || "").includes(filtros.responsavel)
      );
    }

    // Filtro por período de criação
    if (filtros.dataInicio && filtros.dataFim) {
      filtradas = filtradas.filter((t) => {
        if (!t.dataCriacao) return false;
        const data = new Date(t.dataCriacao);
        const inicio = new Date(filtros.dataInicio);
        const fim = new Date(filtros.dataFim);
        return data >= inicio && data <= fim;
      });
    }

    // Filtro por período de data limite
    if (filtros.dataLimiteInicio && filtros.dataLimiteFim) {
      filtradas = filtradas.filter((t) => {
        if (!t.dataLimite) return false;
        const data = new Date(t.dataLimite);
        const inicio = new Date(filtros.dataLimiteInicio);
        const fim = new Date(filtros.dataLimiteFim);
        return data >= inicio && data <= fim;
      });
    }

    setTarefasFiltradas(filtradas);
  };

  const limparFiltros = () => {
    setFiltros({
      search: "",
      situacao: "",
      tipoTarefa: "",
      ingrediente: "",
      responsavel: "",
      dataInicio: "",
      dataFim: "",
      dataLimiteInicio: "",
      dataLimiteFim: "",
    });
  };

  const resetarFormulario = () => {
    setFormData({
      tipoTarefaId: "",
      ingredienteId: "",
      responsavelId: "",
      dataLimite: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = sessionStorage.getItem("userEmail");
      if (!email) {
        toast.error("Email não encontrado na sessão");
        return;
      }

      // Buscar funcionário (relator)
      const funcionario = await postgresAPI.getEmployeeByEmail(email);
      if (!funcionario || !funcionario.id) {
        toast.error("Erro ao identificar usuário");
        return;
      }

      // Buscar o ingrediente selecionado para obter o nome
      if (!formData.ingredienteId) {
        toast.error("Selecione um ingrediente");
        setLoading(false);
        return;
      }

      const ingredienteSelecionado = ingredientes.find(
        (ing) => ing.id && ing.id.toString() === formData.ingredienteId
      );

      if (!ingredienteSelecionado) {
        toast.error("Ingrediente não encontrado");
        setLoading(false);
        return;
      }

      // Obter nome do ingrediente
      const nomeIngrediente =
        ingredienteSelecionado.nome ||
        ingredienteSelecionado.descricao ||
        `Ingrediente ${formData.ingredienteId}`;

      const taskData = {
        empresaId: empresaId || funcionario.empresaId,
        tipoTarefaId: parseInt(formData.tipoTarefaId) || null,
        ingredienteId: parseInt(formData.ingredienteId),
        ingrediente: nomeIngrediente,
        relatorId: funcionario.id,
        responsavelId: parseInt(formData.responsavelId) || null,
        pedidoId: 2,
        situacao: "PENDENTE",
        dataCriacao: new Date().toISOString().split("T")[0],
        dataLimite: formData.dataLimite || null,
      };

      console.log("Dados da tarefa sendo enviados:", taskData);

      await postgresAPI.createTask(taskData);
      toast.success("Tarefa criada com sucesso!");
      setDialogOpen(false);
      resetarFormulario();
      carregarTarefas();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast.error(
        `Erro ao criar tarefa: ${error.message || "Erro desconhecido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const temFiltrosAtivos = () => {
    return (
      filtros.search ||
      filtros.situacao ||
      filtros.tipoTarefa ||
      filtros.ingrediente ||
      filtros.responsavel ||
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.dataLimiteInicio ||
      filtros.dataLimiteFim
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#333333] text-2xl font-semibold">Tarefas</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`border-[#ebebeb] ${
              temFiltrosAtivos() ? "border-[#002a45] bg-[#002a45]/5" : ""
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {temFiltrosAtivos() && (
              <span className="ml-2 bg-[#002a45] text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(filtros).filter((f) => f !== "").length}
              </span>
            )}
          </Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetarFormulario();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#002a45] hover:bg-[#003a5f]">
                <Plus className="w-4 h-4 mr-2" />
                Criar Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoTarefaId">
                      Tipo de Tarefa <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="tipoTarefaId"
                      value={formData.tipoTarefaId}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          tipoTarefaId: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
                      required
                    >
                      <option value="">Selecione um tipo</option>
                      {tiposTarefa.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ingredienteId">
                      Ingrediente <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="ingredienteId"
                      value={formData.ingredienteId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ingredienteId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
                      required
                      disabled={loadingData}
                    >
                      <option value="">Selecione um ingrediente</option>
                      {ingredientes.map((ingrediente) => (
                        <option key={ingrediente.id} value={ingrediente.id}>
                          {ingrediente.nome ||
                            ingrediente.descricao ||
                            `Ingrediente ${ingrediente.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavelId">
                    Estoquista <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="responsavelId"
                    value={formData.responsavelId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responsavelId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
                    required
                    disabled={loadingData}
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios
                      .filter((f) => f.status === "ATIVO" || !f.status)
                      .map((func) => (
                        <option key={func.id} value={func.id}>
                          {`${func.nome || ""} ${
                            func.sobrenome || ""
                          }`.trim() || func.email}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataLimite">
                    Data Limite <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dataLimite"
                    type="date"
                    value={formData.dataLimite}
                    onChange={(e) =>
                      setFormData({ ...formData, dataLimite: e.target.value })
                    }
                    required
                    className="border-[#ebebeb]"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetarFormulario();
                    }}
                    className="flex-1 border-[#ebebeb]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || loadingData}
                    className="flex-1 bg-[#002a45] hover:bg-[#003a5f]"
                  >
                    {loading ? "Criando..." : "Criar Tarefa"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Painel de Filtros */}
      {filtrosAbertos && (
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#333333]">
              Filtros de Busca
            </h2>
            <div className="flex gap-2">
              {temFiltrosAtivos() && (
                <Button
                  variant="outline"
                  onClick={limparFiltros}
                  className="text-xs border-[#ebebeb]"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setFiltrosAbertos(false)}
                className="border-[#ebebeb]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Busca Geral</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Buscar por texto..."
                  value={filtros.search}
                  onChange={(e) =>
                    setFiltros({ ...filtros, search: e.target.value })
                  }
                  className="pl-10 border-[#ebebeb]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Situação</Label>
              <select
                value={filtros.situacao}
                onChange={(e) =>
                  setFiltros({ ...filtros, situacao: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
              >
                <option value="">Todas</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Tarefa</Label>
              <select
                value={filtros.tipoTarefa}
                onChange={(e) =>
                  setFiltros({ ...filtros, tipoTarefa: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
              >
                <option value="">Todos</option>
                {Array.from(
                  new Set(tarefas.map((t) => t.tipoTarefa).filter(Boolean))
                ).map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Ingrediente</Label>
              <select
                value={filtros.ingrediente}
                onChange={(e) =>
                  setFiltros({ ...filtros, ingrediente: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
              >
                <option value="">Todos</option>
                {Array.from(
                  new Set(tarefas.map((t) => t.ingrediente).filter(Boolean))
                ).map((ing) => (
                  <option key={ing} value={ing}>
                    {ing}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Nome do responsável..."
                  value={filtros.responsavel}
                  onChange={(e) =>
                    setFiltros({ ...filtros, responsavel: e.target.value })
                  }
                  className="pl-10 border-[#ebebeb]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Criação - Início</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataInicio: e.target.value })
                  }
                  className="pl-10 border-[#ebebeb]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Criação - Fim</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataFim: e.target.value })
                  }
                  className="pl-10 border-[#ebebeb]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Limite - Início</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  type="date"
                  value={filtros.dataLimiteInicio}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      dataLimiteInicio: e.target.value,
                    })
                  }
                  className="pl-10 border-[#ebebeb]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Limite - Fim</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <Input
                  type="date"
                  value={filtros.dataLimiteFim}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      dataLimiteFim: e.target.value,
                    })
                  }
                  className="pl-10 border-[#ebebeb]"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Tarefas */}
      <Card className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-[#666666]">
            {tarefasFiltradas.length} de {tarefas.length} tarefa(s)
            {temFiltrosAtivos() && " (filtradas)"}
          </p>
        </div>

        <div className="space-y-4">
          {tarefasFiltradas.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              {temFiltrosAtivos()
                ? "Nenhuma tarefa encontrada com os filtros aplicados."
                : "Nenhuma tarefa cadastrada ainda."}
            </p>
          ) : (
            tarefasFiltradas.map((tarefa) => (
              <div
                key={tarefa.id}
                className="flex items-start justify-between p-5 border border-[#ebebeb] rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[#333333] font-semibold text-lg">
                      {tarefa.tipoTarefa || "Tarefa sem tipo"}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        tarefa.situacao === "CONCLUÍDA" ||
                        tarefa.situacao === "Concluída"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tarefa.situacao || "PENDENTE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-[#666666]">
                    {tarefa.ingrediente && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>
                          <strong>Ingrediente:</strong> {tarefa.ingrediente}
                        </span>
                      </div>
                    )}
                    {tarefa.responsavel && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>Estoquista:</strong> {tarefa.responsavel}
                        </span>
                      </div>
                    )}
                    {tarefa.relator && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>Relator:</strong> {tarefa.relator}
                        </span>
                      </div>
                    )}
                    {tarefa.dataCriacao && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>Criação:</strong>{" "}
                          {new Date(tarefa.dataCriacao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    )}
                    {tarefa.dataLimite && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>Limite:</strong>{" "}
                          {new Date(tarefa.dataLimite).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    )}
                    {tarefa.dataConclusao &&
                      (tarefa.situacao === "CONCLUIDA" ||
                        tarefa.situacao === "Concluída") && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            <strong>Conclusão:</strong>{" "}
                            {new Date(tarefa.dataConclusao).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
