import { useState } from "react";
import {
  Bell,
  HelpCircle,
  Search,
  X,
  LogOut,
  Mail,
  Building2,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";
import { postgresAPI } from "../lib/api";

export default function Header({
  userName = "Gestor",
  userEmail = "",
  userRole = "Gestor",
  userImage = null,
  sidebarWidth = 72,
  onLogout,
  onNavigate,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fullName = userName || "Janaina Mocada";
  const email = userEmail || "janaina.mocada@codcoz.com";
  const role = userRole || "Gestor";

  const searchResults = [
    {
      label: "Produto",
      action: () => onNavigate?.("produtos"),
    },
    { label: "Importar XML", action: () => onNavigate?.("xml") },
    {
      label: "Marcar Auditoria",
      action: () => onNavigate?.("pedidos"),
    },
    {
      label: "Visualizar Relatórios",
      action: () => onNavigate?.("relatorios"),
    },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(e.target.value.length > 0);
  };

  const handleResultClick = (result) => {
    result.action();
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  const handleVerMais = async () => {
    setShowUserDropdown(false);
    setShowProfileModal(true);

    if (!employeeData && userEmail) {
      setLoadingProfile(true);
      try {
        const data = await postgresAPI.getEmployeeByEmail(userEmail);
        setEmployeeData(data);
      } catch (error) {
        console.error("Erro ao buscar dados do funcionário:", error);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  return (
    <div
      className="h-[88px] bg-transparent z-40 transition-all duration-200 ease-in-out flex items-center justify-between px-6"
      style={{ marginLeft: `${sidebarWidth}px` }}
    >
      {/* Search */}
      <div className="relative w-[576px] bg-neutral-100 rounded-[30px] p-[8px] flex items-center gap-[12px]">
        <Search className="w-6 h-6 text-[#002A45] ml-[12px]" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
          placeholder="Pesquisar..."
          className="flex-1 bg-transparent border-none outline-none text-[#333333] text-sm placeholder:text-[#666666]"
        />

        {showSearchDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSearchDropdown(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-[#ebebeb] overflow-hidden z-50">
              {searchResults
                .filter((r) =>
                  r.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-[#ebebeb] transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">{result.icon}</span>
                    <span className="text-[#333333] text-sm">
                      {result.label}
                    </span>
                  </button>
                ))}
              {searchResults.filter((r) =>
                r.label.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="px-4 py-3 text-[#666666] text-sm">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-[24px]">
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="focus:outline-none"
          >
            <Avatar className="w-10 h-10">
              {userImage ? (
                <AvatarImage src={userImage} alt={fullName} />
              ) : (
                <AvatarFallback className="bg-yellow-400 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </button>

          {showUserDropdown && (
            <>
              <div
                className="fixed inset-0 z-50"
                onClick={() => setShowUserDropdown(false)}
              />

              <div className="absolute right-0 top-[48px] w-[360px] bg-white rounded-lg shadow-lg p-6 z-50">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 shrink-0">
                    {userImage ? (
                      <AvatarImage src={userImage} alt={fullName} />
                    ) : (
                      <AvatarFallback className="bg-yellow-400 text-white font-semibold text-lg">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#333333] font-semibold text-base mb-1 truncate">
                      {fullName}
                    </h3>
                    <p className="text-[#333333] text-sm mb-4 truncate">
                      {email}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[#333333] font-semibold text-sm mb-1">
                          Função
                        </p>
                        <p className="text-[#333333] text-sm">{role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowUserDropdown(false)}
                    className="text-[#666666] hover:text-[#333333] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-[#ebebeb] space-y-3">
                  <Button
                    className="w-full bg-[#002a45] hover:bg-[#003a5f] text-white"
                    onClick={handleVerMais}
                  >
                    Ver mais
                  </Button>

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 transition-colors"
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onLogout) {
                        onLogout();
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#002a45]">
              Perfil do Usuário
            </DialogTitle>
          </DialogHeader>

          {loadingProfile ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002a45]"></div>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {/* Header Section with Avatar */}
              <div className="flex flex-col items-center bg-gradient-to-br from-[#002a45] to-[#003a5f] rounded-lg p-8 text-white">
                <Avatar className="w-24 h-24 mb-4 ring-4 ring-white/20">
                  {userImage ? (
                    <AvatarImage src={userImage} alt={fullName} />
                  ) : (
                    <AvatarFallback className="bg-yellow-400 text-[#002a45] font-bold text-2xl">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                <p className="text-white/80 text-sm">{userRole}</p>
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Card */}
                <div className="bg-white border border-[#ebebeb] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#002a45]/10 rounded-lg">
                      <Mail className="w-5 h-5 text-[#002a45]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#666666] mb-1">Email</p>
                      <p className="text-sm font-medium text-[#333333] break-all">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Function Card */}
                <div className="bg-white border border-[#ebebeb] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#002a45]/10 rounded-lg">
                      <Shield className="w-5 h-5 text-[#002a45]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#666666] mb-1">Função</p>
                      <p className="text-sm font-medium text-[#333333]">
                        {role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee ID Card */}
                {employeeData?.id && (
                  <div className="bg-white border border-[#ebebeb] rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#002a45]/10 rounded-lg">
                        <User className="w-5 h-5 text-[#002a45]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#666666] mb-1">
                          ID do Funcionário
                        </p>
                        <p className="text-sm font-medium text-[#333333]">
                          #{employeeData.id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Card */}
                {employeeData?.empresaId && (
                  <div className="bg-white border border-[#ebebeb] rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#002a45]/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-[#002a45]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#666666] mb-1">
                          Empresa ID
                        </p>
                        <p className="text-sm font-medium text-[#333333]">
                          #{employeeData.empresaId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Card */}
                {employeeData?.status && (
                  <div className="bg-white border border-[#ebebeb] rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#002a45]/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-[#002a45]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#666666] mb-1">Status</p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            employeeData.status === "ATIVO" ||
                            employeeData.status === "Ativo"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {employeeData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hiring Date Card */}
                {employeeData?.dataContratacao && (
                  <div className="bg-white border border-[#ebebeb] rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#002a45]/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-[#002a45]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#666666] mb-1">
                          Data de Contratação
                        </p>
                        <p className="text-sm font-medium text-[#333333]">
                          {new Date(
                            employeeData.dataContratacao
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#ebebeb]">
                <Button
                  className="flex-1 bg-[#002a45] hover:bg-[#003a5f] text-white"
                  onClick={() => setShowProfileModal(false)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setShowProfileModal(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
