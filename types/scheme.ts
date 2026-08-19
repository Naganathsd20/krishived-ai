export type SchemeCategory =
  | "Income Support"
  | "Crop Insurance"
  | "Financial Assistance"
  | "Irrigation / Solar"
  | "Agriculture Infrastructure"
  | "Soil / Fertilizer"
  | "Equipment & Machinery"
  | "Farmer Welfare"
  | "Other Agriculture Schemes";

export type SchemeLevel = "Central" | "State";

export interface IGovernmentScheme {
  id: string;
  name: string;
  shortName: string;
  ministry: string;
  department: string;
  category: SchemeCategory;
  schemeLevel: SchemeLevel;
  state: string; // "Central" or State name (e.g. "Maharashtra", "Uttar Pradesh")
  farmerType: string[]; // e.g. ["Small & Marginal Farmers", "All Landholding Farmers"]
  description: string;
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialUrl: string; // Official portal URL (strictly .gov.in or .nic.in)
  helpline: string;
  lastUpdated: string;
  source: string;
}

export interface ISchemeResponse {
  success: boolean;
  totalRecords: number;
  schemes: IGovernmentScheme[];
  categories: SchemeCategory[];
  states: string[];
  error?: string;
}
