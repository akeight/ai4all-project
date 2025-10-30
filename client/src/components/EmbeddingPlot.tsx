import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Point {
  id: string;
  x: number;
  y: number;
  class: string;
  correct: boolean;
  thumb: string;
}

interface EmbeddingPlotProps {
  points: Point[];
  onPointsSelected?: (ids: string[]) => void;
}

const COLORS = {
  "ALL-Type1": "hsl(210, 80%, 50%)",
  "ALL-Type2": "hsl(150, 70%, 45%)",
  "ALL-Type3": "hsl(30, 75%, 55%)",
  "ALL-Type4": "hsl(280, 65%, 50%)",
};

export const EmbeddingPlot = ({ points, onPointsSelected }: EmbeddingPlotProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colorBy, setColorBy] = useState<"class" | "correctness">("class");
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, width, height);

    // Draw points
    points.forEach((point) => {
      const x = (point.x + 1) * width / 2;
      const y = (1 - point.y) * height / 2;

      // Color
      if (colorBy === "class") {
        ctx.fillStyle = COLORS[point.class as keyof typeof COLORS] || "hsl(var(--primary))";
      } else {
        ctx.fillStyle = point.correct ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)";
      }

      // Shape (circle for correct, square for incorrect)
      const size = selectedPoints.has(point.id) ? 8 : 5;
      
      if (point.correct) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
      }

      // Highlight selected
      if (selectedPoints.has(point.id)) {
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [points, colorBy, selectedPoints]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;

    // Find clicked point
    const clicked = points.find((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 0.05;
    });

    if (clicked) {
      const newSelected = new Set(selectedPoints);
      if (newSelected.has(clicked.id)) {
        newSelected.delete(clicked.id);
      } else {
        newSelected.add(clicked.id);
      }
      setSelectedPoints(newSelected);
      onPointsSelected?.(Array.from(newSelected));
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;

    const hovered = points.find((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 0.05;
    });

    setHoveredPoint(hovered || null);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">UMAP Embedding Space</h3>
        <Select value={colorBy} onValueChange={(v) => setColorBy(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="class">Color by Class</SelectItem>
            <SelectItem value="correctness">Color by Correctness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto border rounded-lg cursor-crosshair bg-card"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />

        {hoveredPoint && (
          <div className="absolute bottom-4 left-4 bg-popover border rounded-lg p-3 shadow-lg pointer-events-none">
            <img
              src={hoveredPoint.thumb}
              alt="Preview"
              className="w-24 h-24 object-cover rounded mb-2"
            />
            <div className="text-xs space-y-1">
              <div>Class: <span className="font-semibold">{hoveredPoint.class}</span></div>
              <div>Status: <span className={hoveredPoint.correct ? "text-green-600" : "text-red-600"}>
                {hoveredPoint.correct ? "Correct" : "Incorrect"}
              </span></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Click points to select/deselect. Selected points will filter the image grid below.</p>
        <p className="mt-1">Circles = Correct predictions, Squares = Incorrect predictions</p>
      </div>
    </Card>
  );
};
