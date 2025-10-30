import { useState, useEffect } from "react";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";
import { ImageGrid } from "@/components/ImageGrid";
import { DetailDrawer } from "@/components/DetailDrawer";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAPI } from "@/mocks/api";

export const Errors = () => {
  const [confusionData, setConfusionData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [filteredSamples, setFilteredSamples] = useState<any[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ true: number; pred: number } | null>(null);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [camImage, setCamImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [confusion, metrics] = await Promise.all([
      mockAPI.getConfusionMatrix(),
      mockAPI.getMetricsSummary(),
    ]);
    setConfusionData(confusion);
    setMetricsData(metrics);
  };

  const handleCellClick = async (trueIdx: number, predIdx: number) => {
    setSelectedCell({ true: trueIdx, pred: predIdx });
    
    // Filter samples for this cell
    const allSamples = await mockAPI.getSamples(undefined, undefined, 0, 1000);
    const filtered = allSamples.filter((s: any) => {
      const trueLabel = confusionData.labels[trueIdx];
      const predLabel = confusionData.labels[predIdx];
      return s.true === trueLabel && s.pred === predLabel;
    });
    
    setFilteredSamples(filtered.slice(0, 50)); // Limit to 50 samples
  };

  const handleImageClick = async (sample: any) => {
    setSelectedSample(sample);
    const result = await mockAPI.predict("", { return_cam: true, cam_layer: "layer4", threshold: 0.5 });
    setCamImage(result.cam_b64);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Analysis</h1>
        <p className="text-muted-foreground">
          Analyze model performance and errors. Click confusion matrix cells to view specific error cases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {confusionData && (
          <ConfusionMatrix
            labels={confusionData.labels}
            matrix={confusionData.matrix}
            onCellClick={handleCellClick}
          />
        )}

        {metricsData && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Per-Class Performance</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Precision</TableHead>
                    <TableHead className="text-right">Recall</TableHead>
                    <TableHead className="text-right">F1 Score</TableHead>
                    <TableHead className="text-right">Support</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.per_class.map((cls: any) => (
                    <TableRow key={cls.label}>
                      <TableCell className="font-medium">{cls.label}</TableCell>
                      <TableCell className="text-right font-mono">
                        {(cls.precision * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(cls.recall * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(cls.f1 * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {cls.support.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {selectedCell && filteredSamples.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Samples: True {confusionData.labels[selectedCell.true]} → Predicted{" "}
            {confusionData.labels[selectedCell.pred]} ({filteredSamples.length})
          </h2>
          <ImageGrid samples={filteredSamples} onImageClick={handleImageClick} />
        </div>
      )}

      {!selectedCell && (
        <div className="text-center py-12 text-muted-foreground">
          Click a cell in the confusion matrix to view samples
        </div>
      )}

      <DetailDrawer
        sample={selectedSample}
        onClose={() => setSelectedSample(null)}
        camImage={camImage}
      />
    </div>
  );
};
