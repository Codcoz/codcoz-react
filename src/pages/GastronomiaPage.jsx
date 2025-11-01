import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { mongoAPI } from "../lib/api";
import { UtensilsCrossed, BookOpen, Calendar } from "lucide-react";

export default function GastronomiaPage({ empresaId }) {
  const [activeTab, setActiveTab] = useState("ingredientes");
  const [ingredientes, setIngredientes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [cardapios, setCardapios] = useState([]);
  const [loading, setLoading] = useState({
    ingredientes: true,
    receitas: true,
    cardapios: true,
  });

  useEffect(() => {
    // Carregar ingredientes
    mongoAPI
      .getIngredients(empresaId)
      .then((data) => {
        setIngredientes(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, ingredientes: false }));
      })
      .catch((error) => {
        if (
          !error.message?.includes("CORS") &&
          !error.message?.includes("Failed to fetch")
        ) {
          console.error("Erro ao buscar ingredientes:", error);
        }
        setLoading((prev) => ({ ...prev, ingredientes: false }));
      });

    // Carregar receitas
    mongoAPI
      .getRecipes(empresaId)
      .then((data) => {
        setReceitas(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, receitas: false }));
      })
      .catch((error) => {
        if (
          !error.message?.includes("CORS") &&
          !error.message?.includes("Failed to fetch")
        ) {
          console.error("Erro ao buscar receitas:", error);
        }
        setLoading((prev) => ({ ...prev, receitas: false }));
      });

    // Carregar cardápios
    mongoAPI
      .getMenus(empresaId)
      .then((data) => {
        setCardapios(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, cardapios: false }));
      })
      .catch((error) => {
        if (
          !error.message?.includes("CORS") &&
          !error.message?.includes("Failed to fetch")
        ) {
          console.error("Erro ao buscar cardápios:", error);
        }
        setLoading((prev) => ({ ...prev, cardapios: false }));
      });
  }, [empresaId]);

  const tabs = [
    {
      id: "ingredientes",
      label: "Ingredientes",
      icon: UtensilsCrossed,
      count: ingredientes.length,
    },
    {
      id: "receitas",
      label: "Receitas",
      icon: BookOpen,
      count: receitas.length,
    },
    {
      id: "cardapio",
      label: "Cardápio",
      icon: Calendar,
      count: cardapios.length,
    },
  ];

  return (
    <div>
      <h1 className="text-[#333333] mb-6 text-2xl font-semibold">
        Gastronomia
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-[#ebebeb]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
                isActive
                  ? "text-[#002a45] border-b-2 border-[#002a45]"
                  : "text-[#666666] hover:text-[#333333]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive
                      ? "bg-[#002a45] text-white"
                      : "bg-[#ebebeb] text-[#666666]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Card className="p-6">
        {/* Ingredientes Tab */}
        {activeTab === "ingredientes" && (
          <>
            {loading.ingredientes ? (
              <p className="text-center text-[#666666] py-8">
                Carregando ingredientes...
              </p>
            ) : ingredientes.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                Nenhum ingrediente cadastrado ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ingredientes.map((ingrediente) => (
                  <div
                    key={ingrediente.id}
                    className="p-4 border border-[#ebebeb] rounded-lg hover:border-[#002a45] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[#333333] font-semibold">
                        {ingrediente.nome || "-"}
                      </p>
                      {ingrediente.quantidadeMinima !== undefined && (
                        <span className="px-2 py-1 text-xs bg-[#002a45]/10 text-[#002a45] rounded">
                          Min: {ingrediente.quantidadeMinima}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#666666] mb-2">
                      {ingrediente.descricao || "Sem descrição"}
                    </p>
                    {ingrediente.categoria && (
                      <span className="inline-block px-2 py-1 text-xs bg-[#ebebeb] text-[#666666] rounded">
                        {ingrediente.categoria}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Receitas Tab */}
        {activeTab === "receitas" && (
          <>
            {loading.receitas ? (
              <p className="text-center text-[#666666] py-8">
                Carregando receitas...
              </p>
            ) : receitas.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                Nenhuma receita cadastrada ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receitas.map((receita) => (
                  <div
                    key={receita.id}
                    className="p-5 border border-[#ebebeb] rounded-lg hover:border-[#002a45] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-[#333333] font-semibold text-lg mb-1">
                          {receita.nome || "-"}
                        </p>
                        <p className="text-sm text-[#666666] line-clamp-2">
                          {receita.descricao || "Sem descrição"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#ebebeb]">
                      {receita.porcoes && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#666666]">Serve</span>
                          <span className="text-sm font-semibold text-[#002a45]">
                            {receita.porcoes}{" "}
                            {receita.porcoes === 1 ? "porção" : "porções"}
                          </span>
                        </div>
                      )}
                      {receita.tempoPreparoMinutos && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#666666]">⏱</span>
                          <span className="text-sm font-semibold text-[#002a45]">
                            {receita.tempoPreparoMinutos} min
                          </span>
                        </div>
                      )}
                    </div>
                    {receita.ingredientes?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#ebebeb]">
                        <p className="text-xs text-[#666666] mb-1">
                          Ingredientes:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {receita.ingredientes
                            .slice(0, 3)
                            .map((ing, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-[#ebebeb] text-[#666666] rounded"
                              >
                                {ing.nome}
                              </span>
                            ))}
                          {receita.ingredientes.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-[#666666]">
                              +{receita.ingredientes.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
            </>
          )}

        {/* Cardápio Tab */}
        {activeTab === "cardapio" && (
          <>
            {loading.cardapios ? (
              <p className="text-center text-[#666666] py-8">
                Carregando cardápios...
              </p>
            ) : cardapios.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                Nenhum cardápio cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {cardapios.map((cardapio) => (
                  <div
                    key={cardapio.id}
                    className="p-5 border border-[#ebebeb] rounded-lg hover:border-[#002a45] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[#333333] font-semibold text-lg mb-1">
                          {cardapio.data_inicio && cardapio.data_fim
                            ? `${new Date(cardapio.data_inicio).toLocaleDateString("pt-BR")} - ${new Date(cardapio.data_fim).toLocaleDateString("pt-BR")}`
                            : "Cardápio"}
                        </p>
                        {cardapio.cardapio_semanal &&
                          cardapio.cardapio_semanal.length > 0 && (
                            <p className="text-sm text-[#666666]">
                              {cardapio.cardapio_semanal.length}{" "}
                              {cardapio.cardapio_semanal.length === 1
                                ? "dia"
                                : "dias"}{" "}
                              de cardápio
                            </p>
                          )}
                      </div>
                      {cardapio.periodicidade && (
                        <span className="px-3 py-1 text-xs bg-[#002a45]/10 text-[#002a45] rounded-full">
                          {cardapio.periodicidade}
                        </span>
                      )}
                    </div>
                    {cardapio.cardapio_semanal &&
                      cardapio.cardapio_semanal.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#ebebeb]">
                          {cardapio.cardapio_semanal
                            .slice(0, 7)
                            .map((dia, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-[#ebebeb] rounded-lg"
                              >
                                <p className="text-xs font-semibold text-[#333333] mb-1">
                                  {dia.diaSemana || `Dia ${idx + 1}`}
                                </p>
                                <p className="text-xs text-[#666666]">
                                  {dia.data
                                    ? new Date(dia.data).toLocaleDateString(
                                        "pt-BR",
                                        { day: "2-digit", month: "2-digit" }
                                      )
                                    : "-"}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

