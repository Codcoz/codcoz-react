import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent } from "../components/ui/Dialog";
import { Upload, X, Check } from "lucide-react";
import { toast } from "sonner";

export default function PedidosPage({ empresaId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Selecionar, 2: Revisar, 3: Finalizar
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportClick = () => {
    setIsModalOpen(true);
  };

  const handleStepContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      setIsModalOpen(false);
      setCurrentStep(1);
      setSelectedFile(null);
      toast.success("Importação concluída com sucesso!");
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
        <p className="text-center text-[#666666] py-8">
          Nenhuma nota fiscal importada ainda.
        </p>
      </Card>

      {/* Modal de Importação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <div className="relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setCurrentStep(1);
                setSelectedFile(null);
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
                  className="flex flex-col items-center flex-1 relative"
                >
                  {/* Círculo do step */}
                  <div className="relative flex items-center justify-center w-full mb-3">
                    {/* Linha antes do círculo */}
                    {index > 0 && (
                      <div
                        className={`absolute left-0 h-0.5 ${
                          step.completed ? "bg-[#002a45]" : "bg-[#ebebeb]"
                        }`}
                        style={{ width: 'calc(50% - 20px)', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    )}
                    
                    {/* Círculo */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 relative z-10 ${
                        step.completed || currentStep === step.number
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
                    
                    {/* Linha depois do círculo */}
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute right-0 h-0.5 ${
                          step.completed ? "bg-[#002a45]" : "bg-[#ebebeb]"
                        }`}
                        style={{ width: 'calc(50% - 20px)', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    )}
                  </div>
                  
                  {/* Texto do step */}
                  <p
                    className={`text-sm font-medium text-center ${
                      currentStep === step.number
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
            <div className="mb-8">
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
                  {/* Placeholder para produtos do XML */}
                  <div className="border border-[#ebebeb] rounded-lg overflow-hidden">
                    <div className="bg-[#f8f9fa] p-4 border-b border-[#ebebeb]">
                      <h4 className="font-semibold text-[#333333]">Produtos</h4>
                    </div>
                    <div className="p-4 text-center text-[#666666]">
                      Aguardando dados do XML...
                    </div>
                  </div>
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
              <div className="flex justify-end gap-4 pt-6 border-t border-[#ebebeb]">
                <Button
                  onClick={handleStepBack}
                  variant="outline"
                  className="border-[#ebebeb] text-[#333333] hover:bg-[#ebebeb]"
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleStepContinue}
                  className="bg-[#002a45] hover:bg-[#003a5f]"
                  disabled={currentStep === 1 && !selectedFile}
                >
                  {currentStep === 2 ? "Finalizar" : "Continuar"}
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex justify-end pt-6 border-t border-[#ebebeb]">
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

