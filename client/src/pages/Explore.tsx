import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ImageGrid } from "@/components/ImageGrid";
import { DetailDrawer } from "@/components/DetailDrawer";
import { mockAPI } from "@/mocks/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ALL_CLASSES = ["Benign", "Malignant Pre-B", "Malignant Pro-B", "Malignant Early Pre-B"];

export const Explore = () => {
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(ALL_CLASSES);
  const [filterTypes, setFilterTypes] = useState<string[]>(["tp", "fp", "tn", "fn"]);
  const [probRange, setProbRange] = useState<[number, number]>([0, 100]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [camImage, setCamImage] = useState<string | undefined>(undefined);

  const pageSize = 20;

  useEffect(() => {
    loadSamples();
  }, [selectedClasses, filterTypes, probRange, currentPage]);

  const loadSamples = async () => {
    // Simulate filtering - in real app would pass to API
    const allSamples = await mockAPI.getSamples(undefined, undefined, currentPage * pageSize, pageSize);
    
    const filtered = allSamples.filter((s: any) => {
      if (!selectedClasses.includes(s.true)) return false;
      
      const probPercent = s.prob * 100;
      if (probPercent < probRange[0] || probPercent > probRange[1]) return false;
      
      const isCorrect = s.true === s.pred;
      const type = isCorrect ? "tp" : "fp";
      return filterTypes.includes(type);
    });
    
    setSamples(filtered);
  };

  const handleClassToggle = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    );
  };

  const handleTypeToggle = (type: string) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleImageClick = async (sample: any) => {
    setSelectedSample(sample);
    // Get CAM for selected image
    const result = await mockAPI.predict("", { return_cam: true, cam_layer: "layer4", threshold: 0.5 });
    setCamImage(result.cam_b64);
  };

  return (
    <div className="flex gap-6">
      {/* Filter Rail */}
      <aside className="w-64 flex-shrink-0">
        <Card className="p-6 space-y-6 sticky top-6">
          <div>
            <h3 className="font-semibold mb-3">Class Filter</h3>
            <div className="space-y-2">
              {ALL_CLASSES.map((cls) => (
                <div key={cls} className="flex items-center space-x-2">
                  <Checkbox
                    id={cls}
                    checked={selectedClasses.includes(cls)}
                    onCheckedChange={() => handleClassToggle(cls)}
                  />
                  <Label htmlFor={cls} className="text-sm cursor-pointer">
                    {cls}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Prediction Type</h3>
            <div className="space-y-2">
              {[
                { id: "tp", label: "True Positives" },
                { id: "fp", label: "False Positives" },
                { id: "tn", label: "True Negatives" },
                { id: "fn", label: "False Negatives" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    checked={filterTypes.includes(id)}
                    onCheckedChange={() => handleTypeToggle(id)}
                  />
                  <Label htmlFor={id} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">
              Confidence Range: {probRange[0]}% - {probRange[1]}%
            </h3>
            <Slider
              value={probRange}
              onValueChange={(v) => setProbRange(v as [number, number])}
              min={0}
              max={100}
              step={1}
              minStepsBetweenThumbs={5}
            />
          </div>

          <Button variant="outline" className="w-full" onClick={() => {
            setSelectedClasses(ALL_CLASSES);
            setFilterTypes(["tp", "fp", "tn", "fn"]);
            setProbRange([0, 100]);
            setCurrentPage(0);
          }}>
            Reset Filters
          </Button>
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Data Explorer</h1>
          <p className="text-muted-foreground">
            Browse and filter the dataset. Click any image to view details and Grad-CAM visualization.
          </p>
        </div>

        <ImageGrid samples={samples} onImageClick={handleImageClick} />

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer
        sample={selectedSample}
        onClose={() => setSelectedSample(null)}
        camImage={camImage}
      />
    </div>
  );
};
