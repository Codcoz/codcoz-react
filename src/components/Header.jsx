import { useState } from "react";
import { Bell, HelpCircle, Search, X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/Avatar";
import { Button } from "./ui/Button";

export default function Header({
  userName = "Gestor",
  userEmail = "",
  userRole = "Gestor",
  sidebarWidth = 72,
  onLogout,
  onNavigate,
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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
              <AvatarFallback className="bg-yellow-400 text-white font-semibold">
                {initials}
              </AvatarFallback>
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
                    <AvatarFallback className="bg-yellow-400 text-white font-semibold text-lg">
                      {initials}
                    </AvatarFallback>
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
                    onClick={() => {
                      // TODO: Implementar ação "Ver mais"
                      setShowUserDropdown(false);
                    }}
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
    </div>
  );
}
