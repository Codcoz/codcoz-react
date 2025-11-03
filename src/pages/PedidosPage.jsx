import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { pythonAPI } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent } from "../components/ui/Dialog";
import { Upload, X, Check } from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://codcoz-xml-import.onrender.com/read_xml";
const API_INSERT_URL = "https://codcoz-xml-import.onrender.com/insert_xml";

export default function PedidosPage({ empresaId }) {

  const currentEmpresaId = empresaId || 1;

  const [pedidos, setPedidos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Selecionar, 2: Revisar, 3: Finalizar
  const [selectedFile, setSelectedFile] = useState(null);
  const [xmlData, setXmlData] = useState(null); // Novo estado para os dados do XML
  const [isLoading, setIsLoading] = useState(false); // Novo estado para o loading
  const [loading, setLoading] = useState({
    pedidos: true,
  });

  useEffect(() => {
    pythonAPI
      .getOrders(empresaId)
      .then((data) => {
        const orders = data.pedidos;
        setPedidos(Array.isArray(orders) ? orders : []);
        setLoading((prev) => ({ ...prev, pedidos: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, pedidos: false }));
      });
  }, [empresaId]);




  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    setIsModalOpen(true);
  };

  const sendXmlToApi = async () => {
    if (!selectedFile) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    setIsLoading(true);
    setXmlData(null); // Limpa dados anteriores

    const formData = new FormData();
    // A chave 'file' é a que a API espera para o arquivo XML
    formData.append("file", selectedFile);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        // O cabeçalho 'Content-Type' é automaticamente definido como 'multipart/form-data'
        // pelo navegador quando você usa um objeto FormData, não precisa ser setado manualmente.
      });

      if (!response.ok) {
        // Tenta ler a mensagem de erro do corpo da resposta, se disponível
        const errorText = await response.text();
        throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setXmlData(data);
      setCurrentStep(2); // Avança para o Passo 2 (Revisar)
    } catch (error) {
      console.error("Erro ao processar XML:", error);
      toast.error(`Falha na importação do XML: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const insertXmlToApi = async () => {
    setIsLoading(true);

    const formData = new FormData();
    // 1. Anexa o arquivo XML
    formData.append("file", selectedFile);
    // 2. Anexa o empresa_id (valor 1, conforme solicitado)
    formData.append("empresa_id", currentEmpresaId.toString());

    try {
      const response = await fetch(API_INSERT_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
      }

      // Se a API retornar sucesso (status 200/201), avança para o Passo 3
      setCurrentStep(3);
    } catch (error) {
      console.error("Erro ao inserir XML:", error);
      toast.error(`Falha na inserção do XML: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepContinue = () => {
    if (currentStep === 1) {
      // No Passo 1, ao clicar em "Continuar", chamamos a API
      sendXmlToApi();
    } else if (currentStep === 2) {
      // No Passo 2, se os dados estiverem revisados, avança para o Passo 3
      insertXmlToApi();
    } else {
      // No Passo 3, finaliza
      setIsModalOpen(false);
      setCurrentStep(1);
      setSelectedFile(null);
      setXmlData(null);
      toast.success("Importação concluída com sucesso!");
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Se voltar do Passo 2 para o 1, limpa os dados do XML
      if (currentStep === 2) {
        setXmlData(null);
      }
    }
  };

  const steps = [
    { number: 1, label: "Selecionar", completed: currentStep > 1 },
    { number: 2, label: "Revisar", completed: currentStep > 2 },
    { number: 3, label: "Finalizar", completed: currentStep > 3 },
  ];

  return (
    <div>
      <h1 className="text-[#333333] mb-6 text-2xl font-semibold">Pedidos e Notas Fiscais</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-[#333333] mb-4 font-semibold">Importar XML de Nota Fiscal</h2>
        <p className="text-[#666666] mb-4">
          Importe arquivos XML de notas fiscais recebidas de fornecedores.
        </p>
        <Button
          onClick={handleImportClick}
          className="bg-[#002a45] hover:bg-[#003a5f]"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar XML
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-[#333333] mb-4 font-semibold">Notas Fiscais Importadas</h2>

        <>
          {loading.pedidos ? (
            <p className="text-center text-[#666666] py-8">
              Carregando pedidos...
            </p>
          ) : pedidos.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              Nenhuma nota fiscal importada ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="p-4 border border-[#ebebeb] rounded-lg hover:border-[#002a45] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[#333333] font-semibold">
                      {pedido.descricao || "-"}
                    </p>

                    <span className="px-2 py-1 text-xs bg-[#002a45]/10 text-[#002a45] rounded">
                      {pedido.data_compra.slice(0, 10) || "-"}
                    </span>

                  </div>
                  <p className="text-xs text-[#666666] mb-2">
                    {pedido.cod_nota_fiscal || "Sem nota fiscal"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>


        {/* <p className="text-center text-[#666666] py-8">
          Nenhuma nota fiscal importada ainda.
        </p> */}
      </Card>

      {/* Modal de Importação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setCurrentStep(1);
                setSelectedFile(null);
                setXmlData(null); // Limpa dados ao fechar
              }}
              className="absolute right-0 top-0 text-[#666666] hover:text-[#333333]"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#333333] mb-8 pr-8">
              Importar XML
            </h2>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center flex-1"
                >
                  <div className="relative flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold border-2 ${step.completed || currentStep === step.number
                        ? "bg-[#002a45] text-white border-[#002a45]"
                        : "bg-white text-[#666666] border-[#ebebeb]"
                        }`}
                    >
                      {step.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-full ${step.completed ? "bg-[#002a45]" : "bg-[#ebebeb]"
                          }`}
                      />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${currentStep === step.number
                      ? "text-[#002a45]"
                      : "text-[#666666]"
                      }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="my-8">
              {currentStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-4">
                    Selecionar Arquivo
                  </h3>
                  <div className="border-2 border-dashed border-[#ebebeb] rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="xml-file-input-modal"
                      accept=".xml"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-16 h-16 text-[#002a45] mx-auto mb-4" />
                    <p className="text-[#666666] mb-4">
                      Selecione o arquivo XML para importar
                    </p>
                    <Button
                      onClick={() =>
                        document.getElementById("xml-file-input-modal").click()
                      }
                      className="bg-[#002a45] hover:bg-[#003a5f]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Arquivo
                    </Button>
                    {selectedFile && (
                      <p className="mt-4 text-sm text-[#666666]">
                        Arquivo selecionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-4">
                    Revisar Dados
                  </h3>
                  {isLoading && (
                    <div className="text-center py-8">
                      <p className="text-[#002a45] font-semibold">Processando XML... Aguarde.</p>
                    </div>
                  )}
                  {!isLoading && xmlData && (
                    <div className="space-y-4">
                      <div className="border border-[#ebebeb] rounded-lg p-4">
                        <h4 className="font-semibold text-[#333333] mb-2">Detalhes da Nota Fiscal</h4>
                        <p className="text-sm text-[#666666]">
                          <strong>ID NFe:</strong> {xmlData.id_nfe}
                        </p>
                        <p className="text-sm text-[#666666]">
                          <strong>Data de Emissão:</strong> {new Date(xmlData.data_emissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="border border-[#ebebeb] rounded-lg overflow-hidden">
                        <div className="bg-[#f8f9fa] p-4 border-b border-[#ebebeb]">
                          <h4 className="font-semibold text-[#333333]">Produtos ({xmlData.produtos.length})</h4>
                        </div>
                        <div className="p-4">
                          {xmlData.produtos.map((produto, index) => (
                            <div key={index} className="mb-4 p-3 border-b last:border-b-0">
                              <p className="font-medium text-[#333333]">{produto.nome_produto}</p>
                              <div className="grid grid-cols-2 gap-1 text-sm text-[#666666]">
                                <p><strong>EAN:</strong> {produto.ean}</p>
                                <p><strong>Quantidade:</strong> {produto.quantidade} {produto.unidade_medida}</p>
                                <p><strong>Valor Unitário:</strong> R$ {parseFloat(produto.valor_unitario).toFixed(2)}</p>
                                <p><strong>Valor Total:</strong> R$ {parseFloat(produto.valor_total).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {!isLoading && !xmlData && (
                    <div className="border border-[#ebebeb] rounded-lg overflow-hidden">
                      <div className="bg-[#f8f9fa] p-4 border-b border-[#ebebeb]">
                        <h4 className="font-semibold text-[#333333]">Produtos</h4>
                      </div>
                      <div className="p-4 text-center text-[#666666]">
                        Aguardando dados do XML...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#333333] mb-2">
                    Solicitação enviada com sucesso!
                  </h3>
                  <p className="text-[#666666]">
                    Você pode acompanhar o andamento dessa solicitação no
                    histórico.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            {currentStep < 3 && (
              <div className="flex justify-end gap-4 pt-4 border-t border-[#ebebeb]">
                <Button
                  onClick={handleStepBack}
                  variant="outline"
                  className="border-[#ebebeb] text-[#333333] hover:bg-[#ebebeb]"
                  disabled={currentStep === 1 || isLoading}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleStepContinue}
                  className="bg-[#002a45] hover:bg-[#003a5f]"
                  disabled={currentStep === 1 && (!selectedFile || isLoading) || currentStep === 2 && !xmlData}
                >
                  {isLoading ? "Carregando..." : currentStep === 2 ? "Finalizar" : "Continuar"}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex justify-end pt-4 border-t border-[#ebebeb]">
                <Button
                  onClick={handleStepContinue}
                  className="bg-[#002a45] hover:bg-[#003a5f]"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
