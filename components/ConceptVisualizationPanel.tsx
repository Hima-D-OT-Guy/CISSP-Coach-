import React, { useEffect, useRef } from "react";
import { ConceptVisualization } from "../types";
import mermaid from "mermaid";

interface ConceptVisualizationPanelProps {
  viz: ConceptVisualization;
}

const ConceptVisualizationPanel: React.FC<ConceptVisualizationPanelProps> = ({ viz }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viz.diagramType.startsWith("mermaid-") && chartRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
      });
      
      const renderChart = async () => {
        try {
          // Generate a unique ID for the mermaid graph
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, viz.diagramCode);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid rendering failed:", error);
          if (chartRef.current) {
            chartRef.current.innerHTML = `<div class="text-red-500 text-sm">Failed to render diagram. Code error.</div><pre class="text-xs bg-slate-100 p-2 mt-2">${viz.diagramCode}</pre>`;
          }
        }
      };

      renderChart();
    }
  }, [viz.diagramCode, viz.diagramType]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm my-4 max-w-3xl">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <h4 className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
          Visualization: {viz.title}
        </h4>
        <p className="text-xs text-indigo-700 mt-0.5">{viz.purpose}</p>
      </div>

      <div className="p-4 flex justify-center bg-white">
        {viz.diagramType.startsWith("mermaid-") ? (
          <div ref={chartRef} className="mermaid w-full flex justify-center" />
        ) : (
          <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-900 text-green-400 p-4 rounded-lg w-full overflow-x-auto">
            {viz.diagramCode}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ConceptVisualizationPanel;