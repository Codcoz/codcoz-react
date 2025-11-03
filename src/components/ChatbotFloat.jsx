import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChatbotFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState([
    { mensagem: "Oi, como posso te ajudar?", origem: "assistente", data_hora: new Date().toISOString() },
  ]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const renderFormatted = (texto) => {
    if (!texto) return null;
    const DOUBLE_TOKEN = "%%DOUBLE_ASTERISK%%";
    const safeText = texto.replace(/\*\*/g, DOUBLE_TOKEN);
    const parts = [];
    const regex = /\*([^*]+)\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(safeText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(safeText.slice(lastIndex, match.index));
      }
      parts.push({ bold: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < safeText.length) {
      parts.push(safeText.slice(lastIndex));
    }
    const nodes = [];
    parts.forEach((p, i) => {
      if (typeof p === "string") {
        const restored = p.replace(new RegExp(DOUBLE_TOKEN, "g"), "**");
        const segs = restored.split("\n");
        segs.forEach((s, j) => {
          if (j > 0) nodes.push(<br key={`br-${i}-${j}`} />);
          if (s) nodes.push(s);
        });
      } else {
        nodes.push(
          <strong key={`s-${i}`} className="font-semibold">
            {p.bold}
          </strong>
        );
      }
    });
    return nodes;
  };

  const handleEnviar = async () => {
    if (!inputMensagem.trim()) return;
    const textoEnviar = inputMensagem;
    const novaMensagem = { mensagem: textoEnviar, origem: "usuario", data_hora: new Date().toISOString() };
    setMensagens((prev) => [...prev, novaMensagem]);
    setInputMensagem("");
    setLoading(true);
    try {
      const resposta = await fetch("https://codcoz-chefia.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: textoEnviar, empresa_id: 1, gestor_id: 1 }),
      });
      if (!resposta.ok) {
        const text = await resposta.text().catch(() => "");
        throw new Error(`Status ${resposta.status} ${resposta.statusText} - ${text}`);
      }
      const data = await resposta.json();
      const mensagemTexto = data?.resposta ?? "Não foi possível obter resposta do servidor.";
      const mensagemBot = { mensagem: mensagemTexto, origem: "assistente", data_hora: new Date().toISOString() };
      setMensagens((prev) => [...prev, mensagemBot]);
    } catch (err) {
      console.error("Erro ao chamar API /chat:", err);
      setMensagens((prev) => [
        ...prev,
        { mensagem: "Não foi possível obter resposta do servidor.", origem: "assistente", data_hora: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
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

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-[#ebebeb]">
          <div className="bg-[#002a45] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">ChefIA</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-[#003a5f] rounded-full p-1 transition-colors" aria-label="Fechar Chatbot">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9f9f9]">
            {mensagens.map((msg, index) => (
              <div key={index} className={`flex ${msg.origem === "usuario" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.origem === "usuario" ? "bg-[#002a45] text-white rounded-br-none" : "bg-white text-[#333333] border border-[#ebebeb] rounded-bl-none"}`}>
                  <p className="text-sm leading-relaxed break-words">{renderFormatted(msg.mensagem)}</p>
                  <p className="text-xs mt-1 opacity-70">{new Date(msg.data_hora || new Date().toISOString()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#333333] border border-[#ebebeb] p-3 rounded-lg rounded-bl-none">
                  <p className="text-sm">Digitando...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#ebebeb] bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                value={inputMensagem}
                onChange={(e) => setInputMensagem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                placeholder="Digite sua mensagem..."
                className="flex-1 text-sm border border-[#dcdcdc] rounded-lg px-3 py-2 focus:outline-none"
              />
              <button onClick={handleEnviar} disabled={loading} className="bg-[#002a45] hover:bg-[#003a5f] text-white p-2 rounded-lg transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
