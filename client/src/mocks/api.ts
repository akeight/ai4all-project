// API layer for data

export interface PredictionResult {
    topk: Array<{ label: string; prob: number }>;
    cam_b64: string;
    inference_ms: number;
  }
  
  export interface MetricsSummary {
    accuracy: number;
    macro_f1: number;
    dataset_size: number;
    per_class: Array<{
      label: string;
      precision: number;
      recall: number;
      f1: number;
      support: number;
    }>;
  }
  
  export interface ConfusionMatrix {
    labels: string[];
    matrix: number[][];
  }
  
  export interface Sample {
    id: string;
    thumb: string;
    true: string;
    pred: string;
    prob: number;
  }
  
  export interface EmbeddingPoint {
    id: string;
    x: number;
    y: number;
    class: string;
    correct: boolean;
    thumb: string;
  }
  
  // Mock delay to simulate network
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Generate mock Grad-CAM heatmap (base64 placeholder)
  const generateMockCam = (): string => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  };
  
  export const mockAPI = {
    async predict(imageB64: string, options: { return_cam: boolean; cam_layer: string; threshold: number }): Promise<PredictionResult> {
      await delay(100);
      
      // Simulate varying predictions
      const probs = [0.78, 0.17, 0.04, 0.01].sort(() => Math.random() - 0.5);
      const normalized = probs.map(p => p / probs.reduce((a, b) => a + b, 0));
      
      return {
        topk: [
          { label: "Benign", prob: normalized[0] },
          { label: "Malignant Pre-B", prob: normalized[1] },
          { label: "Malignant Pro-B", prob: normalized[2] },
          { label: "Malignant Early Pre-B", prob: normalized[3] },
        ].sort((a, b) => b.prob - a.prob),
        cam_b64: options.return_cam ? generateMockCam() : "",
        inference_ms: Math.floor(Math.random() * 20) + 20,
      };
    },
  
    async getMetricsSummary(): Promise<MetricsSummary> {
      await delay(50);
      
      return {
        accuracy: 0.978494623655914,
        macro_f1: 0.977592082302311,
        dataset_size: 2942,
        per_class: [
          { label: "Benign", precision: 0.9531, recall: 0.9838, f1: 0.9682, support: 487 },
          { label: "Malignant Pre-B", precision: 1.0, recall: 0.9541, f1: 0.9765, support: 863 },
          { label: "Malignant Pro-B", precision: 0.9782, recall: 0.9890, f1: 0.9836, support: 719 },
          { label: "Malignant Early Pre-B", precision: 0.9732, recall: 0.9909, f1: 0.9819, support: 875 },
        ],
      };
    },
  
    async getConfusionMatrix(): Promise<ConfusionMatrix> {
      await delay(50);
      
      return {
        labels: ["Benign", "Malignant Pre-B", "Malignant Pro-B", "Malignant Early Pre-B"],
        matrix: [
          [59, 0, 0, 1],
          [0, 105, 0, 2],
          [1, 0, 88, 0],
          [1, 0, 0, 108],
        ],
      };
    },
  
    async getSamples(filter?: string, classLabel?: string, offset = 0, limit = 50): Promise<Sample[]> {
      await delay(100);
      
      // Generate mock samples
      const samples: Sample[] = [];
      const classes = ["Benign", "Malignant Pre-B", "Malignant Pro-B", "Malignant Early Pre-B"];
      
      for (let i = offset; i < offset + limit; i++) {
        const trueClass = classLabel || classes[i % classes.length];
        const isCorrect = filter === "tp" || Math.random() > 0.2;
        const predClass = isCorrect ? trueClass : classes[Math.floor(Math.random() * classes.length)];
        
        samples.push({
          id: `img_${i.toString().padStart(4, "0")}`,
          thumb: `/placeholder.svg`,
          true: trueClass,
          pred: predClass,
          prob: isCorrect ? 0.7 + Math.random() * 0.29 : 0.3 + Math.random() * 0.4,
        });
      }
      
      return samples;
    },
  
    // async getEmbeddings(): Promise<{ points: EmbeddingPoint[] }> {
    //   await delay(150);
      
    //   const classes = ["Benign", "Malignant Pre-B", "Malignant Pro-B", "Malignant Early Pre-B"];
    //   const points: EmbeddingPoint[] = [];
      
    //   // Generate clustered points for each class
    //   for (let i = 0; i < 400; i++) {
    //     const classIdx = i % 4;
    //     const className = classes[classIdx];
    //     const centerX = (classIdx % 2) * 0.6 + 0.2;
    //     const centerY = Math.floor(classIdx / 2) * 0.6 + 0.2;
    //     const correct = Math.random() > 0.1;
        
    //     points.push({
    //       id: `img_${i.toString().padStart(4, "0")}`,
    //       x: centerX + (Math.random() - 0.5) * 0.3,
    //       y: centerY + (Math.random() - 0.5) * 0.3,
    //       class: className,
    //       correct,
    //       thumb: `/placeholder.svg`,
    //     });
    //   }
      
    //   return { points };
    // },
  
    
  };
  