import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle, Search } from "lucide-react";
import { postgresAPI } from "../lib/api";

export default function TarefasPage({ empresaId }) {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipoTarefa: "",
    descricao: "",
    responsavel: "",
    dataLimite: "",
    situacao: "PENDENTE",
  });

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    if (email) {
      const hoje = new Date().toISOString().split("T")[0];
      postgresAPI.getTasksByDate(email, hoje)
        .then((data) => {
          setTarefas(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setTarefas([]);
        });
    }
  }, [empresaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = sessionStorage.getItem("userEmail");
      if (!email) {
        toast.error("Email não encontrado na sessão");
        return;
      }

      // Buscar funcionário para obter IDs necessários
      const funcionario = await postgresAPI.getEmployeeByEmail(email);
      const responsavel = await postgresAPI.getEmployeeByEmail(formData.responsavel);

      const taskData = {
        empresaId: funcionario.empresaId,
        tipoTarefaId: 1, // TODO: implementar seleção de tipo de tarefa
        ingredienteId: null,
        relatorId: funcionario.id,
        responsavelId: responsavel?.id || funcionario.id,
        pedidoId: null,
        situacao: formData.situacao || "PENDENTE",
        dataTarefa: new Date().toISOString().split("T")[0],
        dataLimite: formData.dataLimite || null,
      };

      await postgresAPI.createTask(taskData);
      toast.success("Tarefa criada com sucesso!");
      setDialogOpen(false);
      setFormData({ tipoTarefa: "", descricao: "", responsavel: "", dataLimite: "", situacao: "PENDENTE" });
      
      // Recarregar tarefas
      const hoje = new Date().toISOString().split("T")[0];
      const tarefas = await postgresAPI.getTasksByDate(email, hoje);
      setTarefas(Array.isArray(tarefas) ? tarefas : []);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast.error("Erro ao criar tarefa: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarTarefa = async (id) => {
    try {
      await postgresAPI.finishTask(id);
      toast.success("Tarefa finalizada com sucesso!");
      const email = sessionStorage.getItem("userEmail");
      if (email) {
        const hoje = new Date().toISOString().split("T")[0];
        postgresAPI.getTasksByDate(email, hoje)
          .then((data) => setTarefas(Array.isArray(data) ? data : []));
      }
    } catch {
      toast.error("Erro ao finalizar tarefa");
    }
  };

  const handleRemoverTarefa = async (id) => {
    if (!confirm("Tem certeza que deseja remover esta tarefa?")) return;

    try {
      await postgresAPI.deleteTask(id);
      toast.success("Tarefa removida com sucesso!");
      const email = sessionStorage.getItem("userEmail");
      if (email) {
        const hoje = new Date().toISOString().split("T")[0];
        postgresAPI.getTasksByDate(email, hoje)
          .then((data) => setTarefas(Array.isArray(data) ? data : []));
      }
    } catch {
      toast.error("Erro ao remover tarefa");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#333333] text-2xl font-semibold">Tarefas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#002a45] hover:bg-[#003a5f]">
              <Plus className="w-4 h-4 mr-2" />
              Criar Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoTarefa">Tipo de Tarefa</Label>
                <Input
                  id="tipoTarefa"
                  value={formData.tipoTarefa}
                  onChange={(e) => setFormData({ ...formData, tipoTarefa: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável (Email)</Label>
                <Input
                  id="responsavel"
                  type="email"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataLimite">Data Limite</Label>
                <Input
                  id="dataLimite"
                  type="date"
                  value={formData.dataLimite}
                  onChange={(e) => setFormData({ ...formData, dataLimite: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#002a45] hover:bg-[#003a5f]">
                {loading ? "Criando..." : "Criar Tarefa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {/* Barra de pesquisa */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <Input
              type="text"
              placeholder="Pesquisar tarefa por nome/tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {tarefas.filter((tarefa) =>
            (tarefa.tipoTarefa || tarefa.tipo || "").toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              {searchQuery
                ? "Nenhuma tarefa encontrada com esse nome."
                : "Nenhuma tarefa cadastrada ainda."}
            </p>
          ) : (
            tarefas
              .filter((tarefa) =>
                (tarefa.tipoTarefa || tarefa.tipo || "").toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((tarefa) => (
              <div
                key={tarefa.id}
                className="flex items-center justify-between p-4 border border-[#ebebeb] rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[#333333] font-semibold">
                      {tarefa.tipoTarefa || tarefa.tipo}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        tarefa.situacao === "CONCLUIDA" || tarefa.situacao === "Concluída"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tarefa.situacao}
                    </span>
                  </div>
                  {tarefa.ingrediente && (
                    <p className="text-sm text-[#666666] mt-1">
                      Ingrediente: {tarefa.ingrediente}
                    </p>
                  )}
                  {tarefa.dataLimite && (
                    <p className="text-sm text-[#666666]">
                      Data Limite: {new Date(tarefa.dataLimite).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {(tarefa.situacao === "PENDENTE" || tarefa.situacao === "Pendente") && (
                    <button
                      className="w-8 h-8 bg-green-500 hover:bg-green-600 flex items-center justify-center rounded-lg transition-colors"
                      onClick={() => handleFinalizarTarefa(tarefa.id)}
                      title="Finalizar tarefa"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    className="w-8 h-8 bg-blue-400 hover:bg-blue-500 flex items-center justify-center rounded-lg transition-colors"
                    onClick={() => {}}
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                    onClick={() => handleRemoverTarefa(tarefa.id)}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

