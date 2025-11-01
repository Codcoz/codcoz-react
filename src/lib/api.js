/**
 * Utility functions for API calls with proper error handling and CORS support
 */

// Usar proxy do Vite em desenvolvimento, URLs diretas em produção
const isDevelopment = import.meta.env.DEV;
const POSTGRES_API_URL = isDevelopment
  ? "/api/postgres"
  : "https://codcoz-api-postgres.koyeb.app";
const MONGO_API_URL = isDevelopment
  ? "/api/mongo"
  : "https://codcoz-api-mongo.onrender.com";

/**
 * Fetch with timeout support
 */
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
    // Se for erro de CORS ou rede, não precisa logar (é esperado em desenvolvimento)
    if (
      error.message?.includes("CORS") ||
      error.message?.includes("Failed to fetch")
    ) {
      throw error;
    }
    throw error;
  }
}

/**
 * PostgreSQL API calls
 */
export const postgresAPI = {
  /**
   * Get employee by email
   */
  async getEmployeeByEmail(email) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/funcionario/buscar/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching employee:", error);
      throw error;
    }
  },

  /**
   * Create new employee
   */
  async createEmployee(data) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/funcionario/inserir`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(id, data) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/funcionario/atualizar/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  },

  /**
   * Dismiss employee
   */
  async dismissEmployee(id) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/funcionario/demitir/${id}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error dismissing employee:", error);
      throw error;
    }
  },

  /**
   * Get product stock quantity
   */
  async getProductStockQuantity(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/quantidade-estoque/${empresaId}`
      );

      if (!response.ok) {
        return 0;
      }

      return await response.json();
    } catch (error) {
      console.warn("Error fetching stock quantity:", error);
      return 0;
    }
  },

  /**
   * Get products near expiration
   */
  async getProductsNearExpiration(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/quantidade/proximo-validade/${empresaId}`
      );

      if (!response.ok) {
        return 0;
      }

      return await response.json();
    } catch (error) {
      console.warn("Error fetching products near expiration:", error);
      return 0;
    }
  },

  /**
   * Get products with low stock
   */
  async getProductsLowStock(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/quantidade/estoque-baixo/${empresaId}`
      );

      if (!response.ok) {
        return 0;
      }

      return await response.json();
    } catch (error) {
      console.warn("Error fetching low stock products:", error);
      return 0;
    }
  },

  /**
   * List all products
   */
  async listProducts(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/produto/listar/estoque/${empresaId}`
      );

      if (!response.ok) {
        // 404 significa que não há produtos ou empresa não existe - não é erro crítico
        if (response.status === 404) {
          return [];
        }
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Não logar 404 (empresa sem produtos é esperado)
      if (!error.message?.includes("404")) {
        console.error("Error listing products:", error);
      }
      return [];
    }
  },

  /**
   * Get tasks by email and date
   */
  async getTasksByDate(email, data) {
    try {
      const response = await fetchWithTimeout(
        `${POSTGRES_API_URL}/tarefa/buscar-data/${encodeURIComponent(
          email
        )}?data=${data}`
      );

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  },
};

/**
 * MongoDB API calls
 */
export const mongoAPI = {
  /**
   * Get all ingredients
   */
  async getIngredients(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/ingrediente`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Não logar erros de CORS (esperados em desenvolvimento)
      if (
        !error.message?.includes("CORS") &&
        !error.message?.includes("Failed to fetch")
      ) {
        console.error("Error fetching ingredients:", error);
      }
      return [];
    }
  },

  /**
   * Create ingredient
   */
  async createIngredient(empresaId, data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/ingrediente`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating ingredient:", error);
      throw error;
    }
  },

  /**
   * Update ingredient
   */
  async updateIngredient(empresaId, ingredientId, data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/ingrediente/${ingredientId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating ingredient:", error);
      throw error;
    }
  },

  /**
   * Get all recipes
   */
  async getRecipes(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Não logar erros de CORS (esperados em desenvolvimento)
      if (
        !error.message?.includes("CORS") &&
        !error.message?.includes("Failed to fetch")
      ) {
        console.error("Error fetching recipes:", error);
      }
      return [];
    }
  },

  /**
   * Create recipe
   */
  async createRecipe(empresaId, data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  },

  /**
   * Update recipe
   */
  async updateRecipe(empresaId, recipeId, data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/receita/${recipeId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  },

  /**
   * Get all menus (cardapios)
   */
  async getMenus(empresaId) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Não logar erros de CORS (esperados em desenvolvimento)
      if (
        !error.message?.includes("CORS") &&
        !error.message?.includes("Failed to fetch")
      ) {
        console.error("Error fetching menus:", error);
      }
      return [];
    }
  },

  /**
   * Create menu
   */
  async createMenu(empresaId, data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating menu:", error);
      throw error;
    }
  },

  /**
   * Update menu
   */
  async updateMenu(empresaId, cardapioId, data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/empresa/${empresaId}/cardapio/${cardapioId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating menu:", error);
      throw error;
    }
  },

  /**
   * Get chat history
   */
  async getChatHistory() {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/historico-chat`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Não logar erros de CORS (esperados em desenvolvimento)
      if (
        !error.message?.includes("CORS") &&
        !error.message?.includes("Failed to fetch")
      ) {
        console.error("Error fetching chat history:", error);
      }
      return [];
    }
  },

  /**
   * Save chat history
   */
  async saveChatHistory(data) {
    try {
      const response = await fetchWithTimeout(
        `${MONGO_API_URL}/api/v1/historico-chat`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving chat history:", error);
      throw error;
    }
  },
};

/**
 * Check if APIs are available
 */
export async function checkAPIHealth() {
  const checks = {
    postgres: false,
    mongo: false,
  };

  try {
    const postgresResponse = await fetchWithTimeout(
      `${POSTGRES_API_URL}/empresa/buscar/1`,
      { timeout: 3000 }
    );
    checks.postgres = postgresResponse.status !== 0;
  } catch (e) {
    checks.postgres = false;
  }

  try {
    const mongoResponse = await fetchWithTimeout(
      `${MONGO_API_URL}/api/v1/empresa/1`,
      { timeout: 3000 }
    );
    checks.mongo = mongoResponse.status !== 0;
  } catch (e) {
    checks.mongo = false;
  }

  return checks;
}
