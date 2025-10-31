import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface TopKBarProps {
  predictions: Array<{ label: string; prob: number }>;
  threshold?: number;
}

export const TopKBar = ({ predictions, threshold = 0.5 }: TopKBarProps) => {
  const getConfidenceColor = (prob: number): string => {
    if (prob >= threshold) return "bg-success";
    if (prob >= threshold * 0.7) return "bg-warning";
    return "bg-destructive";
  };

  const getConfidenceBadge = (prob: number): string => {
    if (prob >= threshold) return "High";
    if (prob >= threshold * 0.7) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-3">
      {predictions.map((pred, idx) => (
        <div key={pred.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{pred.label}</span>
              {idx === 0 && (
                <Badge
                  variant={pred.prob >= threshold ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getConfidenceBadge(pred.prob)}
                </Badge>
              )}
            </div>
            <span className="text-muted-foreground tabular-nums">
              {(pred.prob * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-smooth",
                getConfidenceColor(pred.prob)
              )}
              style={{ width: `${pred.prob * 100}%` }}
              role="progressbar"
              aria-valuenow={pred.prob * 100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pred.label} confidence: ${(pred.prob * 100).toFixed(1)}%`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
