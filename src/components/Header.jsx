import { useState } from "react";
import { Bell, HelpCircle, Search, X, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/Avatar";
import { Button } from "./ui/Button";

export default function Header({ userName = "Gestor", userEmail = "", userRole = "Gestor", userId = "", sidebarWidth = 72, onLogout }) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fullName = userName || "Janaina Mocada";
  const email = userEmail || "janaina.mocada@codcoz.com";
  const role = userRole || "Gestor";
  const id = userId || "1234567890";

  return (
    <div className="fixed right-0 top-0 h-[88px] bg-transparent z-40 transition-all duration-200 ease-in-out" style={{ left: `${sidebarWidth}px` }}>
      {/* Search Field */}
      <div className="absolute left-[24px] top-[24px] w-[576px] bg-neutral-100 rounded-[12px] p-[8px] flex items-center gap-[12px]">
        <Search className="w-6 h-6 text-[#002A45]" />
        <span className="text-[#333333] text-sm">Pesquisar</span>
      </div>

      {/* Right Section */}
      <div className="absolute right-[102px] top-[28px] flex items-center gap-[24px]">
        <button className="w-6 h-6 text-[#333333] hover:text-[#002a45] transition-colors">
          <Bell className="w-full h-full" />
        </button>
        <button className="w-6 h-6 text-[#333333] hover:text-[#002a45] transition-colors">
          <HelpCircle className="w-full h-full" />
        </button>
        
        {/* Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="focus:outline-none"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-yellow-400 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* User Dropdown Card */}
          {showUserDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-50"
                onClick={() => setShowUserDropdown(false)}
              />
              
              {/* Dropdown Card */}
              <div className="absolute right-0 top-[48px] w-[360px] bg-white rounded-lg shadow-lg p-6 z-50">
                <div className="flex items-start gap-4">
                  {/* Large Avatar */}
                  <Avatar className="w-16 h-16 flex-shrink-0">
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
                        <p className="text-[#333333] text-sm">
                          {role}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#333333] font-semibold text-sm mb-1">
                          ID usuário
                        </p>
                        <p className="text-[#333333] text-sm">
                          {id}
                        </p>
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
                    className="w-full bg-transparent hover:bg-[#ebebeb] text-[#333333] border border-[#ebebeb]"
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
