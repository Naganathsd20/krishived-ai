export interface IDiseaseAnalysisResult {
  isAgriculturalImage: boolean;
  imageType?: "crop_leaf" | "plant" | "field" | "non_agricultural" | "unclear";
  cropDetected?: string;
  hasVisibleSymptoms?: boolean;
  isHealthy?: boolean;
  validationMessage?: string;
  disease: string;
  confidence: string;
  severity: "Low" | "Medium" | "High";
  symptoms: string[];
  cause: string;
  treatment: string[];
  prevention: string[];
  recommendedFertilizer: string;
  recommendedPesticide: string;
  immediateActions: string[];
}

export interface IDiseaseAnalysisDocument extends IDiseaseAnalysisResult {
  _id?: string;
  clerkId: string;
  imageUrl: string;
  createdAt?: string | Date;
}

