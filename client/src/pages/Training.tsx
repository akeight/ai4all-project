import { useState, useEffect } from "react";
import { RunSelector } from "@/components/RunSelector";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { mockAPI } from "@/mocks/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const Training = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [selectedRun, setSelectedRun] = useState<any>(null);

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    if (selectedRunId) {
      const run = runs.find((r) => r.id === selectedRunId);
      setSelectedRun(run);
    }
  }, [selectedRunId, runs]);

  const loadRuns = async () => {
    const data = await mockAPI.getTrainingRuns();
    setRuns(data);
    if (data.length > 0) {
      setSelectedRunId(data[0].id);
    }
  };

  return (
    <div className="space-y-8">
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

      {selectedRun && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loss Curve */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Training & Validation Loss</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedRun.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="epoch"
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Epoch", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Loss", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="train_loss"
                    stroke="hsl(var(--primary))"
                    name="Training Loss"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_loss"
                    stroke="hsl(var(--chart-2))"
                    name="Validation Loss"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Accuracy Curve */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Training & Validation Accuracy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedRun.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="epoch"
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Epoch", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Accuracy", angle: -90, position: "insideLeft" }}
                    domain={[0.5, 1]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="train_acc"
                    stroke="hsl(var(--primary))"
                    name="Training Accuracy"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="val_acc"
                    stroke="hsl(var(--chart-2))"
                    name="Validation Accuracy"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

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
        </>
      )}
    </div>
  );
};
