import { useState, useEffect } from "react";
import { EmbeddingPlot } from "@/components/EmbeddingPlot";
import { ImageGrid } from "@/components/ImageGrid";
import { DetailDrawer } from "@/components/DetailDrawer";
import { mockAPI } from "@/mocks/api";

export const Interpret = () => {
  const [embeddingData, setEmbeddingData] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<any[]>([]);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [camImage, setCamImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadEmbeddings();
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0) {
      filterSamplesByIds();
    } else {
      setFilteredSamples([]);
    }
  }, [selectedIds]);

  const loadEmbeddings = async () => {
    const data = await mockAPI.getEmbeddings();
    setEmbeddingData(data);
  };

  const filterSamplesByIds = async () => {
    const allSamples = await mockAPI.getSamples(undefined, undefined, 0, 1000);
    const filtered = allSamples.filter((s: any) => selectedIds.includes(s.id));
    setFilteredSamples(filtered);
  };

  const handleImageClick = async (sample: any) => {
    setSelectedSample(sample);
    const result = await mockAPI.predict("", { return_cam: true, cam_layer: "layer4", threshold: 0.5 });
    setCamImage(result.cam_b64);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Interpretability & Embeddings</h1>
        <p className="text-muted-foreground">
          Explore the learned feature space. Click points to select samples and view them below.
        </p>
      </div>

      {embeddingData && (
        <EmbeddingPlot
          points={embeddingData.points}
          onPointsSelected={setSelectedIds}
        />
      )}

      {filteredSamples.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Selected Samples ({filteredSamples.length})
          </h2>
          <ImageGrid samples={filteredSamples} onImageClick={handleImageClick} />
        </div>
      )}

      {filteredSamples.length === 0 && selectedIds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Click points in the embedding plot to view corresponding images
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
