const isDevelopment = import.meta.env.DEV;
const POSTGRES_API_URL = isDevelopment
  ? "/api/postgres"
  : "https://codcoz-api-postgres.koyeb.app";
const MONGO_API_URL = isDevelopment
  ? "/api/mongo"
  : "https://codcoz-api-mongo-eemr.onrender.com";
const REDIS_API_URL = isDevelopment
  ? "/api/redis"
  : "https://codcoz-api-redis.onrender.com";

async function fetchWithTimeout(url, options = {}) {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

export const postgresAPI = {
  async getEmployeeByEmail(email) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/funcionario/buscar/${encodeURIComponent(email)}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async listEmployees(empresaId) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/funcionario/listar/${empresaId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async createEmployee(data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/funcionario/inserir`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updateEmployee(id, data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/funcionario/atualizar/${id}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async dismissEmployee(id) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/funcionario/demitir/${id}`,
      { method: "PUT" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getProductStockQuantity(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/quantidade-estoque/${empresaId}`
      );
      if (!response.ok) return 0;
      return await response.json();
    } catch {
      return 0;
    }
  },

  async getProductsNearExpiration(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/quantidade/proximo-validade/${empresaId}`
      );
      if (!response.ok) return 0;
      return await response.json();
    } catch {
      return 0;
    }
  },

  async getProductsLowStock(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/quantidade/estoque-baixo/${empresaId}`
      );
      if (!response.ok) return 0;
      return await response.json();
    } catch {
      return 0;
    }
  },

  async listMovements(empresaId) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/movimentacao/listar/${empresaId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getMovementById(id) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/movimentacao/buscar/${id}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async listEntryMovements(empresaId) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/movimentacao/entradas/${empresaId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async listEntryMovementsByPeriod(empresaId, dataInicio, dataFim) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/movimentacao/entradas/${empresaId}/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async listExitMovements(empresaId) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/movimentacao/baixas/${empresaId}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async listExitMovementsByPeriod(empresaId, dataInicio, dataFim) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/movimentacao/baixas/${empresaId}/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async listProducts(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/listar/${empresaId}`
      );
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch {
      return [];
    }
  },

  async getProductByEan(codigoEan) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/buscar/${codigoEan}`
      );
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch {
      return null;
    }
  },

  async listProductsNearExpiration(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/listar/proximo-validade/${empresaId}`
      );
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch {
      return [];
    }
  },

  async listProductsLowStock(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/listar/estoque-baixo/${empresaId}`
      );
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch {
      return [];
    }
  },

  async registerProductEntry(codigoEan, quantidade) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/produto/entrada/${codigoEan}?quantidade=${quantidade}`,
      { method: "PUT" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async registerProductExit(codigoEan, quantidade) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/produto/baixa/${codigoEan}?quantidade=${quantidade}`,
      { method: "PUT" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getTasksByDate(email, data) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/buscar-data/${encodeURIComponent(
          email
        )}?data=${data}`
      );
      if (!response.ok) return [];
      const dataResult = await response.json();
      // API pode retornar objeto único ou array
      return Array.isArray(dataResult) ? dataResult : [dataResult];
    } catch {
      return [];
    }
  },

  async listTasks(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/listar/${empresaId}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getTaskById(id) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/${id}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      throw new Error("Tarefa não encontrada");
    }
  },

  async createTask(data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/tarefa/criar`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async finishTask(id) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/tarefa/finalizar-tarefa/${id}`,
      { method: "PUT" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async deleteTask(id) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/tarefa/deletar/${id}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getTasksByPeriod(email, dataInicio, dataFim) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/buscar-periodo/${encodeURIComponent(
          email
        )}?data_inicio=${dataInicio}&data_fim=${dataFim}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getTasksByTypeAndPeriod(email, tipo, dataInicio, dataFim) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/buscar-por-tipo/${encodeURIComponent(
          email
        )}?tipo=${encodeURIComponent(
          tipo
        )}&data_inicio=${dataInicio}&data_fim=${dataFim}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getCompletedTasks(empresaId, dias = 7) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/buscar-concluidas/${empresaId}?dias=${dias}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  // Categoria Ingrediente
  async listIngredientCategories() {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/categoria-ingrediente/listar`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getIngredientCategory(id) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/categoria-ingrediente/buscar/${id}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      throw new Error("Categoria não encontrada");
    }
  },

  async createIngredientCategory(data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/categoria-ingrediente/inserir`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updateIngredientCategory(id, data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/categoria-ingrediente/atualizar/${id}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async deleteIngredientCategory(id) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/categoria-ingrediente/excluir/${id}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  // Tipos de Tarefa
  async listTipoTarefa() {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tipo-tarefa/listar`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  // Pedidos
  async listPedidos(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/pedido/listar/${empresaId}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async listPedidosEntrada(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/pedido/entradas/${empresaId}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  // Ingredientes
  async listIngredientes(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/ingrediente/listar/${empresaId}`
      );
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getIngredienteById(id) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/ingrediente/buscar/${id}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      throw new Error("Ingrediente não encontrado");
    }
  },

  async createIngrediente(data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/ingrediente/inserir`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updateIngrediente(id, data) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/ingrediente/atualizar/${id}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  },

  async deleteIngrediente(id) {
    const response = await fetchWithTimeout(
      `${POSTGRES_API_URL}/ingrediente/deletar/${id}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
};

export const mongoAPI = {
  async getIngredients(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/ingrediente`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      return [];
    }
  },

  async createIngredient(empresaId, data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/ingrediente`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updateIngredient(empresaId, ingredientId, data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/ingrediente/${ingredientId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getRecipes(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      return [];
    }
  },

  async createRecipe(empresaId, data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getRecipe(empresaId, recipeId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita/${recipeId}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      throw new Error("Receita não encontrada");
    }
  },

  async updateRecipe(empresaId, recipeId, data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita/${recipeId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // A API retorna uma string de sucesso, não JSON
    const text = await response.text();
    // Se for uma string válida, retornar sucesso
    return { success: true, message: text };
  },

  async deleteRecipe(empresaId, recipeId) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita/${recipeId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // A API retorna uma string de sucesso, não JSON
    const text = await response.text();
    // Se for uma string válida, retornar sucesso
    return { success: true, message: text };
  },

  async getMenus(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      return [];
    }
  },

  async getMenu(empresaId, cardapioId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio/${cardapioId}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      throw new Error("Cardápio não encontrado");
    }
  },

  async createMenu(empresaId, data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async updateMenu(empresaId, cardapioId, data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio/${cardapioId}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getChatHistory() {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/historico-chat`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      return [];
    }
  },

  async saveChatHistory(data) {
    const response = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/historico-chat`,
      { method: "POST", body: JSON.stringify(data) }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },

  async getHistoricoBaixas(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${REDIS_API_URL}/api/v1/empresa/${empresaId}/historico_baixas/leitura`,
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 segundos para esta requisição
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.historico_baixas || [];
    } catch (error) {
      console.error("Erro ao buscar histórico de baixas:", error);
      return [];
    }
  },
};

export async function checkAPIHealth() {
  const checks = { postgres: false, mongo: false };

  try {
    const postgresResponse = await fetchWithTimeout(
      `${POSTGRES_API_URL}/empresa/buscar/1`,
      { timeout: 3000 }
    );
    checks.postgres = postgresResponse.status !== 0;
  } catch {
    checks.postgres = false;
  }

  try {
    const mongoResponse = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/1`,
      { timeout: 3000 }
    );
    checks.mongo = mongoResponse.status !== 0;
  } catch {
    checks.mongo = false;
  }

  return checks;
}
