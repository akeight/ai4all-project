import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConfusionMatrixProps {
  labels: string[];
  matrix: number[][];
  onCellClick?: (trueIdx: number, predIdx: number) => void;
}

export const ConfusionMatrix = ({ labels, matrix, onCellClick }: ConfusionMatrixProps) => {
  const maxValue = Math.max(...matrix.flat());

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    return `hsl(var(--primary) / ${intensity * 0.8 + 0.1})`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Validation Confusion Matrix</h3>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Y-axis label */}
          <div className="flex items-center mb-2">
            <div className="w-24 text-sm font-medium text-muted-foreground text-right pr-2">
              Sample Label
            </div>
          </div>

          <div className="flex">
            {/* Row labels */}
            <div className="flex flex-col justify-around py-8">
              {labels.map((label) => (
                <div
                  key={label}
                  className="h-20 flex items-center justify-end pr-2 text-xs font-medium"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Matrix */}
            <div className="flex-1">
              {/* X-axis label */}
              <div className="text-center text-sm font-medium text-muted-foreground mb-2">
                Predicted Label
              </div>

              {/* Column labels */}
              <div className="flex mb-2">
                {labels.map((label) => (
                  <div
                    key={label}
                    className="flex-1 text-center text-xs font-medium px-1"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="space-y-1">
                {matrix.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((value, j) => (
                      <button
                        key={j}
                        className={cn(
                          "flex-1 h-20 flex items-center justify-center rounded-md",
                          "transition-all hover:scale-105 hover:shadow-md",
                          "focus:outline-none focus:ring-2 focus:ring-primary",
                          "text-sm font-mono font-semibold",
                          i === j ? "text-primary-foreground" : "text-foreground"
                        )}
                        style={{ backgroundColor: getColor(value) }}
                        onClick={() => onCellClick?.(i, j)}
                        aria-label={`True ${labels[i]}, Predicted ${labels[j]}: ${value} samples`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
