import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Send } from "lucide-react";
import { mongoAPI } from "../lib/api";

export default function ChatPage() {
  const [mensagens, setMensagens] = useState([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mongoAPI.getChatHistory()
      .then((data) => {
        if (data && data.length > 0 && data[0].mensagens) {
          setMensagens(data[0].mensagens);
        }
      })
      .catch(() => {});
  }, []);

  const handleEnviar = async () => {
    if (!inputMensagem.trim()) return;

    const novaMensagem = {
      mensagem: inputMensagem,
      origem: "usuario",
      data_hora: new Date().toISOString(),
    };

    setMensagens([...mensagens, novaMensagem]);
    setInputMensagem("");
    setLoading(true);

    setTimeout(() => {
      const resposta = {
        mensagem: "Olá! Como posso ajudar você hoje?",
        origem: "assistente",
        data_hora: new Date().toISOString(),
      };
      setMensagens((prev) => [...prev, resposta]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-[#333333] mb-6 text-2xl font-semibold">ChefIA</h1>

      <Card className="p-6 flex flex-col h-[calc(100vh-200px)]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {mensagens.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              Inicie uma conversa com a ChefIA.
            </p>
          ) : (
            mensagens.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.origem === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.origem === "usuario"
                      ? "bg-[#002a45] text-white"
                      : "bg-[#ebebeb] text-[#333333]"
                  }`}
                >
                  <p>{msg.mensagem}</p>
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
              <div className="bg-[#ebebeb] text-[#333333] p-3 rounded-lg">
                <p>Digitando...</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={inputMensagem}
            onChange={(e) => setInputMensagem(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEnviar()}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button onClick={handleEnviar} disabled={loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

