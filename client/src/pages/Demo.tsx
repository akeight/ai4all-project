import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { TopKBar } from "@/components/TopKBar";
import { PredictionCard } from "../components/PredictionCard";
import { PredictionResult } from "../mocks/api";
import { predictImage } from "@/api/predict";
import { useAppStore } from "../store/useAppStore";
import { Upload, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Demo = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCam, setShowCam] = useState(false);
  
  const { confidenceThreshold, setConfidenceThreshold, camOpacity, setCamOpacity } = useAppStore();

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setPrediction(null);
      setShowCam(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await predictImage(selectedFile, {
        return_cam: true,
        cam_layer: "layer4",
        threshold: confidenceThreshold,
      });
      setPrediction(result);
      setShowCam(true);
      toast.success("Prediction completed!");
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOverlay = () => {
    if (!prediction?.cam_b64) {
      toast.error("No overlay image available");
      return;
    }
    
    try {
      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = prediction.cam_b64;
      link.download = `gradcam-overlay-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Overlay image downloaded");
    } catch (error) {
      toast.error("Failed to download overlay image");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Prediction Demo</h1>
        <p className="text-muted-foreground mt-2">
          Upload a blood cell image to get instant classification with explainability
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Upload & Display */}
        <div className="space-y-4">
          <Card className="card-gradient shadow-soft">
            <CardHeader>
              <CardTitle>Input Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Zone */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                  id="image-upload"
                  aria-label="Upload image"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-base"
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Selected blood cell"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PNG, JPG up to 10MB
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {selectedImage && (
                <Button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full shadow-glow"
                  size="lg"
                >
                  {loading ? "Processing..." : "Run Prediction"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Grad-CAM Overlay */}
          {prediction && (
            <Card className="card-gradient shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Grad-CAM Visualization</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCam(!showCam)}
                    >
                      {showCam ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadOverlay}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage!}
                    alt="Base image"
                    className="w-full h-64 object-contain rounded-lg"
                  />
                  {showCam && prediction?.cam_b64 && (
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{ opacity: camOpacity }}
                    >
                      <img
                        src={prediction.cam_b64}
                        alt="Grad-CAM overlay"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cam-opacity">
                    Overlay Opacity: {Math.round(camOpacity * 100)}%
                  </Label>
                  <Slider
                    id="cam-opacity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[camOpacity]}
                    onValueChange={([value]) => setCamOpacity(value)}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Predictions & Controls */}
        <div className="space-y-4">
          {prediction && (
            <>
              <PredictionCard
                topPrediction={prediction.topk[0]}
                inferenceMs={prediction.inference_ms}
                threshold={confidenceThreshold}
                fullResponse={prediction}
              />

              <Card className="card-gradient shadow-soft">
                <CardHeader>
                  <CardTitle>Top-K Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopKBar predictions={prediction.topk} threshold={confidenceThreshold} />
                </CardContent>
              </Card>
            </>
          )}

          {/* Controls */}
          <Card className="card-gradient shadow-soft">
            <CardHeader>
              <CardTitle>Prediction Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">
                  Confidence Threshold: {confidenceThreshold.toFixed(2)}
                </Label>
                <Slider
                  id="confidence-threshold"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[confidenceThreshold]}
                  onValueChange={([value]) => setConfidenceThreshold(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust threshold for high/low confidence classification
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
