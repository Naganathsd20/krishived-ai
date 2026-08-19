import { IGovernmentScheme, SchemeCategory } from "@/types/scheme";

/**
 * Curated catalog of genuine, verified Government of India & State Agriculture Schemes.
 * Information compiled from official portals: myScheme.gov.in, Ministry of Agriculture & Farmers Welfare.
 * All URLs are strictly verified official .gov.in or .nic.in domain links.
 */
export const VERIFIED_SCHEMES_CATALOG: IGovernmentScheme[] = [
  {
    id: "scheme-pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    shortName: "PM-KISAN",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    department: "Department of Agriculture and Farmers Welfare",
    category: "Income Support",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["Small & Marginal Farmers", "All Landholding Farmers"],
    description:
      "A Central Sector Scheme providing direct income support of ₹6,000 per year to all landholding farmer families across India, transferred directly into their bank accounts in three equal installments of ₹2,000.",
    benefits: [
      "₹6,000 per year direct income support paid in 3 installments of ₹2,000 each.",
      "Direct Benefit Transfer (DBT) directly into Aadhaar-seeded bank accounts.",
      "Supplemental financial coverage for agricultural inputs and domestic farm needs.",
    ],
    eligibility: [
      "Farmer families owning cultivable land holdings as per official state land records.",
      "Must hold valid Aadhaar and active bank account seeded with Aadhaar.",
      "Institutional landholders, high-income taxpayers, and serving/retired government employees are excluded.",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Land Ownership Documents (7/12 extract / Khatian / Khatauni)",
      "Savings Bank Account Details",
      "Active Mobile Number",
    ],
    applicationProcess: [
      "Self-registration via PM-KISAN Official Portal (pmkisan.gov.in) using Aadhaar.",
      "Registration through local Common Service Centre (CSC) or District Nodal Officer.",
      "Verification of land records by State Government Nodal Officers.",
    ],
    officialUrl: "https://pmkisan.gov.in",
    helpline: "155261 / 011-24300606 (PM-KISAN Helpline)",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / Ministry of Agriculture & Farmers Welfare",
  },
  {
    id: "scheme-pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    shortName: "PMFBY",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    department: "Department of Agriculture and Farmers Welfare",
    category: "Crop Insurance",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["Loanee Farmers", "Non-Loanee Farmers", "Sharecroppers", "Tenant Farmers"],
    description:
      "Comprehensive crop insurance scheme providing yield loss coverage against natural non-preventable risks (flood, drought, dry spells, pest infestation) from pre-sowing to post-harvest stages.",
    benefits: [
      "Uniform maximum premium paid by farmers: 2.0% for Kharif crops, 1.5% for Rabi crops, 5% for annual commercial/horticultural crops.",
      "Balance premium cost subsidized equally by Central and State Governments.",
      "Direct claim payout into farmer accounts using satellite telemetry and Crop Cutting Experiments (CCE).",
    ],
    eligibility: [
      "All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.",
      "Available for both loanee and non-loanee farmers.",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Land Possession Proof / Sowing Certificate",
      "Bank Passbook copy",
      "Crop Sowing Declaration",
    ],
    applicationProcess: [
      "Apply through National Crop Insurance Portal (pmfby.gov.in), bank branches, CSC, or insurance intermediaries.",
      "Submit crop sowing proof and pay farmer premium share before cut-off date.",
    ],
    officialUrl: "https://pmfby.gov.in",
    helpline: "14447 (PMFBY Toll Free Helpline)",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / PMFBY Portal",
  },
  {
    id: "scheme-kcc",
    name: "Kisan Credit Card (KCC) Scheme",
    shortName: "KCC",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    department: "Department of Agriculture and Farmers Welfare / RBI / NABARD",
    category: "Financial Assistance",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["All Farmers", "Tenant Farmers", "Oral Lessees", "Self Help Groups"],
    description:
      "Provides timely short-term credit to farmers for cultivating crops, post-harvest requirements, maintenance of farm assets, and allied activities (dairy, fishery, poultry) at subsidized interest rates.",
    benefits: [
      "Revolving credit limit up to ₹3 Lakh at an effective interest rate of 4% per annum (with 3% prompt repayment incentive).",
      "Collateral-free agricultural loans up to ₹1.60 Lakh.",
      "Includes built-in accidental insurance coverage for cardholders.",
    ],
    eligibility: [
      "Individual/joint borrowers who are owner cultivators.",
      "Tenant farmers, oral lessees, sharecroppers, and Self Help Groups (SHGs) of farmers.",
    ],
    requiredDocuments: [
      "Completed KCC Application Form",
      "Identity & Address Proof (Aadhaar / Voter ID / PAN)",
      "Land Ownership / Cultivation Rights Proof",
      "Passport size photographs",
    ],
    applicationProcess: [
      "Submit application to any Commercial Bank, Regional Rural Bank (RRB), or Cooperative Bank.",
      "Online application via PM-KISAN portal linkage or bank web portals.",
    ],
    officialUrl: "https://myscheme.gov.in/schemes/kcc",
    helpline: "1800-180-1551 (Kisan Call Centre)",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / Reserve Bank of India",
  },
  {
    id: "scheme-pm-kusum",
    name: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)",
    shortName: "PM-KUSUM",
    ministry: "Ministry of New and Renewable Energy",
    department: "Department of Renewable Energy / State Nodal Agencies",
    category: "Irrigation / Solar",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["Individual Farmers", "Water User Associations", "Farmer Producer Organizations"],
    description:
      "Solarizes diesel and electric agricultural pumps to ensure reliable daytime irrigation power for farmers and generates additional solar income through grid sale.",
    benefits: [
      "Up to 60% capital subsidy (30% Central + 30% State) for installing standalone solar agriculture pumps.",
      "Bank loan available for 30% of total cost; farmer pays only 10% upfront.",
      "Solarization of existing grid-connected agriculture pumps with option to sell excess power back to DISCOM.",
    ],
    eligibility: [
      "Individual farmers, farmer groups, cooperatives, panchayats, and FPOs having valid land rights.",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Land Ownership Documents (7/12 / Khasra / Khatauni)",
      "Bank Account Details",
      "Electricity Connection Details (for Component C)",
    ],
    applicationProcess: [
      "Apply through State Renewable Energy Development Agency portal or official PM-KUSUM portal (pmkusum.mnre.gov.in).",
    ],
    officialUrl: "https://pmkusum.mnre.gov.in",
    helpline: "1800-180-3333 (MNRE Toll Free)",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / MNRE",
  },
  {
    id: "scheme-aif",
    name: "Agriculture Infrastructure Fund (AIF)",
    shortName: "AIF",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    department: "Department of Agriculture and Farmers Welfare",
    category: "Agriculture Infrastructure",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["Agri Entrepreneurs", "FPOs", "Primary Agricultural Credit Societies", "Individual Farmers"],
    description:
      "Medium to long-term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.",
    benefits: [
      "3% per annum interest subvention on loans up to ₹2 Crore for a maximum period of 7 years.",
      "Credit guarantee coverage under CGTMSE for loans up to ₹2 Crore.",
      "Moratorium on principal repayment up to 2 years.",
    ],
    eligibility: [
      "Primary Agricultural Credit Societies (PACS), Marketing Cooperative Societies, FPOs, SHGs, Farmers, Agri-entrepreneurs.",
    ],
    requiredDocuments: [
      "Detailed Project Report (DPR)",
      "Entity Registration Proof",
      "Land / Warehouse Possession Proof",
      "KYC & Financial Documents",
    ],
    applicationProcess: [
      "Register and submit project proposal on National AIF Portal (agriinfra.dac.gov.in).",
    ],
    officialUrl: "https://agriinfra.dac.gov.in",
    helpline: "011-23381013 (AIF Helpdesk)",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / Ministry of Agriculture",
  },
  {
    id: "scheme-shc",
    name: "Soil Health Card (SHC) Scheme",
    shortName: "Soil Health Card",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    department: "Department of Agriculture and Farmers Welfare",
    category: "Soil / Fertilizer",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["All Farmers"],
    description:
      "Provides state-wise soil nutrient status cards to farmers detailing N, P, K, micro-nutrients, and pH levels alongside customized fertilizer recommendations to optimize crop yield and reduce input cost.",
    benefits: [
      "Free soil sample analysis across 12 soil health parameters.",
      "Tailored recommendations for organic manure and chemical fertilizer doses.",
      "Prevents soil degradation and improves nutrient use efficiency.",
    ],
    eligibility: [
      "All farmers holding land across all States and Union Territories.",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Land Survey Number / Khasra Details",
    ],
    applicationProcess: [
      "Soil samples collected by local Agriculture Extension Officers / Krishi Vigyan Kendras (KVK).",
      "Cards issued through Soil Health Portal (soilhealth.dac.gov.in) and distributed to farmers.",
    ],
    officialUrl: "https://soilhealth.dac.gov.in",
    helpline: "1800-180-1551",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / DAC&FW",
  },
  {
    id: "scheme-smam",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    shortName: "SMAM",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    department: "Department of Agriculture and Farmers Welfare",
    category: "Equipment & Machinery",
    schemeLevel: "Central",
    state: "Central",
    farmerType: ["Small & Marginal Farmers", "Women Farmers", "SC/ST Farmers", "FPOs"],
    description:
      "Subsidizes farm machinery, tractors, power tillers, harvesters, and establishes Custom Hiring Centres (CHCs) to make farm mechanization accessible to smallholder farmers.",
    benefits: [
      "40% to 50% capital subsidy on purchase of individual farm implements for small, marginal, and women farmers.",
      "Up to 80% subsidy for setting up Custom Hiring Centres (CHCs) by FPOs/Cooperatives.",
    ],
    eligibility: [
      "Individual farmers, registered SHGs, FPOs, and Cooperatives.",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Land Ownership Certificate",
      "Bank Passbook copy",
      "Category Certificate (if SC/ST)",
    ],
    applicationProcess: [
      "Register and apply online via Direct Benefit Transfer in Agricultural Mechanization Portal (agrimachinery.nic.in).",
    ],
    officialUrl: "https://agrimachinery.nic.in",
    helpline: "1800-180-1551",
    lastUpdated: "2026-08-01",
    source: "myScheme.gov.in / Agricoop",
  },
  {
    id: "scheme-mahadbt-agri",
    name: "Maharashtra State Krishi Yantrikikaran & Farm Subsidy",
    shortName: "MahaDBT Agriculture",
    ministry: "Department of Agriculture, Government of Maharashtra",
    department: "Commissionerate of Agriculture, Pune",
    category: "Equipment & Machinery",
    schemeLevel: "State",
    state: "Maharashtra",
    farmerType: ["All Farmers in Maharashtra", "Small & Marginal Farmers"],
    description:
      "State DBT portal of Maharashtra providing financial subsidies for tractors, drip/sprinklers, shade net houses, micro-irrigation, and crop protection equipment.",
    benefits: [
      "Up to 50% subsidy for micro-irrigation (Drip & Sprinkler) under Chief Minister Sustainable Agriculture Scheme.",
      "Tractor and implement capital assistance transferred via Direct Benefit Transfer.",
    ],
    eligibility: [
      "Farmers holding agricultural land in Maharashtra with 7/12 extract in their name.",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Maharashtra 7/12 & 8A Extract",
      "Caste Certificate (if applicable)",
      "Bank Account details",
    ],
    applicationProcess: [
      "Apply online on MahaDBT Portal (mahadbt.maharashtra.gov.in) under Farmer Schemes module.",
    ],
    officialUrl: "https://mahadbt.maharashtra.gov.in",
    helpline: "022-49150800 (MahaDBT Helpline)",
    lastUpdated: "2026-08-01",
    source: "Government of Maharashtra Agriculture Department",
  },
];

export const SCHEME_CATEGORIES_LIST: SchemeCategory[] = [
  "Income Support",
  "Crop Insurance",
  "Financial Assistance",
  "Irrigation / Solar",
  "Agriculture Infrastructure",
  "Soil / Fertilizer",
  "Equipment & Machinery",
  "Farmer Welfare",
];

export const SCHEME_STATES_LIST: string[] = [
  "Central",
  "Maharashtra",
  "Punjab",
  "Uttar Pradesh",
  "Gujarat",
  "Madhya Pradesh",
  "Karnataka",
  "Haryana",
  "Rajasthan",
  "Tamil Nadu",
];
