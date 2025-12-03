import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState } from "react";

interface DetailDrawerProps {
  sample: {
    id: string;
    thumb: string;
    true: string;
    pred: string;
    prob: number;
  } | null;
  onClose: () => void;
  camImage?: string;
}

export const DetailDrawer = ({ sample, onClose, camImage }: DetailDrawerProps) => {
  const [camOpacity, setCamOpacity] = useState(50);
  const [showCam, setShowCam] = useState(true);

  if (!sample) return null;

  const isCorrect = sample.true === sample.pred;

  return (
    <Sheet open={!!sample} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sample Details: {sample.id}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={sample.thumb}
              alt={`Sample ${sample.id}`}
              className="w-full h-full object-contain"
            />
            {camImage && showCam && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ opacity: camOpacity / 100 }}
              >
                <img
                  src={camImage}
                  alt="Grad-CAM overlay"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* CAM Controls */}
          {camImage && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Grad-CAM Overlay</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCam(!showCam)}
                >
                  {showCam ? "Hide" : "Show"}
                </Button>
              </div>
              {showCam && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Opacity: {camOpacity}%
                    </label>
                    <Slider
                      value={[camOpacity]}
                      onValueChange={(v) => setCamOpacity(v[0])}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Overlay
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold text-sm">Metadata</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Sample/True Label:</span>
                <Badge variant="outline" className="ml-2">
                  {sample.true}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Predicted:</span>
                <Badge
                  variant={isCorrect ? "default" : "destructive"}
                  className="ml-2"
                >
                  {sample.pred}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-2 font-mono font-semibold">
                  {(sample.prob * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
