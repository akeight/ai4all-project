import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface PredictionCardProps {
  topPrediction: { label: string; prob: number };
  inferenceMs: number;
  threshold?: number;
  fullResponse?: any;
}

export const PredictionCard = ({
  topPrediction,
  inferenceMs,
  threshold = 0.5,
  fullResponse,
}: PredictionCardProps) => {
  const [showJson, setShowJson] = useState(false);
  
  const isHighConfidence = topPrediction.prob >= threshold;
  const confidenceColor = isHighConfidence ? "bg-success" : "bg-warning";

  return (
    <Card className="card-gradient shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Prediction Result</span>
          <Badge variant="outline" className="text-xs">
            {inferenceMs}ms
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {topPrediction.label}
            </span>
            <Badge className={`${confidenceColor} text-white`}>
              {(topPrediction.prob * 100).toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isHighConfidence
              ? "High confidence prediction"
              : "Low confidence - review recommended"}
          </p>
        </div>

        {fullResponse && (
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJson(!showJson)}
              className="w-full justify-between"
            >
              <span className="text-xs">View JSON Response</span>
              {showJson ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showJson && (
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                {JSON.stringify(fullResponse, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
