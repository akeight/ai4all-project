import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface Run {
  id: string;
  name: string;
  date: string;
  metrics: {
    accuracy: number;
    macro_f1: number;
    loss: number;
  };
}

interface RunSelectorProps {
  runs: Run[];
  selectedRunId: string;
  onRunChange: (runId: string) => void;
  baselineRunId?: string;
}

export const RunSelector = ({ runs, selectedRunId, onRunChange, baselineRunId }: RunSelectorProps) => {
  const selectedRun = runs.find((r) => r.id === selectedRunId);
  const baselineRun = baselineRunId ? runs.find((r) => r.id === baselineRunId) : null;

  const getDelta = (metric: keyof Run["metrics"]) => {
    if (!selectedRun || !baselineRun) return null;
    return selectedRun.metrics[metric] - baselineRun.metrics[metric];
  };

  const formatDelta = (delta: number | null, isPercentage = true) => {
    if (delta === null) return null;
    const prefix = delta > 0 ? "+" : "";
    const value = isPercentage ? (delta * 100).toFixed(2) : delta.toFixed(4);
    return `${prefix}${value}${isPercentage ? "%" : ""}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Training Run</label>
          <Select value={selectedRunId} onValueChange={onRunChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {runs.map((run) => (
                <SelectItem key={run.id} value={run.id}>
                  {run.name} - {run.date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRun && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {(selectedRun.metrics.accuracy * 100).toFixed(1)}%
                </span>
                {getDelta("accuracy") !== null && (
                  <Badge variant={getDelta("accuracy")! > 0 ? "default" : "destructive"}>
                    {formatDelta(getDelta("accuracy"))}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Macro F1</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {(selectedRun.metrics.macro_f1 * 100).toFixed(1)}%
                </span>
                {getDelta("macro_f1") !== null && (
                  <Badge variant={getDelta("macro_f1")! > 0 ? "default" : "destructive"}>
                    {formatDelta(getDelta("macro_f1"))}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Final Loss</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {selectedRun.metrics.loss.toFixed(4)}
                </span>
                {getDelta("loss") !== null && (
                  <Badge variant={getDelta("loss")! < 0 ? "default" : "destructive"}>
                    {formatDelta(getDelta("loss"), false)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
