import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { toast } from "sonner";
import { Plus, Pencil, UserX } from "lucide-react";
import { postgresAPI } from "../lib/api";

export default function FuncionariosPage({ empresaId }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    funcaoId: 1,
    status: "ATIVO",
  });

  useEffect(() => {
    // TODO: Implementar busca de funcionários quando API estiver disponível
  }, [empresaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postgresAPI.createEmployee({
        ...formData,
        empresaId,
        dataContratacao: new Date().toISOString().split("T")[0],
      });

      toast.success("Funcionário cadastrado com sucesso!");
      setDialogOpen(false);
      setFormData({ nome: "", sobrenome: "", email: "", funcaoId: 1, status: "ATIVO" });
    } catch (error) {
      toast.error("Erro ao cadastrar funcionário");
    } finally {
      setLoading(false);
    }
  };

  const handleDemitir = async (email) => {
    if (!confirm("Tem certeza que deseja demitir este funcionário?")) return;

    try {
      // TODO: Implementar demissão via API
      toast.success("Funcionário demitido com sucesso!");
    } catch (error) {
      toast.error("Erro ao demitir funcionário");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#333333] text-2xl font-semibold">Funcionários</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#002a45] hover:bg-[#003a5f]">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Sobrenome</Label>
                <Input
                  value={formData.sobrenome}
                  onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#002a45]">
                {loading ? "Cadastrando..." : "Cadastrar"}
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
            funcionarios.map((func) => (
              <div key={func.email} className="flex items-center justify-between p-4 border border-[#ebebeb] rounded-lg">
                <div>
                  <p className="text-[#333333]">{func.nome} {func.sobrenome}</p>
                  <p className="text-sm text-[#666666]">{func.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDemitir(func.email)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

