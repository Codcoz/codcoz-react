import { useState, useEffect, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { postgresAPI } from "../lib/api";

export default function FuncionariosPage({ empresaId }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    funcaoId: 1,
    status: "ATIVO",
  });

  const fetchFuncionarios = useCallback(async () => {
    try {
      const data = await postgresAPI.listEmployees(empresaId);
      setFuncionarios(data);
    } catch {
      setFuncionarios([]);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await postgresAPI.updateEmployee(editingId, {
          ...formData,
          empresaId,
        });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        await postgresAPI.createEmployee({
          ...formData,
          empresaId,
          dataContratacao: new Date().toISOString().split("T")[0],
        });
        toast.success("Funcionário cadastrado com sucesso!");
      }

      setDialogOpen(false);
      setFormData({
        nome: "",
        sobrenome: "",
        email: "",
        funcaoId: 1,
        status: "ATIVO",
      });
      setEditingId(null);
      fetchFuncionarios();
    } catch {
      toast.error(
        editingId
          ? "Erro ao atualizar funcionário"
          : "Erro ao cadastrar funcionário"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemitir = async (id) => {
    if (!confirm("Tem certeza que deseja demitir este funcionário?")) return;

    try {
      await postgresAPI.dismissEmployee(id);
      toast.success("Funcionário demitido com sucesso!");
      fetchFuncionarios();
    } catch {
      toast.error("Erro ao demitir funcionário");
    }
  };

  const handleEdit = (funcionario) => {
    setEditingId(funcionario.id);
    setFormData({
      nome: funcionario.nome,
      sobrenome: funcionario.sobrenome,
      email: funcionario.email,
      funcaoId: funcionario.funcaoId || 1,
      status: funcionario.status,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      nome: "",
      sobrenome: "",
      email: "",
      funcaoId: 1,
      status: "ATIVO",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#333333] text-2xl font-semibold">Funcionários</h1>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-[#002a45] hover:bg-[#003a5f]">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? "Editar Funcionário"
                  : "Cadastrar Novo Funcionário"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Sobrenome</Label>
                <Input
                  value={formData.sobrenome}
                  onChange={(e) =>
                    setFormData({ ...formData, sobrenome: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#002a45]"
              >
                {loading
                  ? editingId
                    ? "Atualizando..."
                    : "Cadastrando..."
                  : editingId
                  ? "Atualizar"
                  : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {funcionarios.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              Nenhum funcionário cadastrado ainda.
            </p>
          ) : (
            funcionarios.map((func, index) => (
              <div
                key={func.id || `func-${index}`}
                className="flex items-center justify-between p-4 border border-[#ebebeb] rounded-lg"
              >
                <div>
                  <p className="text-[#333333] font-semibold">
                    {func.nome} {func.sobrenome}
                  </p>
                  <p className="text-sm text-[#666666]">{func.email}</p>
                  <p className="text-xs text-[#666666] mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        func.status === "ATIVO"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {func.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-8 h-8 bg-[#FFA500] hover:bg-[#FF8C00] flex items-center justify-center rounded-lg transition-colors"
                    onClick={() => handleEdit(func)}
                  >
                    <Pencil className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                    onClick={() => handleDemitir(func.id)}
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
