// client/src/data/modelMetrics.ts
import rawHistory from "../../../metrics/training_history.json";
import rawSummary from "../../../metrics/validation_summary.json";

export type HistoryPoint = {
  epoch: number;
  train_loss: number;
  val_loss: number;
  train_acc: number;
  val_acc: number;
};

export type ValidationSummary = {
  accuracy: number;
  macro_f1: number;
  weighted_f1: number;
};

const history = rawHistory as HistoryPoint[];
const summary = rawSummary as ValidationSummary;

export const trainingRuns = [
  {
    id: "run_001",
    name: "Baseline ResNet50 v2",
    date: "2025-11-20",
    metrics: {
      accuracy: summary.accuracy,
      macro_f1: summary.macro_f1,
      weighted_f1: summary.weighted_f1,
      loss: history[history.length - 1]?.val_loss,
    },
    history,
  },
];

//TODO: Add to the Training Runs component
// client/src/pages/ModelDashboard.tsx
// import { trainingRuns } from "../data/modelMetrics";
// import { TrainingHistoryChart } from "../components/TrainingHistoryChart";

// export function ModelDashboard() {
//   const run = trainingRuns[0];

//   return (
//     <div className="p-4">
//       <TrainingHistoryChart run={run} />
//     </div>
//   );
// }

