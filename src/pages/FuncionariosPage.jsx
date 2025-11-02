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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { postgresAPI } from "../lib/api";

export default function FuncionariosPage({ empresaId }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      // Garantir que todos os funcionários tenham id
      const funcionariosComId = Array.isArray(data)
        ? data.map((func) => ({
            ...func,
            id: func.id || func.funcionarioId || func.funcId || func._id,
          }))
        : [];
      setFuncionarios(funcionariosComId);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
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
          empresaId: empresaId,
          funcaoId: formData.funcaoId || 1,
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          status: formData.status?.toUpperCase() || "ATIVO",
          email: formData.email,
        });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        await postgresAPI.createEmployee({
          empresaId: empresaId,
          funcaoId: 1,
          nome: formData.nome.trim(),
          sobrenome: formData.sobrenome.trim(),
          status: "ATIVO",
          email: formData.email.trim(),
          dataContratacao: new Date().toISOString().split("T")[0],
        });
        toast.success("Funcionário cadastrado com sucesso!");
      }

      handleDialogOpenChange(false);
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
    if (!id) {
      toast.error("ID do funcionário não encontrado");
      return;
    }

    if (!confirm("Tem certeza que deseja demitir este funcionário?")) return;

    try {
      await postgresAPI.dismissEmployee(id);
      toast.success("Funcionário demitido com sucesso!");
      fetchFuncionarios();
    } catch (error) {
      console.error("Erro ao demitir funcionário:", error);
      toast.error("Erro ao demitir funcionário");
    }
  };

  const handleEdit = (funcionario) => {
    // Garantir que temos o id do funcionário
    const funcionarioId =
      funcionario.id ||
      funcionario.funcionarioId ||
      funcionario.funcId ||
      funcionario._id;
    if (!funcionarioId) {
      toast.error("ID do funcionário não encontrado");
      return;
    }
    setEditingId(funcionarioId);
    setFormData({
      nome: funcionario.nome || "",
      sobrenome: funcionario.sobrenome || "",
      email: funcionario.email || "",
      funcaoId: funcionario.funcaoId || 1,
      status: funcionario.status || "ATIVO",
    });
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({
        nome: "",
        sobrenome: "",
        email: "",
        funcaoId: 1,
        status: "ATIVO",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#333333] text-2xl font-semibold">Funcionários</h1>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#002a45] hover:bg-[#003a5f]"
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  nome: "",
                  sobrenome: "",
                  email: "",
                  funcaoId: 1,
                  status: "ATIVO",
                });
              }}
            >
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
        {/* Barra de pesquisa */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <Input
              type="text"
              placeholder="Pesquisar funcionário por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {funcionarios.filter((func) =>
            `${func.nome} ${func.sobrenome}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              {searchQuery
                ? "Nenhum funcionário encontrado com esse nome."
                : "Nenhum funcionário cadastrado ainda."}
            </p>
          ) : (
            funcionarios
              .filter((func) =>
                `${func.nome} ${func.sobrenome}`
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
              .map((func, index) => {
                // Garantir que temos o id do funcionário (já mapeado no fetchFuncionarios)
                const funcionarioId = func.id;
                return (
                  <div
                    key={funcionarioId || `func-${index}`}
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
                            func.status === "ATIVO" || func.status === "Ativo"
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
                        className="w-8 h-8 bg-blue-400 hover:bg-blue-500 flex items-center justify-center rounded-lg transition-colors"
                        onClick={() => handleEdit(func)}
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (!funcionarioId) {
                            toast.error("ID do funcionário não encontrado");
                            return;
                          }
                          handleDemitir(funcionarioId);
                        }}
                        disabled={!funcionarioId}
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </Card>
    </div>
  );
}
