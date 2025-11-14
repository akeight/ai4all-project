// Mock API layer - can be swapped for real endpoints later

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
        accuracy: 0.96,
        macro_f1: 0.95,
        dataset_size: 2942,
        per_class: [
          { label: "Benign", precision: 1.0, recall: 1.0, f1: 1.0, support: 5 },
          { label: "Malignant Pre-B", precision: 1.0, recall: 0.80, f1: 0.89, support: 5 },
          { label: "Malignant Pro-B", precision: 1.0, recall: 1.0, f1: 1.0, support: 5 },
          { label: "Malignant Early Pre-B", precision: 0.83, recall: 1.0, f1: 0.91, support: 5 },
        ],
      };
    },
  
    async getConfusionMatrix(): Promise<ConfusionMatrix> {
      await delay(50);
      
      return {
        labels: ["Benign", "Malignant Pre-B", "Malignant Pro-B", "Malignant Early Pre-B"],
        matrix: [
          [780, 34, 12, 8],
          [29, 765, 21, 11],
          [15, 24, 752, 20],
          [12, 18, 27, 743],
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
  
    async getTrainingRuns() {
      await delay(50);
      
      // Real validation training history
      const history = [
        {
          epoch: 1,
          train_loss: 1.4320,
          val_loss: 0.8957,
          train_acc: 0.3991,
          val_acc: 0.7197,
        },
        {
          epoch: 2,
          train_loss: 0.9432,
          val_loss: 0.6277,
          train_acc: 0.6506,
          val_acc: 0.8382,
        },
        {
          epoch: 3,
          train_loss: 0.6950,
          val_loss: 0.5070,
          train_acc: 0.8017,
          val_acc: 0.8508,
        },
        {
          epoch: 4,
          train_loss: 0.5625,
          val_loss: 0.4326,
          train_acc: 0.8542,
          val_acc: 0.8773,
        },
        {
          epoch: 5,
          train_loss: 0.4860,
          val_loss: 0.3795,
          train_acc: 0.8687,
          val_acc: 0.8828,
        },
        {
          epoch: 6,
          train_loss: 0.4100,
          val_loss: 0.3282,
          train_acc: 0.8990,
          val_acc: 0.9121,
        },
        {
          epoch: 7,
          train_loss: 0.3716,
          val_loss: 0.3000,
          train_acc: 0.9149,
          val_acc: 0.9177,
        },
        {
          epoch: 8,
          train_loss: 0.3552,
          val_loss: 0.2784,
          train_acc: 0.9087,
          val_acc: 0.9219,
        },
        {
          epoch: 9,
          train_loss: 0.3148,
          val_loss: 0.2499,
          train_acc: 0.9390,
          val_acc: 0.9386,
        },
        {
          epoch: 10,
          train_loss: 0.3116,
          val_loss: 0.2306,
          train_acc: 0.9317,
          val_acc: 0.9442,
        },
        {
          epoch: 11,
          train_loss: 0.2773,
          val_loss: 0.2148,
          train_acc: 0.9312,
          val_acc: 0.9512,
        },
        {
          epoch: 12,
          train_loss: 0.2621,
          val_loss: 0.1962,
          train_acc: 0.9390,
          val_acc: 0.9540,
        },
        {
          epoch: 13,
          train_loss: 0.2332,
          val_loss: 0.1873,
          train_acc: 0.9484,
          val_acc: 0.9596,
        },
        {
          epoch: 14,
          train_loss: 0.2311,
          val_loss: 0.1719,
          train_acc: 0.9442,
          val_acc: 0.9623,
        },
        {
          epoch: 15,
          train_loss: 0.2191,
          val_loss: 0.1674,
          train_acc: 0.9476,
          val_acc: 0.9637,
        },
      ]
      
      
      return [
        {
          id: "run_001",
          name: "Baseline ResNet50",
          date: "2025-11-13",
          metrics: {
            accuracy: 0.96373, 
            macro_f1: 0.9495,
            loss: 0.2191,
          },
          history: history,
        },
        // {
        //   id: "run_002",
        //   name: "EfficientNet-B3 + Augmentation",
        //   date: "2024-10-20",
        //   metrics: {
        //     accuracy: 0.91,
        //     macro_f1: 0.89,
        //     loss: 0.2191,
        //   },
        //   history: generateHistory(0.65, 1.1),
        // },
      ];
    },
  };
  