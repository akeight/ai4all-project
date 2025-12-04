import { useState, useMemo } from "react";
import { RunSelector, type Run as RunSelectorRun } from "@/components/RunSelector";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { trainingRuns } from "@/data/modelMetric";
import type { HistoryPoint } from "@/data/modelMetric";

type Run = RunSelectorRun & {
  history: HistoryPoint[];
};

export const Training = () => {
  const runs = trainingRuns as Run[];

  const [selectedRunId, setSelectedRunId] = useState<string>(
    runs[0]?.id ?? ""
  );

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? runs[0],
    [runs, selectedRunId]
  );

  if (!selectedRun) {
    return null;
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Training Runs</h1>
        <p className="text-muted-foreground">
          Compare training runs and analyze learning curves.
        </p>
      </div>

      {runs.length > 0 && (
        <RunSelector
          runs={runs}
          selectedRunId={selectedRunId}
          onRunChange={setSelectedRunId}
          baselineRunId={runs[1]?.id}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Loss Curve */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Training &amp; Validation Loss
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={selectedRun.history}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="epoch"
                stroke="hsl(var(--muted-foreground))"
                label={{
                  value: "Epoch",
                  position: "insideBottom",
                  offset: -5,
                }}
              />  
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                label={{
                  value: "Loss",
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={[0, 1.5]}
                ticks={[0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5]}
              />
              <Tooltip
                formatter={(value: any, name) => {
                  const label =
                    name === "train_loss"
                      ? "Train Loss"
                      : name === "val_loss"
                      ? "Val Loss"
                      : name;
                  return [Number(value).toFixed(10), label];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                }}
              />
              <Legend />
              {/* 2 lines: training + validation */}
              <Line
                type="monotone"
                dataKey="train_loss"
                name="Train Loss"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="val_loss"
                name="Val Loss"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Accuracy Curve */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Training &amp; Validation Accuracy
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={selectedRun.history}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="epoch"
                stroke="hsl(var(--muted-foreground))"
                label={{
                  value: "Epoch",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                label={{
                  value: "Accuracy",
                  angle: -90,
                  position: "insideLeft"
                }}
                domain={[0.3, 1]}
                ticks={[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]}
              />
              <Tooltip
                formatter={(value: any, name) => {
                  const label =
                    name === "train_acc"
                      ? "Train Accuracy"
                      : name === "val_acc"
                      ? "Val Accuracy"
                      : name;
                  return [Number(value).toFixed(4), label];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.75rem",
                }}
              />
              <Legend />
              {/* 2 lines: training + validation */}
              <Line
                type="monotone"
                dataKey="train_acc"
                name="Train Accuracy"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="val_acc"
                name="Val Accuracy"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};



          {/* Notes */}
          {/* <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Training Notes & Observations</h3>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Architecture:</strong> ResNet50 backbone with custom classification head
                  (4 output classes).
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Training Details:</strong> Batch size 32, learning rate 0.0001 with
                  ReduceLROnPlateau scheduler. Early stopping patience of 10 epochs.
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Data Augmentation:</strong> Random rotation (±15°), horizontal flip,
                  color jitter, and normalization using ImageNet statistics.
                </AlertDescription>
              </Alert>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong> Consider focal loss for class imbalance, test
                  ensemble methods, and explore attention mechanisms for better interpretability.
                </AlertDescription>
              </Alert>

              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-600">
                  <strong>Caution:</strong> This is a research prototype. Not validated for clinical
                  use. Always consult medical professionals for diagnosis.
                </AlertDescription>
              </Alert>
            </div>
          </Card> */}
