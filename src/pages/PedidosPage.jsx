import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Upload } from "lucide-react";

export default function PedidosPage({ empresaId }) {
  return (
    <div>
      <h1 className="text-[#333333] mb-6 text-2xl font-semibold">Pedidos e Notas Fiscais</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-[#333333] mb-4 font-semibold">Importar XML de Nota Fiscal</h2>
        <p className="text-[#666666] mb-4">
          Importe arquivos XML de notas fiscais recebidas de fornecedores.
        </p>
        <Button className="bg-[#002a45] hover:bg-[#003a5f]">
          <Upload className="w-4 h-4 mr-2" />
          Selecionar Arquivo XML
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-[#333333] mb-4 font-semibold">Notas Fiscais Importadas</h2>
        <p className="text-center text-[#666666] py-8">
          Nenhuma nota fiscal importada ainda.
        </p>
      </Card>
    </div>
  );
}

