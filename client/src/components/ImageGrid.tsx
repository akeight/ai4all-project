import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  samples: Array<{
    id: string;
    thumb: string;
    true: string;
    pred: string;
    prob: number;
  }>;
  onImageClick: (sample: any) => void;
}

export const ImageGrid = ({ samples, onImageClick }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {samples.map((sample) => {
        const isCorrect = sample.true === sample.pred;
        return (
          <Card
            key={sample.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-105",
              "focus-within:ring-2 focus-within:ring-primary"
            )}
            onClick={() => onImageClick(sample)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onImageClick(sample);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Image ${sample.id}: True ${sample.true}, Predicted ${sample.pred}`}
          >
            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
              <img
                src={sample.thumb}
                alt={`Sample ${sample.id}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">True:</span>
                <Badge variant="outline" className="text-xs">
                  {sample.true}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Pred:</span>
                <Badge
                  variant={isCorrect ? "default" : "destructive"}
                  className="text-xs"
                >
                  {sample.pred}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Conf:</span>
                <span className="text-xs font-mono font-semibold">
                  {(sample.prob * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
