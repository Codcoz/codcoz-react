import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { Toaster } from "sonner";
import { postgresAPI } from "./lib/api";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import PedidosPage from "./pages/PedidosPage";
import FuncionariosPage from "./pages/FuncionariosPage";
import ProdutosPage from "./pages/ProdutosPage";
import GastronomiaPage from "./pages/GastronomiaPage";
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login.jsx";
import ChatbotFloat from "./components/ChatbotFloat";
import TarefasPage from "./pages/TarefasPage";
import RelatoriosPage from "./pages/RelatoriosPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(72);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do funcionário usando o email autenticado
          const employee = await postgresAPI.getEmployeeByEmail(
            firebaseUser.email
          );
          setUser({
            email: employee.email,
            nome: employee.nome,
            sobrenome: employee.sobrenome,
            empresaId: employee.empresaId,
          });
          // Sincronizar sessionStorage apenas se autenticado
          sessionStorage.setItem("userEmail", firebaseUser.email);
        } catch (error) {
          // Se não encontrar funcionário, limpar sessão
          console.error("Erro ao buscar dados do funcionário:", error);
          await signOut(auth);
          sessionStorage.removeItem("userEmail");
          setUser(null);
        }
      } else {
        // Usuário não autenticado, limpar dados
        sessionStorage.removeItem("userEmail");
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup: desinscrever listener quando componente desmontar
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("userEmail");
      setUser(null);
      setCurrentPage("home");
    } catch {
      sessionStorage.removeItem("userEmail");
      setUser(null);
      setCurrentPage("home");
    }
  };

  const renderPage = () => {
    if (!user) return null;

    switch (currentPage) {
      case "pedidos":
        return <TarefasPage empresaId={user.empresaId} />;
      case "funcionarios":
        return <FuncionariosPage empresaId={user.empresaId} />;
      case "produtos":
        return <ProdutosPage empresaId={user.empresaId} />;
      case "gastronomia":
        return <GastronomiaPage empresaId={user.empresaId} />;
      case "xml":
        return <PedidosPage empresaId={user.empresaId} />;
      case "tarefas":
        return <TarefasPage empresaId={user.empresaId} />;
      case "relatorios":
        return <RelatoriosPage empresaId={user.empresaId} />;
      case "chat":
        return <ChatPage />;
      case "home":
      default:
        return <Home empresaId={user.empresaId} onNavigate={setCurrentPage} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebebeb] flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebebeb] flex relative">
      <div className="fixed left-0 top-0 h-screen z-50">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onWidthChange={setSidebarWidth}
        />
      </div>

      <div
        className="flex-1 min-w-0 transition-all duration-200 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Header
          userName={`${user.nome} ${user.sobrenome}`.trim()}
          userEmail={user.email}
          userRole="Gestor"
          userId={user.empresaId?.toString() || ""}
          sidebarWidth={sidebarWidth}
          onLogout={handleLogout}
          onNavigate={setCurrentPage}
        />

        <div className="pt-[88px] min-h-screen">
          <div className="p-8">{renderPage()}</div>
        </div>
      </div>

      <ChatbotFloat />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
