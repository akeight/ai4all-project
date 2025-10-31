import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Target, TrendingUp, Clock, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface MetricsCardsProps {
  accuracy: number;
  macroF1: number;
  inferenceMs: number;
  datasetSize: number;
}

export const MetricsCards = ({ accuracy, macroF1, inferenceMs, datasetSize }: MetricsCardsProps) => {
  const metrics = [
    {
      title: "Overall Accuracy",
      value: `${(accuracy * 100).toFixed(1)}%`,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      tooltip: "Percentage of correct predictions across all classes",
    },
    {
      title: "Macro F1 Score",
      value: macroF1.toFixed(3),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      tooltip: "Harmonic mean of precision and recall, averaged across classes",
    },
    {
      title: "Avg Inference",
      value: `${inferenceMs}ms`,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      tooltip: "Average time to process a single image",
    },
    {
      title: "Dataset Size",
      value: datasetSize.toLocaleString(),
      icon: Database,
      color: "text-accent",
      bgColor: "bg-accent/10",
      tooltip: "Total number of samples in the evaluation set",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Tooltip key={metric.title}>
            <TooltipTrigger asChild>
              <Card className="card-gradient shadow-soft hover:shadow-lg transition-smooth cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{metric.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
