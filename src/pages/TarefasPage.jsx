import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { postgresAPI } from "../lib/api";

export default function TarefasPage({ empresaId }) {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
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
      toast.success("Tarefa criada com sucesso!");
      setDialogOpen(false);
      setFormData({ tipoTarefa: "", descricao: "", responsavel: "", dataLimite: "", situacao: "PENDENTE" });
    } catch {
      toast.error("Erro ao criar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarTarefa = async (id) => {
    try {
      const response = await fetch(`http://codcoz-api-postgres.koyeb.app/tarefa/finalizar-tarefa/${id}`, {
        method: "PUT",
      });
      
      if (response.ok) {
        toast.success("Tarefa finalizada com sucesso!");
        const email = sessionStorage.getItem("userEmail");
        if (email) {
          const hoje = new Date().toISOString().split("T")[0];
          postgresAPI.getTasksByDate(email, hoje)
            .then((data) => setTarefas(Array.isArray(data) ? data : []));
        }
      } else {
        toast.error("Erro ao finalizar tarefa");
      }
    } catch {
      toast.error("Erro ao finalizar tarefa");
    }
  };

  const handleRemoverTarefa = async (id) => {
    if (!confirm("Tem certeza que deseja remover esta tarefa?")) return;

    try {
      toast.success("Tarefa removida com sucesso!");
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
        <div className="space-y-4">
          {tarefas.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              Nenhuma tarefa cadastrada ainda.
            </p>
          ) : (
            tarefas.map((tarefa) => (
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
                    className="w-8 h-8 bg-[#FFA500] hover:bg-[#FF8C00] flex items-center justify-center rounded-lg transition-colors"
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

