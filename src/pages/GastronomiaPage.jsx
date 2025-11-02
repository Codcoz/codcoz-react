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
import { mongoAPI, postgresAPI } from "../lib/api";
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
  Eye,
  Coffee,
  Utensils,
  Sun,
  Moon,
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
  // Estados separados para ingredientes e receitas do MongoDB (usados no cardápio)
  const [ingredientesMongo, setIngredientesMongo] = useState([]);
  const [loading, setLoading] = useState({
    ingredientes: true,
    receitas: true,
    cardapios: true,
  });

  // Estados para o modal de ingrediente
  const [dialogIngredienteOpen, setDialogIngredienteOpen] = useState(false);
  const [editingIngredienteId, setEditingIngredienteId] = useState(null);
  const [ingredienteFormData, setIngredienteFormData] = useState({
    nome: "",
    descricao: "",
    categoriaIngrediente: null,
    quantidadeMinima: 0,
    empresaId: empresaId,
  });
  const [categoriasIngrediente, setCategoriasIngrediente] = useState([]);
  const [loadingIngredienteForm, setLoadingIngredienteForm] = useState(false);

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
    porcoes: 0,
    urlImagem: "",
    empresaId: empresaId,
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
  const [cardapioDetalhes, setCardapioDetalhes] = useState(null);
  const [mostrarDetalhesCardapio, setMostrarDetalhesCardapio] = useState(false);
  const [loadingCardapioDetalhes, setLoadingCardapioDetalhes] = useState(false);
  // Cache de receitas por ID para busca rápida
  const [receitasCache, setReceitasCache] = useState(new Map());

  const fetchData = () => {
    postgresAPI
      .listIngredientes(empresaId)
      .then((data) => {
        setIngredientes(Array.isArray(data) ? data : []);
        setLoading((prev) => ({ ...prev, ingredientes: false }));
      })
      .catch(() => {
        setLoading((prev) => ({ ...prev, ingredientes: false }));
      });

    // Receitas e cardápio continuam usando mongoAPI
    mongoAPI
      .getRecipes(empresaId)
      .then((data) => {
        const receitasArray = Array.isArray(data) ? data : [];
        setReceitas(receitasArray);
        // Criar cache de receitas por ID (normalizado para lowercase)
        const novoCache = new Map();
        receitasArray.forEach((r) => {
          if (r.id) novoCache.set(String(r.id).trim().toLowerCase(), r);
          if (r._id) {
            const idNormalizado = String(r._id).trim().toLowerCase();
            novoCache.set(idNormalizado, r);
          }
        });
        setReceitasCache(novoCache);
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

    // Buscar ingredientes do MongoDB para usar no cardápio
    mongoAPI
      .getIngredients(empresaId)
      .then((data) => {
        setIngredientesMongo(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setIngredientesMongo([]);
      });
  };

  useEffect(() => {
    fetchData();
    // Carregar categorias de ingrediente
    postgresAPI
      .listIngredientCategories()
      .then((data) => {
        setCategoriasIngrediente(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCategoriasIngrediente([]);
      });
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
            unidadeMedida: novoIngrediente.unidade_medida, // Armazenar como camelCase internamente
            unidade_medida: novoIngrediente.unidade_medida, // Manter para compatibilidade com exibição
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

  // Funções CRUD para Ingredientes
  const handleEditIngrediente = async (ingredienteId) => {
    try {
      setLoadingIngredienteForm(true);
      const ingrediente = await postgresAPI.getIngredienteById(ingredienteId);
      setIngredienteFormData({
        nome: ingrediente.nome || "",
        descricao: ingrediente.descricao || "",
        categoriaIngrediente: ingrediente.categoriaIngrediente || null,
        quantidadeMinima: ingrediente.quantidadeMinima || 0,
        empresaId: empresaId,
      });
      setEditingIngredienteId(ingredienteId);
      setDialogIngredienteOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar ingrediente: " + error.message);
    } finally {
      setLoadingIngredienteForm(false);
    }
  };

  const handleDeleteIngrediente = async (ingredienteId) => {
    if (!confirm("Tem certeza que deseja excluir este ingrediente?")) {
      return;
    }

    try {
      await postgresAPI.deleteIngrediente(ingredienteId);
      toast.success("Ingrediente excluído com sucesso!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao excluir ingrediente: " + error.message);
    }
  };

  const handleSubmitIngrediente = async (e) => {
    e.preventDefault();
    setLoadingIngredienteForm(true);

    try {
      const dataToSend = {
        ...ingredienteFormData,
        categoriaIngrediente: ingredienteFormData.categoriaIngrediente || null,
        quantidadeMinima: Number(ingredienteFormData.quantidadeMinima) || 0,
        empresaId: empresaId,
      };

      if (editingIngredienteId) {
        // Preparar dados para atualização conforme documentação da API
        const updateData = {
          nome: dataToSend.nome,
          descricao: dataToSend.descricao || "",
          categoriaIngrediente: dataToSend.categoriaIngrediente
            ? Number(dataToSend.categoriaIngrediente)
            : 0,
          quantidadeMinima: Number(dataToSend.quantidadeMinima) || 0,
          empresaId: Number(dataToSend.empresaId),
        };
        // ID vai na URL
        await postgresAPI.updateIngrediente(editingIngredienteId, updateData);
        toast.success("Ingrediente atualizado com sucesso!");
      } else {
        await postgresAPI.createIngrediente(dataToSend);
        toast.success("Ingrediente cadastrado com sucesso!");
      }

      handleDialogIngredienteOpenChange(false);
      fetchData();
    } catch (error) {
      toast.error(
        editingIngredienteId
          ? "Erro ao atualizar ingrediente: " + error.message
          : "Erro ao cadastrar ingrediente: " + error.message
      );
    } finally {
      setLoadingIngredienteForm(false);
    }
  };

  const resetIngredienteForm = () => {
    setIngredienteFormData({
      nome: "",
      descricao: "",
      categoriaIngrediente: null,
      quantidadeMinima: 0,
      empresaId: empresaId,
    });
    setEditingIngredienteId(null);
  };

  const handleDialogIngredienteOpenChange = (open) => {
    setDialogIngredienteOpen(open);
    if (!open) {
      resetIngredienteForm();
    }
  };

  // Funções para visualizar cardápio
  const handleVerDetalhesCardapio = async (cardapioId) => {
    try {
      setLoadingCardapioDetalhes(true);
      // Garantir que as receitas estão atualizadas antes de carregar o cardápio
      const [detalhes, receitasAtualizadas] = await Promise.all([
        mongoAPI.getMenu(empresaId, cardapioId),
        mongoAPI.getRecipes(empresaId).catch(() => receitas), // Se falhar, usar lista atual
      ]);
      
      // Atualizar receitas se necessário
      if (Array.isArray(receitasAtualizadas)) {
        setReceitas(receitasAtualizadas);
        // Atualizar cache também (normalizado para lowercase)
        const novoCache = new Map();
        receitasAtualizadas.forEach((r) => {
          if (r.id) novoCache.set(String(r.id).trim().toLowerCase(), r);
          if (r._id) {
            const idNormalizado = String(r._id).trim().toLowerCase();
            novoCache.set(idNormalizado, r);
          }
        });
        setReceitasCache(novoCache);
      }
      
      setCardapioDetalhes(detalhes);
      setMostrarDetalhesCardapio(true);
    } catch (error) {
      toast.error("Erro ao carregar detalhes do cardápio: " + error.message);
    } finally {
      setLoadingCardapioDetalhes(false);
    }
  };

  // Função para calcular próxima semana (segunda a sexta)
  const calcularProximaSemana = () => {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda, etc.

    // Calcular quantos dias até a próxima segunda-feira
    let diasAteSegunda;
    if (diaSemana === 0) {
      diasAteSegunda = 1; // Amanhã
    } else if (diaSemana === 1) {
      diasAteSegunda = 7; // Próxima segunda
    } else {
      diasAteSegunda = 8 - diaSemana; // Dias até próxima segunda
    }

    const proximaSegunda = new Date(hoje);
    proximaSegunda.setDate(hoje.getDate() + diasAteSegunda);
    proximaSegunda.setHours(0, 0, 0, 0);

    const proximaSexta = new Date(proximaSegunda);
    proximaSexta.setDate(proximaSegunda.getDate() + 4); // +4 dias = sexta
    proximaSexta.setHours(23, 59, 59, 999);

    return {
      dataInicio: proximaSegunda.toISOString().split("T")[0],
      dataFim: proximaSexta.toISOString().split("T")[0],
    };
  };

  // Função para criar novo cardápio
  const handleCriarCardapio = () => {
    const { dataInicio, dataFim } = calcularProximaSemana();

    // Criar cardápio semanal (segunda a sexta)
    const diasSemana = [
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
    ];
    const cardapioSemanal = [];

    const dataInicioObj = new Date(dataInicio);
    for (let i = 0; i < 5; i++) {
      const dataDia = new Date(dataInicioObj);
      dataDia.setDate(dataInicioObj.getDate() + i);

      cardapioSemanal.push({
        diaSemana: diasSemana[i],
        data: dataDia.toISOString().split("T")[0],
        lancheManha: null,
        almoco: null,
        lancheTarde: null,
      });
    }

    const novoCardapio = {
      nomeCardapio: `Cardápio ${formatarData(dataInicio)} - ${formatarData(
        dataFim
      )}`,
      dataInicio: dataInicio,
      dataFim: dataFim,
      periodicidade: "SEMANAL",
      cardapioSemanal: cardapioSemanal,
    };

    // Criar cardápio via API
    mongoAPI
      .createMenu(empresaId, novoCardapio)
      .then(() => {
        toast.success("Cardápio criado com sucesso!");
        fetchData();
      })
      .catch((error) => {
        toast.error("Erro ao criar cardápio: " + error.message);
      });
  };

  // Função auxiliar para obter nome da receita pelo ID (MongoDB - usada no cardápio)
  // A API MongoDB retorna "id" (não "_id") na resposta, mas pode ter ambos
  const getReceitaNome = (receitaId) => {
    if (!receitaId) return null;
    
    // Normalizar o ID para string e remover espaços
    const receitaIdStr = String(receitaId).trim().toLowerCase();

    // Primeiro tentar buscar no cache (mais rápido)
    const receitaCache = receitasCache.get(receitaIdStr);
    
    if (receitaCache?.nome) return receitaCache.nome;

    // Se não encontrou no cache, buscar na lista local de receitas
    const receita = receitas.find((r) => {
      // Tentar todas as combinações possíveis de ID
      const id1 = r.id ? String(r.id).trim().toLowerCase() : null;
      const id2 = r._id ? String(r._id).trim().toLowerCase() : null;
      
      return (
        (id1 && id1 === receitaIdStr) ||
        (id2 && id2 === receitaIdStr) ||
        // Comparação com a string original também
        (id1 && id1 === String(receitaId).trim().toLowerCase()) ||
        (id2 && id2 === String(receitaId).trim().toLowerCase())
      );
    });
    
    if (receita?.nome) {
      // Adicionar ao cache para próxima vez (criar novo Map para React detectar mudança)
      setReceitasCache((prevCache) => {
        const novoCache = new Map(prevCache);
        if (receita.id) novoCache.set(String(receita.id).trim().toLowerCase(), receita);
        if (receita._id) novoCache.set(String(receita._id).trim().toLowerCase(), receita);
        return novoCache;
      });
      return receita.nome;
    }

    // Se não encontrou, retorna null (mostrará "Receita não encontrada")
    return null;
  };

  // Função auxiliar para obter nome do ingrediente pelo ID (MongoDB para cardápio)
  const getIngredienteNome = (ingredienteId) => {
    if (!ingredienteId) return null;
    const ingredienteIdStr = String(ingredienteId);
    // Buscar na lista de ingredientes do MongoDB (usada no cardápio)
    const ingrediente = ingredientesMongo.find(
      (i) => String(i._id || i.id) === ingredienteIdStr
    );
    if (ingrediente?.nome) return ingrediente.nome;
    // Se não encontrou na lista local, retorna null para não mostrar ID
    return null;
  };

  // Função auxiliar para formatar data sem problemas de fuso horário
  const formatarData = (dataString) => {
    if (!dataString) return "-";
    // Se a data já é uma string no formato ISO ou similar, fazer parse manual
    if (typeof dataString === "string") {
      // Se vier no formato ISO (YYYY-MM-DD), fazer parse direto
      const partes = dataString.split("T")[0].split("-");
      if (partes.length === 3) {
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Mês é 0-indexado
        const dia = parseInt(partes[2], 10);
        const data = new Date(ano, mes, dia);
        return data.toLocaleDateString("pt-BR");
      }
    }
    // Fallback para Date normal
    const data = new Date(dataString);
    // Ajustar para evitar problemas de fuso horário
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dia = data.getDate();
    return new Date(ano, mes, dia).toLocaleDateString("pt-BR");
  };

  // Função auxiliar para formatar data completa
  const formatarDataCompleta = (dataString, opcoes = {}) => {
    if (!dataString) return "";
    if (typeof dataString === "string") {
      const partes = dataString.split("T")[0].split("-");
      if (partes.length === 3) {
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const dia = parseInt(partes[2], 10);
        const data = new Date(ano, mes, dia);
        return data.toLocaleDateString("pt-BR", opcoes);
      }
    }
    const data = new Date(dataString);
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dia = data.getDate();
    return new Date(ano, mes, dia).toLocaleDateString("pt-BR", opcoes);
  };

  // Função auxiliar para formatar apenas dia e mês
  const formatarDataDiaMes = (dataString) => {
    if (!dataString) return "-";
    if (typeof dataString === "string") {
      const partes = dataString.split("T")[0].split("-");
      if (partes.length === 3) {
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const dia = parseInt(partes[2], 10);
        const data = new Date(ano, mes, dia);
        return data.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
      }
    }
    const data = new Date(dataString);
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dia = data.getDate();
    return new Date(ano, mes, dia).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Funções CRUD
  const handleEditRecipe = async (recipeId) => {
    try {
      setFormLoading(true);
      const receita = await mongoAPI.getRecipe(empresaId, recipeId);
      // Mapear ingredientes para garantir compatibilidade (unidadeMedida/unidade_medida)
      const ingredientesMapeados = (receita.ingredientes || []).map((ing) => ({
        nome: ing.nome || "",
        quantidade: ing.quantidade || 0,
        unidadeMedida: ing.unidadeMedida || "",
        unidade_medida: ing.unidadeMedida || ing.unidade_medida || "", // Manter ambos para compatibilidade
      }));
      
      setFormData({
        nome: receita.nome || "",
        descricao: receita.descricao || "",
        ingredientes: ingredientesMapeados,
        modoPreparo: receita.modoPreparo || [],
        tempoPreparoMinutos: receita.tempoPreparoMinutos || 0,
        tempoCozimentoMinutos: receita.tempoCozimentoMinutos || 0,
        porcoes: receita.porcoes || 0,
        urlImagem: receita.urlImagem || "",
        empresaId: empresaId,
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
      // Preparar dados no formato da API (camelCase)
      const dataToSend = {
        nome: formData.nome,
        descricao: formData.descricao || "",
        urlImagem: formData.urlImagem || "",
        ingredientes: formData.ingredientes.map((ing) => ({
          nome: ing.nome,
          quantidade: Number(ing.quantidade) || 0,
          unidadeMedida: ing.unidadeMedida || ing.unidade_medida || "",
          receitaId: 0, // Sempre 0 para novos ingredientes
        })),
        modoPreparo: formData.modoPreparo.map((passo) => ({
          ordem: passo.ordem,
          passo: passo.passo,
        })),
        tempoPreparoMinutos: Number(formData.tempoPreparoMinutos) || 0,
        tempoCozimentoMinutos: Number(formData.tempoCozimentoMinutos) || 0,
        porcoes: Number(formData.porcoes) || 0,
        empresaId: empresaId,
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
          : "Erro ao cadastrar receita: " + error.message
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
      porcoes: 0,
      urlImagem: "",
      empresaId: empresaId,
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
            {/* Barra de pesquisa e botão adicionar */}
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Pesquisar ingrediente por nome..."
                  value={searchIngredientes}
                  onChange={(e) => setSearchIngredientes(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog
                open={dialogIngredienteOpen}
                onOpenChange={handleDialogIngredienteOpenChange}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-[#002a45] hover:bg-[#003a5f]"
                    type="button"
                    onClick={() => {
                      resetIngredienteForm();
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Ingrediente
                  </Button>
                </DialogTrigger>
              </Dialog>
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
                          onClick={() => handleEditIngrediente(ingrediente.id)}
                          title="Editar ingrediente"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                          onClick={() =>
                            handleDeleteIngrediente(ingrediente.id)
                          }
                          title="Excluir ingrediente"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal para Editar/Criar Ingrediente */}
            <Dialog
              open={dialogIngredienteOpen}
              onOpenChange={handleDialogIngredienteOpenChange}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingIngredienteId
                      ? "Editar Ingrediente"
                      : "Cadastrar Novo Ingrediente"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitIngrediente} className="space-y-4">
                  {/* Nome */}
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={ingredienteFormData.nome}
                      onChange={(e) =>
                        setIngredienteFormData({
                          ...ingredienteFormData,
                          nome: e.target.value,
                        })
                      }
                      required
                      placeholder="Ex: Farinha de trigo"
                      disabled={loadingIngredienteForm}
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <textarea
                      id="descricao"
                      value={ingredienteFormData.descricao}
                      onChange={(e) =>
                        setIngredienteFormData({
                          ...ingredienteFormData,
                          descricao: e.target.value,
                        })
                      }
                      className="flex min-h-[80px] w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm placeholder:text-[#666666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002a45] focus-visible:ring-offset-2"
                      placeholder="Descreva o ingrediente..."
                      disabled={loadingIngredienteForm}
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <Label htmlFor="categoriaIngrediente">
                      Categoria do Ingrediente
                    </Label>
                    <select
                      id="categoriaIngrediente"
                      value={ingredienteFormData.categoriaIngrediente || ""}
                      onChange={(e) =>
                        setIngredienteFormData({
                          ...ingredienteFormData,
                          categoriaIngrediente: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002a45]"
                      disabled={loadingIngredienteForm}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categoriasIngrediente.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome || `Categoria ${cat.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantidade Mínima */}
                  <div>
                    <Label htmlFor="quantidadeMinima">Quantidade Mínima</Label>
                    <Input
                      id="quantidadeMinima"
                      type="number"
                      value={ingredienteFormData.quantidadeMinima}
                      onChange={(e) =>
                        setIngredienteFormData({
                          ...ingredienteFormData,
                          quantidadeMinima: e.target.value
                            ? Number(e.target.value)
                            : 0,
                        })
                      }
                      min="0"
                      step="0.01"
                      placeholder="0"
                      disabled={loadingIngredienteForm}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-[#ebebeb]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogIngredienteOpenChange(false)}
                      disabled={loadingIngredienteForm}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loadingIngredienteForm}
                      className="bg-[#002a45]"
                    >
                      {loadingIngredienteForm
                        ? "Salvando..."
                        : editingIngredienteId
                        ? "Atualizar Ingrediente"
                        : "Cadastrar Ingrediente"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                                    {ing.quantidade}{" "}
                                    {ing.unidadeMedida || ing.unidade_medida || ""}
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

                    {/* Tempos e Porções */}
                    <div className="grid grid-cols-3 gap-4">
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
                      <div>
                        <Label>
                          <Users className="w-4 h-4 inline mr-1" />
                          Porções
                        </Label>
                        <Input
                          type="number"
                          value={formData.porcoes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              porcoes: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* URL da Imagem */}
                    <div>
                      <Label>URL da Imagem</Label>
                      <Input
                        type="url"
                        value={formData.urlImagem}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            urlImagem: e.target.value,
                          })
                        }
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      <p className="text-xs text-[#666666] mt-1">
                        URL opcional para imagem da receita
                      </p>
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
                {receitasFiltradas.map((receita) => {
                  const receitaId = receita._id || receita.id;
                  return (
                    <div
                      key={receitaId}
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
                            onClick={() => handleEditRecipe(receitaId)}
                            title="Editar receita"
                          >
                            <Pencil className="w-4 h-4 text-white" />
                          </button>
                          <button
                            className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                            onClick={() => handleDeleteRecipe(receitaId)}
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
                            <span className="text-xs text-[#666666]">
                              Serve
                            </span>
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
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Cardápio Tab */}
        {activeTab === "cardapio" && (
          <>
            {/* Barra de pesquisa e botão adicionar */}
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <Input
                  type="text"
                  placeholder="Pesquisar cardápio por data ou periodicidade..."
                  value={searchCardapios}
                  onChange={(e) => setSearchCardapios(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                className="bg-[#002a45] hover:bg-[#003a5f]"
                type="button"
                onClick={handleCriarCardapio}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cardápio
              </Button>
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
                          {cardapio.nomeCardapio ||
                            (cardapio.dataInicio && cardapio.dataFim
                              ? `${formatarData(
                                  cardapio.dataInicio
                                )} - ${formatarData(cardapio.dataFim)}`
                              : cardapio.data_inicio && cardapio.data_fim
                              ? `${formatarData(
                                  cardapio.data_inicio
                                )} - ${formatarData(cardapio.data_fim)}`
                              : "Cardápio")}
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
                            className="w-8 h-8 bg-green-500 hover:bg-green-600 flex items-center justify-center rounded-lg transition-colors"
                            onClick={() =>
                              handleVerDetalhesCardapio(cardapio.id)
                            }
                            title="Ver detalhes do cardápio"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          <button
                            className="w-8 h-8 bg-blue-400 hover:bg-blue-500 flex items-center justify-center rounded-lg transition-colors"
                            onClick={() => {}}
                            title="Editar cardápio"
                          >
                            <Pencil className="w-4 h-4 text-white" />
                          </button>
                          <button
                            className="w-8 h-8 bg-[#DC143C] hover:bg-[#B22222] flex items-center justify-center rounded-lg transition-colors"
                            onClick={() => {}}
                            title="Excluir cardápio"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {cardapio.cardapioSemanal || cardapio.cardapio_semanal ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#ebebeb]">
                        {(
                          cardapio.cardapioSemanal ||
                          cardapio.cardapio_semanal ||
                          []
                        )
                          .slice(0, 7)
                          .map((dia, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-[#ebebeb] rounded-lg hover:bg-[#002a45]/5 transition-colors cursor-pointer"
                              onClick={() =>
                                handleVerDetalhesCardapio(cardapio.id)
                              }
                            >
                              <p className="text-xs font-semibold text-[#333333] mb-1">
                                {dia.diaSemana || `Dia ${idx + 1}`}
                              </p>
                              <p className="text-xs text-[#666666]">
                                {formatarDataDiaMes(dia.data)}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Modal de Detalhes do Cardápio */}
            <Dialog
              open={mostrarDetalhesCardapio}
              onOpenChange={setMostrarDetalhesCardapio}
            >
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {cardapioDetalhes?.nomeCardapio || "Detalhes do Cardápio"}
                  </DialogTitle>
                </DialogHeader>

                {loadingCardapioDetalhes ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002a45]"></div>
                  </div>
                ) : cardapioDetalhes ? (
                  <div className="mt-4 space-y-6">
                    {/* Informações do Cardápio */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-[#002a45] to-[#003a5f] rounded-lg text-white">
                      <div>
                        <p className="text-xs text-white/80 mb-1">Período</p>
                        <p className="text-sm font-semibold">
                          {formatarData(cardapioDetalhes.dataInicio)} até{" "}
                          {formatarData(cardapioDetalhes.dataFim)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/80 mb-1">
                          Periodicidade
                        </p>
                        <p className="text-sm font-semibold">
                          {cardapioDetalhes.periodicidade || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/80 mb-1">
                          Dias do Cardápio
                        </p>
                        <p className="text-sm font-semibold">
                          {(cardapioDetalhes.cardapioSemanal || []).length} dias
                        </p>
                      </div>
                    </div>

                    {/* Cardápio Semanal */}
                    <div className="space-y-4">
                      {(cardapioDetalhes.cardapioSemanal || []).map(
                        (dia, idx) => (
                          <div
                            key={idx}
                            className="border border-[#ebebeb] rounded-lg p-5 bg-white"
                          >
                            {/* Cabeçalho do Dia */}
                            <div className="mb-4 pb-3 border-b border-[#ebebeb]">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-[#333333]">
                                    {dia.diaSemana || `Dia ${idx + 1}`}
                                  </h3>
                                  <p className="text-sm text-[#666666]">
                                    {formatarDataCompleta(dia.data, {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Lanche da Manhã */}
                              {dia.lancheManha && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Sun className="w-5 h-5 text-yellow-600" />
                                    <h4 className="font-semibold text-[#333333]">
                                      Lanche da Manhã
                                    </h4>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    {dia.lancheManha.opcoes &&
                                      dia.lancheManha.opcoes.length > 0 && (
                                        <div>
                                          <p className="text-xs text-[#666666] mb-1">
                                            Opções:
                                          </p>
                                          {dia.lancheManha.opcoes.map(
                                            (opcao, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 text-[#333333]"
                                              >
                                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                                                  {opcao.prioridade || ""}
                                                </span>
                                                <span>
                                                  {opcao.receitaId
                                                    ? getReceitaNome(
                                                        opcao.receitaId
                                                      ) ||
                                                      "Receita não encontrada"
                                                    : opcao.ingredienteId
                                                    ? getIngredienteNome(
                                                        opcao.ingredienteId
                                                      ) ||
                                                      "Ingrediente não encontrado"
                                                    : "Opção"}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    {dia.lancheManha.opcoesFixas && (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Opção Fixa:
                                        </p>
                                        <div className="flex items-center gap-2 text-[#333333]">
                                          {dia.lancheManha.opcoesFixas.receitaId
                                            ? getReceitaNome(
                                                dia.lancheManha.opcoesFixas
                                                  .receitaId
                                              ) || "Receita não encontrada"
                                            : dia.lancheManha.opcoesFixas
                                                .ingredienteId
                                            ? getIngredienteNome(
                                                dia.lancheManha.opcoesFixas
                                                  .ingredienteId
                                              ) || "Ingrediente não encontrado"
                                            : "Opção Fixa"}
                                        </div>
                                      </div>
                                    )}
                                    {dia.lancheManha.fruta?.ingredienteId && (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Fruta:
                                        </p>
                                        <p className="text-[#333333]">
                                          {getIngredienteNome(
                                            dia.lancheManha.fruta.ingredienteId
                                          ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Almoço */}
                              {dia.almoco && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Utensils className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-[#333333]">
                                      Almoço
                                    </h4>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    {dia.almoco.arrozIntegral?.receitaId ||
                                    dia.almoco.arrozIntegral?.ingredienteId ? (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Arroz Integral:
                                        </p>
                                        <p className="text-[#333333]">
                                          {dia.almoco.arrozIntegral.receitaId
                                            ? getReceitaNome(
                                                dia.almoco.arrozIntegral
                                                  .receitaId
                                              ) || "Receita não encontrada"
                                            : getIngredienteNome(
                                                dia.almoco.arrozIntegral
                                                  .ingredienteId
                                              ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    ) : null}
                                    {dia.almoco.arroz?.receitaId ||
                                    dia.almoco.arroz?.ingredienteId ? (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Arroz:
                                        </p>
                                        <p className="text-[#333333]">
                                          {dia.almoco.arroz.receitaId
                                            ? getReceitaNome(
                                                dia.almoco.arroz.receitaId
                                              ) || "Receita não encontrada"
                                            : getIngredienteNome(
                                                dia.almoco.arroz.ingredienteId
                                              ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    ) : null}
                                    {dia.almoco.feijao?.receitaId ||
                                    dia.almoco.feijao?.ingredienteId ? (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Feijão:
                                        </p>
                                        <p className="text-[#333333]">
                                          {dia.almoco.feijao.receitaId
                                            ? getReceitaNome(
                                                dia.almoco.feijao.receitaId
                                              ) || "Receita não encontrada"
                                            : getIngredienteNome(
                                                dia.almoco.feijao.ingredienteId
                                              ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    ) : null}
                                    {dia.almoco.proteinas &&
                                      dia.almoco.proteinas.length > 0 && (
                                        <div>
                                          <p className="text-xs text-[#666666] mb-1">
                                            Proteínas:
                                          </p>
                                          {dia.almoco.proteinas.map(
                                            (proteina, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 text-[#333333]"
                                              >
                                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                                  {proteina.prioridade || ""}
                                                </span>
                                                <span>
                                                  {getReceitaNome(
                                                    proteina.receitaId
                                                  ) || "Receita não encontrada"}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    {dia.almoco.guarnicao?.receitaId ||
                                    dia.almoco.guarnicao?.ingredienteId ? (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Guarnição:
                                        </p>
                                        <p className="text-[#333333]">
                                          {dia.almoco.guarnicao.receitaId
                                            ? getReceitaNome(
                                                dia.almoco.guarnicao.receitaId
                                              ) || "Receita não encontrada"
                                            : getIngredienteNome(
                                                dia.almoco.guarnicao
                                                  .ingredienteId
                                              ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    ) : null}
                                    {dia.almoco.saladas &&
                                      dia.almoco.saladas.length > 0 && (
                                        <div>
                                          <p className="text-xs text-[#666666] mb-1">
                                            Saladas:
                                          </p>
                                          {dia.almoco.saladas.map(
                                            (salada, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 text-[#333333]"
                                              >
                                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                                  {salada.prioridade || ""}
                                                </span>
                                                <span>
                                                  {getReceitaNome(
                                                    salada.receitaId
                                                  ) || "Receita não encontrada"}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    {dia.almoco.molhoSalada?.receitaId ||
                                    dia.almoco.molhoSalada?.ingredienteId ? (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Molho de Salada:
                                        </p>
                                        <p className="text-[#333333]">
                                          {dia.almoco.molhoSalada.receitaId
                                            ? getReceitaNome(
                                                dia.almoco.molhoSalada.receitaId
                                              ) || "Receita não encontrada"
                                            : getIngredienteNome(
                                                dia.almoco.molhoSalada
                                                  .ingredienteId
                                              ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    ) : null}
                                    {dia.almoco.sobremesa?.receitaId ||
                                    dia.almoco.sobremesa?.ingredienteId ? (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Sobremesa:
                                        </p>
                                        <p className="text-[#333333]">
                                          {dia.almoco.sobremesa.receitaId
                                            ? getReceitaNome(
                                                dia.almoco.sobremesa.receitaId
                                              ) || "Receita não encontrada"
                                            : getIngredienteNome(
                                                dia.almoco.sobremesa
                                                  .ingredienteId
                                              ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              )}

                              {/* Lanche da Tarde */}
                              {dia.lancheTarde && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Moon className="w-5 h-5 text-orange-600" />
                                    <h4 className="font-semibold text-[#333333]">
                                      Lanche da Tarde
                                    </h4>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    {dia.lancheTarde.opcoes &&
                                      dia.lancheTarde.opcoes.length > 0 && (
                                        <div>
                                          <p className="text-xs text-[#666666] mb-1">
                                            Opções:
                                          </p>
                                          {dia.lancheTarde.opcoes.map(
                                            (opcao, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 text-[#333333]"
                                              >
                                                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                                                  {opcao.prioridade || ""}
                                                </span>
                                                <span>
                                                  {opcao.receitaId
                                                    ? getReceitaNome(
                                                        opcao.receitaId
                                                      ) ||
                                                      "Receita não encontrada"
                                                    : opcao.ingredienteId
                                                    ? getIngredienteNome(
                                                        opcao.ingredienteId
                                                      ) ||
                                                      "Ingrediente não encontrado"
                                                    : "Opção"}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    {dia.lancheTarde.opcoesFixas && (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Opção Fixa:
                                        </p>
                                        <div className="flex items-center gap-2 text-[#333333]">
                                          {dia.lancheTarde.opcoesFixas.receitaId
                                            ? getReceitaNome(
                                                dia.lancheTarde.opcoesFixas
                                                  .receitaId
                                              ) || "Receita não encontrada"
                                            : dia.lancheTarde.opcoesFixas
                                                .ingredienteId
                                            ? getIngredienteNome(
                                                dia.lancheTarde.opcoesFixas
                                                  .ingredienteId
                                              ) || "Ingrediente não encontrado"
                                            : "Opção Fixa"}
                                        </div>
                                      </div>
                                    )}
                                    {dia.lancheTarde.fruta?.ingredienteId && (
                                      <div>
                                        <p className="text-xs text-[#666666] mb-1">
                                          Fruta:
                                        </p>
                                        <p className="text-[#333333]">
                                          {getIngredienteNome(
                                            dia.lancheTarde.fruta.ingredienteId
                                          ) || "Ingrediente não encontrado"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </>
        )}
      </Card>
    </div>
  );
}
