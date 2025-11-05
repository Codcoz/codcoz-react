import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { postgresAPI } from "../lib/api";
import { Package, Search } from "lucide-react";

export default function ProdutosPage({ empresaId }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    postgresAPI
      .listProducts(empresaId)
      .then((data) => {
        setProdutos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [empresaId]);

  const produtosFiltrados = produtos.filter((p) =>
    p.nome?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const produtosPorVencimento = produtosFiltrados.filter(
    (p) => p.validade && new Date(p.validade) < new Date()
  );
  const produtosVencendo = produtosFiltrados.filter(
    (p) =>
      p.validade &&
      new Date(p.validade) >= new Date() &&
      new Date(p.validade) <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const produtosOK = produtosFiltrados.filter(
    (p) =>
      !p.validade ||
      new Date(p.validade) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div>
      <h1 className="text-[#333333] mb-6 text-2xl font-semibold">Produtos</h1>

      <Card className="p-6">
        {/* Barra de pesquisa */}
        {!loading && produtos.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <input
                type="text"
                placeholder="Pesquisar produto por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#ebebeb] bg-white pl-10 pr-3 py-2 text-sm placeholder:text-[#666666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002a45] focus-visible:ring-offset-2"
              />
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-[#666666] py-8">Carregando produtos...</p>
        ) : produtos.filter((p) =>
            p.nome?.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
          <p className="text-center text-[#666666] py-8">
            {searchQuery
              ? "Nenhum produto encontrado com esse nome."
              : "Nenhum produto cadastrado ainda."}
          </p>
        ) : (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 mb-1">Vencidos</p>
                <p className="text-2xl font-bold text-red-700">
                  {produtosPorVencimento.length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 mb-1">Vencendo em 7 dias</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {produtosVencendo.length}
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 mb-1">OK</p>
                <p className="text-2xl font-bold text-green-700">
                  {produtosOK.length}
                </p>
              </div>
            </div>

            {/* Produtos Vencidos */}
            {produtosPorVencimento.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3">
                 Produtos Vencidos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {produtosPorVencimento.map((produto) => (
                    <div
                      key={produto.id}
                      className="p-4 border-2 border-red-300 bg-red-50 rounded-lg"
                    >
                      <p className="font-semibold text-[#333333] mb-1">
                        {produto.nome || "-"}
                      </p>
                      <p className="text-sm text-[#666666] mb-2">
                        {produto.codigoEan || "Sem código"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-700 font-semibold">
                          Qtd: {produto.quantidade || 0}
                        </span>
                        <span className="text-xs text-red-700">
                          {produto.validade
                            ? new Date(produto.validade).toLocaleDateString("pt-BR")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Produtos Vencendo */}
            {produtosVencendo.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-3">
                  Vencendo em breve
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {produtosVencendo.map((produto) => (
                    <div
                      key={produto.id}
                      className="p-4 border-2 border-yellow-300 bg-yellow-50 rounded-lg"
                    >
                      <p className="font-semibold text-[#333333] mb-1">
                        {produto.nome || "-"}
                      </p>
                      <p className="text-sm text-[#666666] mb-2">
                        {produto.codigoEan || "Sem código"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-700 font-semibold">
                          Qtd: {produto.quantidade || 0}
                        </span>
                        <span className="text-xs text-yellow-700">
                          {produto.validade
                            ? new Date(produto.validade).toLocaleDateString("pt-BR")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Todos os Produtos */}
            <div>
              <h3 className="text-lg font-semibold text-[#333333] mb-3">
                Todos os Produtos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#ebebeb]">
                      <th className="text-left p-4 text-[#333333]">Código EAN</th>
                      <th className="text-left p-4 text-[#333333]">Nome</th>
                      <th className="text-left p-4 text-[#333333]">Quantidade</th>
                      <th className="text-left p-4 text-[#333333]">Marca</th>
                      <th className="text-left p-4 text-[#333333]">Validade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto) => {
                      const isVencido =
                        produto.validade && new Date(produto.validade) < new Date();
                      const isVencendo =
                        produto.validade &&
                        new Date(produto.validade) >= new Date() &&
                        new Date(produto.validade) <=
                          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                      return (
                        <tr
                          key={produto.id}
                          className={`border-b border-[#ebebeb] ${
                            isVencido ? "bg-red-50" : isVencendo ? "bg-yellow-50" : ""
                          }`}
                        >
                          <td className="p-4 text-[#666666]">
                            {produto.codigoEan || "-"}
                          </td>
                          <td className="p-4 text-[#333333]">
                            {produto.nome || "-"}
                          </td>
                          <td className="p-4 text-[#666666]">
                            {produto.quantidade || 0}
                          </td>
                          <td className="p-4 text-[#666666]">
                            {produto.marca || "-"}
                          </td>
                          <td
                            className={`p-4 ${
                              isVencido
                                ? "text-red-700 font-semibold"
                                : isVencendo
                                ? "text-yellow-700 font-semibold"
                                : "text-[#666666]"
                            }`}
                          >
                            {produto.validade
                              ? new Date(produto.validade).toLocaleDateString("pt-BR")
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

