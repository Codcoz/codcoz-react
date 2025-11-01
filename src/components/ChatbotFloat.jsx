import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { mongoAPI } from "../lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function ChatbotFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      mongoAPI.getChatHistory()
        .then((data) => {
          if (data && data.length > 0 && data[0].mensagens) {
            setMensagens(data[0].mensagens);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleEnviar = async () => {
    if (!inputMensagem.trim()) return;

    const novaMensagem = {
      mensagem: inputMensagem,
      origem: "usuario",
      data_hora: new Date().toISOString(),
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    setInputMensagem("");
    setLoading(true);

    setTimeout(() => {
      const resposta = {
        mensagem: "Olá! Como posso ajudar você hoje com o CodCoz?",
        origem: "assistente",
        data_hora: new Date().toISOString(),
      };
      setMensagens((prev) => [...prev, resposta]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#002a45] hover:bg-[#003a5f] text-white rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-200 hover:scale-110"
          aria-label="Abrir Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-[#ebebeb]">
          <div className="bg-[#002a45] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">ChefIA</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#003a5f] rounded-full p-1 transition-colors"
              aria-label="Fechar Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9f9f9]">
            {mensagens.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-center text-[#666666] text-sm">
                  Olá! Sou a ChefIA. Como posso ajudar você hoje?
                </p>
              </div>
            ) : (
              mensagens.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.origem === "usuario" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.origem === "usuario"
                        ? "bg-[#002a45] text-white rounded-br-none"
                        : "bg-white text-[#333333] border border-[#ebebeb] rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.mensagem}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#333333] border border-[#ebebeb] p-3 rounded-lg rounded-bl-none">
                  <p className="text-sm">Digitando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#ebebeb] bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={inputMensagem}
                onChange={(e) => setInputMensagem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleEnviar()}
                placeholder="Digite sua mensagem..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleEnviar}
                disabled={loading}
                className="bg-[#002a45] hover:bg-[#003a5f] p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

