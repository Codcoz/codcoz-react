import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { mongoAPI } from "../lib/api";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  BookOpen,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Clock,
  Users,
  Search,
} from "lucide-react";

export default function GastronomiaPage({ empresaId, initialTab }) {
  // Verificar sessionStorage para tab inicial
  const getInitialTab = () => {
    const savedTab = sessionStorage.getItem("gastronomiaTab");
    if (
      savedTab &&
      ["ingredientes", "receitas", "cardapio"].includes(savedTab)
    ) {
      sessionStorage.removeItem("gastronomiaTab"); // Limpar após usar
      return savedTab;
    }
    return initialTab || "ingredientes";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Atualizar tab quando initialTab mudar
  useEffect(() => {
    if (
      initialTab &&
      ["ingredientes", "receitas", "cardapio"].includes(initialTab)
    ) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [ingredientes, setIngredientes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [cardapios, setCardapios] = useState([]);
  const [loading, setLoading] = useState({
    ingredientes: true,
    receitas: true,
    cardapios: true,
  });

  // Estados para o modal de receita
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ingredientes: [],
    modoPreparo: [],
    tempoPreparoMinutos: 0,
    tempoCozimentoMinutos: 0,
    empresa_id: empresaId,
  });
  const [novoIngrediente, setNovoIngrediente] = useState({
    nome: "",
    quantidade: "",
    unidade_medida: "",
    ingredienteId: null,
  });
  const [novoPasso, setNovoPasso] = useState("");
  const [mostrarListaIngredientes, setMostrarListaIngredientes] =
    useState(false);
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState(null);
  const [searchIngredientes, setSearchIngredientes] = useState("");
  const [searchReceitas, setSearchReceitas] = useState("");
  const [searchCardapios, setSearchCardapios] = useState("");

  const fetchData = () => {
    mongoAPI
      .getIngredients(empresaId)
      .then((data) => {
        setIngredientes(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, ingredientes: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, ingredientes: false }));
      });

    mongoAPI
      .getRecipes(empresaId)
      .then((data) => {
        setReceitas(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, receitas: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, receitas: false }));
      });

    mongoAPI
      .getMenus(empresaId)
      .then((data) => {
        setCardapios(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, cardapios: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, cardapios: false }));
      });
  };

  useEffect(() => {
    fetchData();
  }, [empresaId]);

  // Funções para gerenciar ingredientes no formulário
  const selecionarIngrediente = (ingrediente) => {
    setIngredienteSelecionado(ingrediente);
    setNovoIngrediente({
      nome: ingrediente.nome,
      quantidade: "",
      unidade_medida: ingrediente.unidade_medida || "g",
      ingredienteId: ingrediente.id,
    });
    setMostrarListaIngredientes(false);
  };

  const adicionarIngrediente = () => {
    if (
      novoIngrediente.nome &&
      novoIngrediente.quantidade &&
      novoIngrediente.unidade_medida &&
      !formData.ingredientes.some((ing) => ing.nome === novoIngrediente.nome)
    ) {
      setFormData({
        ...formData,
        ingredientes: [
          ...formData.ingredientes,
          {
            nome: novoIngrediente.nome,
            quantidade: parseFloat(novoIngrediente.quantidade),
            unidade_medida: novoIngrediente.unidade_medida,
            receita_id: editingRecipeId || 0,
          },
        ],
      });
      setNovoIngrediente({
        nome: "",
        quantidade: "",
        unidade_medida: "",
        ingredienteId: null,
      });
      setIngredienteSelecionado(null);
    } else if (
      formData.ingredientes.some((ing) => ing.nome === novoIngrediente.nome)
    ) {
      toast.error("Este ingrediente já foi adicionado à receita");
    }
  };

  const removerIngrediente = (index) => {
    setFormData({
      ...formData,
      ingredientes: formData.ingredientes.filter((_, i) => i !== index),
    });
  };

  // Ingredientes que ainda não foram adicionados à receita
  const ingredientesDisponiveis = ingredientes.filter(
    (ing) =>
      !formData.ingredientes.some((ingReceita) => ingReceita.nome === ing.nome)
  );

  // Filtrar por pesquisa
  const ingredientesFiltrados = ingredientes.filter((ing) =>
    ing.nome?.toLowerCase().includes(searchIngredientes.toLowerCase())
  );
  const receitasFiltradas = receitas.filter((rec) =>
    rec.nome?.toLowerCase().includes(searchReceitas.toLowerCase())
  );
  const cardapiosFiltrados = cardapios.filter((card) => {
    const busca = searchCardapios.toLowerCase();
    return (
      (card.data_inicio &&
        new Date(card.data_inicio)
          .toLocaleDateString("pt-BR")
          .includes(busca)) ||
      (card.data_fim &&
        new Date(card.data_fim).toLocaleDateString("pt-BR").includes(busca)) ||
      (card.periodicidade && card.periodicidade.toLowerCase().includes(busca))
    );
  });

  // Funções para gerenciar modo de preparo
  const adicionarPasso = () => {
    if (novoPasso.trim()) {
      setFormData({
        ...formData,
        modoPreparo: [
          ...formData.modoPreparo,
          { ordem: formData.modoPreparo.length + 1, passo: novoPasso.trim() },
        ],
      });
      setNovoPasso("");
    }
  };

  const removerPasso = (index) => {
    const novosPassos = formData.modoPreparo.filter((_, i) => i !== index);
    // Reordenar
    const passosReordenados = novosPassos.map((passo, idx) => ({
      ...passo,
      ordem: idx + 1,
    }));
    setFormData({
      ...formData,
      modoPreparo: passosReordenados,
    });
  };

  const moverPasso = (index, direcao) => {
    const novosPassos = [...formData.modoPreparo];
    const novoIndex = index + direcao;
    if (novoIndex >= 0 && novoIndex < novosPassos.length) {
      [novosPassos[index], novosPassos[novoIndex]] = [
        novosPassos[novoIndex],
        novosPassos[index],
      ];
      // Reordenar
      const passosReordenados = novosPassos.map((passo, idx) => ({
        ...passo,
        ordem: idx + 1,
      }));
      setFormData({
        ...formData,
        modoPreparo: passosReordenados,
      });
    }
  };

  // Funções CRUD
  const handleEditRecipe = async (recipeId) => {
    try {
      setFormLoading(true);
      const receita = await mongoAPI.getRecipe(empresaId, recipeId);
      setFormData({
        nome: receita.nome || "",
        descricao: receita.descricao || "",
        ingredientes: receita.ingredientes || [],
        modoPreparo: receita.modoPreparo || [],
        tempoPreparoMinutos: receita.tempoPreparoMinutos || 0,
        tempoCozimentoMinutos: receita.tempoCozimentoMinutos || 0,
        empresa_id: empresaId,
      });
      setEditingRecipeId(recipeId);
      setDialogOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar receita: " + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) {
      return;
    }

    try {
      await mongoAPI.deleteRecipe(empresaId, recipeId);
      toast.success("Receita excluída com sucesso!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao excluir receita: " + error.message);
    }
  };

  const handleSubmitRecipe = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Preparar dados no formato da API
      const dataToSend = {
        nome: formData.nome,
        descricao: formData.descricao,
        ingredientes: formData.ingredientes.map((ing) => ({
          nome: ing.nome,
          quantidade: ing.quantidade,
          unidade_medida: ing.unidade_medida,
          receita_id: editingRecipeId || 0,
        })),
        modo_preparo: formData.modoPreparo.map((passo) => ({
          ordem: passo.ordem,
          passo: passo.passo,
        })),
        tempo_preparo_minutos: formData.tempoPreparoMinutos,
        tempo_cozimento_minutos: formData.tempoCozimentoMinutos,
        empresa_id: empresaId,
      };

      if (editingRecipeId) {
        await mongoAPI.updateRecipe(empresaId, editingRecipeId, dataToSend);
        toast.success("Receita atualizada com sucesso!");
      } else {
        await mongoAPI.createRecipe(empresaId, dataToSend);
        toast.success("Receita cadastrada com sucesso!");
      }

      handleDialogOpenChange(false);
      fetchData();
    } catch (error) {
      toast.error(
        editingRecipeId
          ? "Erro ao atualizar receita: " + error.message
          : "Erro ao cadastrar receita" + error.message
      );
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      ingredientes: [],
      modoPreparo: [],
      tempoPreparoMinutos: 0,
      tempoCozimentoMinutos: 0,
      empresa_id: empresaId,
    });
    setNovoIngrediente({
      nome: "",
      quantidade: "",
      unidade_medida: "",
      ingredienteId: null,
    });
    setNovoPasso("");
    setEditingRecipeId(null);
    setIngredienteSelecionado(null);
    setMostrarListaIngredientes(false);
  };

  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

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
            {/* Barra de pesquisa */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Pesquisar ingrediente por nome..."
                  value={searchIngredientes}
                  onChange={(e) => setSearchIngredientes(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading.ingredientes ? (
              <p className="text-center text-[#666666] py-8">
                Carregando ingredientes...
              </p>
            ) : ingredientesFiltrados.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                {searchIngredientes
                  ? "Nenhum ingrediente encontrado com esse nome."
                  : "Nenhum ingrediente cadastrado ainda."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ingredientesFiltrados.map((ingrediente) => (
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
                    <div className="flex justify-between items-center mt-3">
                      {ingrediente.categoria && (
                        <span className="inline-block px-2 py-1 text-xs bg-[#ebebeb] text-[#666666] rounded">
                          {ingrediente.categoria}
                        </span>
                      )}
                      <div className="flex gap-2">
                        <button
                          className="w-8 h-8 bg-blue-400 hover:bg-blue-500 flex items-center justify-center rounded-lg transition-colors"
                          onClick={() => {}}
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                          onClick={() => {}}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "receitas" && (
          <>
            {/* Barra de pesquisa */}
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Pesquisar receita por nome..."
                  value={searchReceitas}
                  onChange={(e) => setSearchReceitas(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#002a45] hover:bg-[#003a5f]"
                    type="button"
                    onClick={() => {
                      resetForm();
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Receita
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecipeId
                        ? "Editar Receita"
                        : "Cadastrar Nova Receita"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitRecipe} className="space-y-6">
                    {/* Nome */}
                    <div>
                      <Label>Nome da Receita *</Label>
                      <Input
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        required
                        placeholder="Ex: Lasanha à Bolonhesa"
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <Label>Descrição</Label>
                      <textarea
                        value={formData.descricao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descricao: e.target.value,
                          })
                        }
                        className="flex min-h-[80px] w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm placeholder:text-[#666666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002a45] focus-visible:ring-offset-2"
                        placeholder="Descreva a receita..."
                      />
                    </div>

                    {/* Ingredientes */}
                    <div>
                      <Label>Ingredientes *</Label>
                      <div className="space-y-4">
                        {/* Botão para mostrar lista de ingredientes */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setMostrarListaIngredientes(
                              !mostrarListaIngredientes
                            )
                          }
                          className="w-full"
                        >
                          <UtensilsCrossed className="w-4 h-4 mr-2" />
                          {mostrarListaIngredientes
                            ? "Ocultar Lista de Ingredientes"
                            : "Selecionar Ingrediente da Lista"}
                        </Button>

                        {/* Lista de ingredientes disponíveis */}
                        {mostrarListaIngredientes && (
                          <div className="border border-[#ebebeb] rounded-lg p-4 bg-[#f9f9f9] max-h-64 overflow-y-auto">
                            <p className="text-sm text-[#666666] mb-3 font-medium">
                              Selecione um ingrediente:
                            </p>
                            {ingredientesDisponiveis.length === 0 ? (
                              <p className="text-sm text-[#666666] text-center py-4">
                                Todos os ingredientes já foram adicionados ou
                                não há ingredientes cadastrados.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {ingredientesDisponiveis.map((ing) => (
                                  <button
                                    key={ing.id || ing.nome}
                                    type="button"
                                    onClick={() => selecionarIngrediente(ing)}
                                    className={`p-3 text-left rounded-lg border transition-all ${
                                      ingredienteSelecionado?.id === ing.id ||
                                      ingredienteSelecionado?.nome === ing.nome
                                        ? "border-[#002a45] bg-[#002a45]/10"
                                        : "border-[#ebebeb] bg-white hover:border-[#002a45] hover:bg-[#002a45]/5"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-semibold text-[#333333]">
                                          {ing.nome}
                                        </p>
                                        {ing.descricao && (
                                          <p className="text-xs text-[#666666] mt-1 line-clamp-1">
                                            {ing.descricao}
                                          </p>
                                        )}
                                      </div>
                                      {ing.categoria && (
                                        <span className="px-2 py-1 text-xs bg-[#ebebeb] text-[#666666] rounded ml-2">
                                          {ing.categoria}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Formulário para adicionar ingrediente selecionado */}
                        {ingredienteSelecionado && (
                          <div className="border-2 border-[#002a45] rounded-lg p-4 bg-[#002a45]/5">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold text-[#333333]">
                                  {ingredienteSelecionado.nome}
                                </p>
                                <p className="text-xs text-[#666666]">
                                  Configure a quantidade para este ingrediente
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setIngredienteSelecionado(null);
                                  setNovoIngrediente({
                                    nome: "",
                                    quantidade: "",
                                    unidade_medida: "",
                                    ingredienteId: null,
                                  });
                                }}
                                className="text-[#666666] hover:text-[#333333]"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label className="text-xs">Quantidade *</Label>
                                <Input
                                  type="number"
                                  placeholder="Ex: 500"
                                  value={novoIngrediente.quantidade}
                                  onChange={(e) =>
                                    setNovoIngrediente({
                                      ...novoIngrediente,
                                      quantidade: e.target.value,
                                    })
                                  }
                                  step="0.01"
                                  min="0"
                                  autoFocus
                                />
                              </div>
                              <div className="w-32">
                                <Label className="text-xs">Unidade *</Label>
                                <Input
                                  type="text"
                                  placeholder="g, ml, un"
                                  value={novoIngrediente.unidade_medida}
                                  onChange={(e) =>
                                    setNovoIngrediente({
                                      ...novoIngrediente,
                                      unidade_medida: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  onClick={adicionarIngrediente}
                                  className="bg-[#002a45] h-10"
                                  disabled={
                                    !novoIngrediente.quantidade ||
                                    !novoIngrediente.unidade_medida
                                  }
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lista de ingredientes adicionados */}
                        {formData.ingredientes.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-[#333333]">
                              Ingredientes adicionados (
                              {formData.ingredientes.length}):
                            </p>
                            <div className="space-y-2">
                              {formData.ingredientes.map((ing, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-[#ebebeb] rounded-lg"
                                >
                                  <span className="text-sm">
                                    <strong>{ing.nome}</strong> -{" "}
                                    {ing.quantidade} {ing.unidade_medida}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removerIngrediente(idx)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Remover ingrediente"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modo de Preparo */}
                    <div>
                      <Label>Modo de Preparo *</Label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Digite um passo do preparo..."
                            value={novoPasso}
                            onChange={(e) => setNovoPasso(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                adicionarPasso();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={adicionarPasso}
                            className="bg-[#002a45]"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                        {formData.modoPreparo.length > 0 && (
                          <div className="space-y-2 border border-[#ebebeb] rounded-lg p-4 bg-white">
                            {formData.modoPreparo.map((passo, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-3 bg-[#ebebeb] rounded-lg group"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-[#002a45] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                  {passo.ordem}
                                </div>
                                <p className="flex-1 text-sm">{passo.passo}</p>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => moverPasso(idx, -1)}
                                    disabled={idx === 0}
                                    className="p-1 hover:bg-white rounded disabled:opacity-50"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moverPasso(idx, 1)}
                                    disabled={
                                      idx === formData.modoPreparo.length - 1
                                    }
                                    className="p-1 hover:bg-white rounded disabled:opacity-50"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removerPasso(idx)}
                                    className="p-1 hover:bg-white rounded text-red-600"
                                    title="Remover passo"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tempos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>
                          <Clock className="w-4 h-4 inline mr-1" />
                          Tempo de Preparo (minutos)
                        </Label>
                        <Input
                          type="number"
                          value={formData.tempoPreparoMinutos}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tempoPreparoMinutos:
                                parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>
                          <Clock className="w-4 h-4 inline mr-1" />
                          Tempo de Cozimento (minutos)
                        </Label>
                        <Input
                          type="number"
                          value={formData.tempoCozimentoMinutos}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tempoCozimentoMinutos:
                                parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-[#ebebeb]">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogOpenChange(false)}
                        disabled={formLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="bg-[#002a45]"
                      >
                        {formLoading
                          ? "Salvando..."
                          : editingRecipeId
                          ? "Atualizar Receita"
                          : "Cadastrar Receita"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading.receitas ? (
              <p className="text-center text-[#666666] py-8">
                Carregando receitas...
              </p>
            ) : receitasFiltradas.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                {searchReceitas
                  ? "Nenhuma receita encontrada com esse nome."
                  : "Nenhuma receita cadastrada ainda."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receitasFiltradas.map((receita) => (
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
                      <div className="flex gap-2">
                        <button
                          className="w-8 h-8 bg-blue-400 hover:bg-blue-500 flex items-center justify-center rounded-lg transition-colors"
                          onClick={() => handleEditRecipe(receita.id)}
                          title="Editar receita"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                          onClick={() => handleDeleteRecipe(receita.id)}
                          title="Excluir receita"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#ebebeb]">
                      {receita.porcoes && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#666666]" />
                          <span className="text-xs text-[#666666]">Serve</span>
                          <span className="text-sm font-semibold text-[#002a45]">
                            {receita.porcoes}{" "}
                            {receita.porcoes === 1 ? "porção" : "porções"}
                          </span>
                        </div>
                      )}
                      {receita.tempoPreparoMinutos && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-[#666666]" />
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
                          {receita.ingredientes.slice(0, 3).map((ing, idx) => (
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
            {/* Barra de pesquisa */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Pesquisar cardápio por data ou periodicidade..."
                  value={searchCardapios}
                  onChange={(e) => setSearchCardapios(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading.cardapios ? (
              <p className="text-center text-[#666666] py-8">
                Carregando cardápios...
              </p>
            ) : cardapiosFiltrados.length === 0 ? (
              <p className="text-center text-[#666666] py-8">
                {searchCardapios
                  ? "Nenhum cardápio encontrado."
                  : "Nenhum cardápio cadastrado ainda."}
              </p>
            ) : (
              <div className="space-y-4">
                {cardapiosFiltrados.map((cardapio) => (
                  <div
                    key={cardapio.id}
                    className="p-5 border border-[#ebebeb] rounded-lg hover:border-[#002a45] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[#333333] font-semibold text-lg mb-1">
                          {cardapio.data_inicio && cardapio.data_fim
                            ? `${new Date(
                                cardapio.data_inicio
                              ).toLocaleDateString("pt-BR")} - ${new Date(
                                cardapio.data_fim
                              ).toLocaleDateString("pt-BR")}`
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
                      <div className="flex items-center gap-2">
                        {cardapio.periodicidade && (
                          <span className="px-3 py-1 text-xs bg-[#002a45]/10 text-[#002a45] rounded-full">
                            {cardapio.periodicidade}
                          </span>
                        )}
                        <div className="flex gap-2">
                          <button
                            className="w-8 h-8 bg-blue-400 hover:bg-blue-500 flex items-center justify-center rounded-lg transition-colors"
                            onClick={() => {}}
                          >
                            <Pencil className="w-4 h-4 text-white" />
                          </button>
                          <button
                            className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                            onClick={() => {}}
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
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
