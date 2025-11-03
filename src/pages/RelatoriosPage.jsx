import { useState } from "react";
import { Card } from "../components/ui/Card";
import { BarChart3 } from "lucide-react";

const DASHBOARDS = [
  {
    id: "codcoz",
    name: "CodCoz",
    url: "https://app.powerbi.com/view?r=eyJrIjoiZDNmNjgzMGUtNDYxZi00ODI5LTg5ODAtY2ZhNDJmMGFjNGU5IiwidCI6ImIxNDhmMTRjLTIzOTctNDAyYy1hYjZhLTFiNDcxMTE3N2FjMCJ9",
  },
  {
    id: "exptech",
    name: "ExpoTech",
    url: "https://app.powerbi.com/view?r=eyJrIjoiYzlmOWY4ZTUtOWNlYS00ZDJlLWI0MGUtNTNhNWM3ZDdmMjMwIiwidCI6ImIxNDhmMTRjLTIzOTctNDAyYy1hYjZhLTFiNDcxMTE3N2FjMCJ9",
  },
];

export default function RelatoriosPage({ empresaId }) {
  const [selectedDashboard, setSelectedDashboard] = useState(DASHBOARDS[0].id);

  const currentDashboard = DASHBOARDS.find((d) => d.id === selectedDashboard);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#002a45]" />
          <h1 className="text-[#333333] text-2xl font-semibold">Relatórios e Dashboards</h1>
        </div>
      </div>

      {/* Dashboard Selector */}
      <div className="mb-6 flex gap-2 border-b border-[#ebebeb]">
        {DASHBOARDS.map((dashboard) => (
          <button
            key={dashboard.id}
            onClick={() => setSelectedDashboard(dashboard.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
              selectedDashboard === dashboard.id
                ? "text-[#002a45] border-b-2 border-[#002a45]"
                : "text-[#666666] hover:text-[#333333]"
            }`}
          >
            <span>{dashboard.name}</span>
          </button>
        ))}
      </div>

      {/* Power BI iframe */}
      <Card className="p-0 overflow-hidden">
        <iframe
          src={currentDashboard.url}
          className="w-full h-[calc(95vh-150px)] border-0"
          title={currentDashboard.name}
          allowFullScreen
        />
      </Card>
    </div>
  );
}

