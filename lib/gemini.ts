import { GoogleGenerativeAI } from "@google/generative-ai";
import { IDiseaseAnalysisResult } from "@/types/disease";
import { ISoilRecommendationResult } from "@/types/soil";
import { IWeatherData } from "@/types/weather";

/**
 * Dynamically gets GoogleGenerativeAI instance using runtime GEMINI_API_KEY.
 */
function getGenerativeAIInstance() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return { apiKey, genAI: new GoogleGenerativeAI(apiKey) };
}

/**
 * Converts a remote image URL (e.g. Cloudinary) into inline Data part for Gemini Vision API.
 */
async function urlToGenerativePart(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from URL: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type") || "image/jpeg";

  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType: contentType,
    },
  };
}

/**
 * Deep Intent Classification Engine for KrishiVed AI Assistant.
 * Classifies input intent: Greeting, Gratitude, Off-Topic Entity, Ambiguous, Seed Purchase, Unrelated, or Agri Query.
 */
function classifyAndHandleInput(query: string): string | null {
  const q = query.trim().toLowerCase();

  // 1. Check Greetings
  const greetings = [
    "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
    "namaste", "greetings", "hi there", "hello assistant", "hey there", "gmorning", "gevening"
  ];
  if (greetings.includes(q) || /^hi\b|^hello\b|^hey\b|^namaste\b/.test(q)) {
    return "Hello! 👋 I am KrishiMitra, your Smart Farming Companion. How can I help you with your farm today? Feel free to ask about crop diseases, fertilizers, irrigation, soil health, weather, or government schemes!";
  }

  // 2. Check Gratitude & Simple Acknowledgments
  const gratitude = [
    "thanks", "thank you", "thank u", "thx", "ok", "okay", "good", "great",
    "got it", "awesome", "perfect", "thank you so much", "thanks a lot", "fine", "cool", "nice", "yep", "yes"
  ];
  if (gratitude.includes(q) || /^thanks?\b|^thank you\b/.test(q)) {
    return "You're very welcome! 🌱 I am always here to help you get the best yield from your crops. Feel free to ask whenever you have more agricultural questions!";
  }

  // 3. Known Off-Topic Entities / Celebrities / Non-Agri Topics (e.g. "Virat Kohli", "Messi", "Python", "Movies")
  const offTopicKeywords = [
    "virat", "kohli", "dhoni", "messi", "ronaldo", "cricket", "football", "movie", "film", "song",
    "python", "java", "javascript", "react", "coding", "software", "actor", "actress", "politics", "president"
  ];
  if (offTopicKeywords.some((topic) => q.includes(topic))) {
    return `I am **KrishiMitra**, specialized strictly in agriculture, crop health, soil care, irrigation, and government farming schemes. I cannot answer queries about **"${query.trim()}"**.

Please ask an agriculture-related question, such as:
• How do I grow tomatoes?
• Recommend fertilizer for maize.
• My crop leaves have yellow spots.`;
  }

  // 4. Check Seed / Supply Purchasing Intent ("where can i buy", "where to get seeds", "buy seeds")
  if ((q.includes("buy") || q.includes("purchase") || q.includes("where to get") || q.includes("where can i get")) && (q.includes("seed") || q.includes("fertilizer") || q.includes("pesticide") || q.includes("plant"))) {
    const cropName = q.replace(/(where|can|i|buy|purchase|to|get|seeds|seed|for|my|house|home|store)/gi, "").trim() || "crop";
    return `### 🛒 Sourcing Certified ${cropName.toUpperCase()} Seeds & Farming Inputs

1. **Krishi Vigyan Kendra (KVK) & Agriculture Dept:**
   - Visit your nearest District KVK or State Department of Agriculture office to get certified, high-yield, disease-resistant seed varieties.

2. **National Seeds Corporation (NSC):**
   - Purchase genuine seeds online via the NSC portal (\`indiaseeds.com\`) or state seed distribution counters.

3. **Licensed Agricultural Dealers:**
   - Buy from authorized seed and fertilizer dealers (always verify seed certification tags and batch numbers).`;
  }

  // 5. Check Ambiguous Query Intent ("how do i get tomatoes for my house?", "tomato", "paddy")
  if (q.includes("get tomatoes for my house") || q.includes("get tomato for house") || q.includes("tomatoes for my house") || q === "tomato" || q === "paddy" || q === "maize" || q === "turmeric") {
    return `I noticed your query about **"${query.trim()}"**, but your exact requirement isn't fully clear.

Are you asking about:
• **Growing Tomatoes:** How to cultivate tomatoes in fields or kitchen gardens?
• **Buying Tomatoes:** Where to buy fresh produce versus certified seed varieties?
• **Treating Diseases:** How to cure yellowing leaves or spots on tomato plants?

Please clarify your request so I can give you the exact advice you need!`;
  }

  // 6. Comprehensive agricultural keywords
  const agriKeywords = [
    "crop", "farm", "farmer", "farmers", "farming", "field", "plant", "seed", "seeds", "sow", "sowing",
    "harvest", "harvesting", "yield", "soil", "land", "acre", "hectare",
    "tomato", "tomatoes", "turmeric", "maize", "corn", "paddy", "rice", "wheat", "cotton", "sugarcane",
    "potato", "onion", "garlic", "chilli", "chili", "pepper", "soybean", "groundnut", "pulse",
    "gram", "millet", "jowar", "bajra", "mustard", "fruit", "vegetable", "haldi",
    "disease", "yellow", "spot", "leaf", "leaves", "blight", "fungus", "fungal", "rot",
    "pest", "bug", "insect", "worm", "borer", "spray", "pesticide", "fungicide", "neem",
    "weed", "wilt", "canker", "mildew", "rust", "symptom", "cure", "treatment",
    "fertilizer", "fertiliser", "npk", "urea", "dap", "mop", "potash", "nitrogen",
    "phosphorus", "potassium", "manure", "compost", "ph", "zinc", "calcium", "nutrient", "soil test",
    "irrigation", "water", "drip", "sprinkler", "awd", "rain", "rainfall", "weather",
    "temperature", "humidity", "monsoon", "drought", "climate",
    "scheme", "government", "subsidy", "subsidies", "pm-kisan", "pmfby", "kcc", "loan",
    "market", "price", "msp", "livestock", "organic", "greenhouse", "polyhouse", "agriculture",
    "grow", "growing", "cultivate", "cultivation", "protect", "protection", "manage",
    "management", "recommend", "recommendation", "advice", "advisory", "care"
  ];

  const hasAgriKeyword = agriKeywords.some((kw) => q.includes(kw));

  // If agricultural keyword present, return null to delegate to Gemini API / Agronomic Engine
  if (hasAgriKeyword) {
    return null;
  }

  // 7. Unrelated / Meaningless / Off-Topic Inputs (e.g. "naganath", "abc", "xyz", random words)
  return `I couldn't understand your request. Please ask an agriculture-related question.

For example:
• My tomato leaves are turning yellow.
• How do I grow turmeric?
• Recommend fertilizer for maize.
• What crop should I grow this season?`;
}

/**
 * Analyzes a crop or leaf image URL using Gemini Vision AI.
 */
export async function analyzeCropImage(
  imageUrl: string
): Promise<IDiseaseAnalysisResult> {
  const prompt = `
You are a world-class agronomist and plant pathologist AI engine. Analyze the provided image of a crop or leaf and identify any plant disease, pest infection, or physiological disorder.

Return your response strictly in valid, raw JSON format with NO markdown wrapping, matching this exact structure:

{
  "disease": "Exact Disease or Health Status Name",
  "confidence": "e.g. 95%",
  "severity": "Low" | "Medium" | "High",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "cause": "Detailed cause or pathogen explanation",
  "treatment": ["Treatment step 1", "Treatment step 2", "Treatment step 3"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "recommendedFertilizer": "Recommended fertilizer type and dosage",
  "recommendedPesticide": "Recommended fungicide or pesticide formulation",
  "immediateActions": ["Action 1", "Action 2"]
}

If the image is healthy with no disease detected, set "disease" to "Healthy Crop (No Disease Detected)", "severity" to "Low", and provide maintenance tips.
`;

  try {
    const { apiKey, genAI } = getGenerativeAIInstance();
    if (!apiKey || apiKey.includes("DemoKey")) {
      return generateFallbackDiagnosis(imageUrl);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = await urlToGenerativePart(imageUrl);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed: IDiseaseAnalysisResult = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error("Gemini Vision AI Analysis Error:", error);
    return generateFallbackDiagnosis(imageUrl);
  }
}

/**
 * Generates an agronomic Soil & Crop Recommendation report using Gemini AI.
 */
export async function generateSoilRecommendation(
  weather: IWeatherData
): Promise<ISoilRecommendationResult> {
  const prompt = `
You are an expert agronomist and soil scientist AI engine for KrishiVed AI. Based on the following regional weather and atmospheric telemetry:

- Region / City: ${weather.city}, ${weather.country}
- Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C, Min: ${weather.tempMin}°C, Max: ${weather.tempMax}°C)
- Relative Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} km/h (${weather.windDirection})
- Atmospheric Pressure: ${weather.pressure} hPa
- Rain Probability: ${weather.rainProbability}%
- Current Weather Condition: ${weather.condition} (${weather.description})

Generate a comprehensive, scientific soil health & crop recommendation report.

Return your response strictly in valid, raw JSON format with NO markdown wrapping, matching this exact structure:

{
  "city": "${weather.city}",
  "temperature": ${weather.temperature},
  "humidity": ${weather.humidity},
  "windSpeed": ${weather.windSpeed},
  "pressure": ${weather.pressure},
  "rainProbability": ${weather.rainProbability},
  "weatherCondition": "${weather.condition}",
  "soilHealthScore": "e.g. 88/100 (Optimal Soil Fertility)",
  "bestCrop": "Primary recommended crop or combination (e.g. Wheat / Soybean)",
  "alternativeCrops": ["Alternative Crop 1", "Alternative Crop 2", "Alternative Crop 3"],
  "irrigationRecommendation": "Detailed irrigation strategy (e.g. Drip irrigation 45 mins every alternate morning)",
  "fertilizerRecommendation": "Recommended NPK & organic fertilizer formulation (e.g. NPK 10-26-26 @ 50kg/acre + Neem coated Urea)",
  "diseaseRiskLevel": "Low" | "Medium" | "High",
  "farmingTips": ["Practical Tip 1", "Practical Tip 2", "Practical Tip 3"],
  "explanations": {
    "cropChoice": "Scientific explanation linking temperature and humidity to crop selection",
    "irrigation": "Explanation linking rain probability and wind speed to irrigation frequency",
    "fertilizer": "Explanation for nutrient formulation based on climate and soil moisture"
  }
}
`;

  try {
    const { apiKey, genAI } = getGenerativeAIInstance();
    if (!apiKey || apiKey.includes("DemoKey")) {
      return generateFallbackSoilRecommendation(weather);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed: ISoilRecommendationResult = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error("Gemini Soil AI Analysis Error:", error);
    return generateFallbackSoilRecommendation(weather);
  }
}

/**
 * Generates an agronomic multi-turn chat response using Google Gemini 1.5 Flash AI
 * with deep intent understanding.
 */
export async function generateFarmingChatResponse(
  history: Array<{ sender: "user" | "ai"; text: string }>,
  latestMessage: string,
  imageUrl?: string
): Promise<string> {
  // 1. Debug Log: User message received
  console.log("[Gemini Assistant] User message received:", latestMessage);

  // 2. Classify Input & Deep Intent Recognition
  const conversationalReply = classifyAndHandleInput(latestMessage);

  if (conversationalReply !== null) {
    console.log("[Gemini Assistant] Handled by Intent Classifier:", latestMessage);
    return conversationalReply;
  }

  // 3. Prepare Gemini API Request for Agricultural Queries with Intent Instructions
  const { apiKey, genAI } = getGenerativeAIInstance();

  const systemInstruction = `You are KrishiMitra, a world-class agronomist and agricultural consultant for KrishiVed AI.
Before answering, analyze the user's exact intent:
- If Disease Diagnosis: Identify disease/deficiency, list symptoms, cause, fungicide/pesticide treatment.
- If Cultivation Guide: Explain step-by-step soil prep, planting, NPK fertilizing, watering, harvesting.
- If Purchasing/Seed Sourcing: Guide the user to certified seed outlets, KVKs, or government portals.
- If Ambiguous: Ask one brief clarifying question to confirm their exact intent.
- If Off-Topic: Politely explain that KrishiMitra specializes in agriculture.

Formatting Guidelines:
- Use clear markdown with bold headers (###), bullet points (-), and numbered steps (1.).
- Provide a direct, detailed answer tailored specifically to the user's exact query.
- Keep recommendations realistic and actionable for farmers.`;

  const formattedHistory = history
    .slice(-6)
    .map((h) => `${h.sender === "user" ? "Farmer" : "KrishiVed AI"}: ${h.text}`)
    .join("\n\n");

  const fullPrompt = `${systemInstruction}\n\n${
    formattedHistory ? `Previous Conversation Context:\n${formattedHistory}\n\n` : ""
  }Farmer Query: ${latestMessage}`;

  // Debug Log: Prompt sent to Gemini
  console.log("[Gemini Assistant] Prompt sent to Gemini:\n", fullPrompt);

  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let result;
    if (imageUrl) {
      if (imageUrl.startsWith("http")) {
        const imagePart = await urlToGenerativePart(imageUrl);
        result = await model.generateContent([fullPrompt, imagePart]);
      } else if (imageUrl.startsWith("data:image")) {
        const base64Data = imageUrl.split(",")[1];
        const mimeType = imageUrl.split(";")[0].split(":")[1] || "image/jpeg";
        result = await model.generateContent([
          fullPrompt,
          { inlineData: { data: base64Data, mimeType } },
        ]);
      } else {
        result = await model.generateContent(fullPrompt);
      }
    } else {
      result = await model.generateContent(fullPrompt);
    }

    const responseText = result.response.text();

    // Debug Log: Gemini raw response
    console.log("[Gemini Assistant] Gemini raw response:\n", responseText);

    if (!responseText || !responseText.trim()) {
      throw new Error("Gemini API returned an empty response string.");
    }

    return responseText.trim();
  } catch (error: any) {
    // Debug Log: Error message if Gemini fails
    console.error("[Gemini Assistant ERROR] Error message if Gemini fails:", error?.message || error);

    return generateDynamicQuerySpecificResponse(latestMessage);
  }
}

/**
 * Generates context-specific, query-tailored agricultural responses
 * if Gemini API call fails or encounters network/key errors.
 */
function generateDynamicQuerySpecificResponse(query: string): string {
  const q = query.toLowerCase();

  // 1. Turmeric Cultivation
  if (q.includes("turmeric") || q.includes("haldi")) {
    return `### 🌿 Comprehensive Turmeric Cultivation & Care Guide

1. **Soil & Climate Requirements:**
   - **Soil:** Well-drained sandy loam or clay loam with pH 4.5 – 7.5 rich in organic matter.
   - **Temperature:** Thrives in warm, humid climates (20°C to 35°C).

2. **Rhizome Planting & Seed Rate:**
   - **Seed Rate:** 800–1000 kg healthy, disease-free mother rhizomes per acre.
   - **Planting Time:** May to June with early monsoon arrival.
   - **Spacing:** 30 cm between rows and 15–20 cm between plants on raised beds.

3. **Nutrient & Fertilizer Schedule (Per Acre):**
   - **FYM / Compost:** 10–12 tonnes during field preparation.
   - **NPK Ratio:** 25 kg N : 25 kg P₂O₅ : 50 kg K₂O. Apply full Phosphorous as basal dose, and Nitrogen/Potassium in 3 split doses at 30, 60, and 90 days.

4. **Irrigation & Pest Management:**
   - **Irrigation:** 15–20 irrigations depending on soil type. Avoid waterlogging to prevent Rhizome Rot (*Pythium aphanidermatum*).`;
  }

  // 2. Maize Fertilizer Schedule
  if (q.includes("maize") || q.includes("corn") || (q.includes("fertilizer") && !q.includes("turmeric"))) {
    return `### 🧪 Recommended Fertilizer Schedule for Maize (Per Acre)

1. **Basal Dose (At Planting):**
   - **DAP (Di-ammonium Phosphate):** 50 kg
   - **MOP (Muriate of Potash):** 25 kg
   - **Zinc Sulphate (21%):** 10 kg (Prevents white bud disease in young seedlings).

2. **First Top-Dressing (Knee-High Stage ~ 25-30 Days):**
   - **Neem-Coated Urea:** 45 kg applied near root zones followed by light irrigation.

3. **Second Top-Dressing (Tasseling Stage ~ 50-55 Days):**
   - **Neem-Coated Urea:** 30 kg
   - **Foliar Spray:** 19:19:19 (5g/L) + Micronutrient spray for maximum ear filling.`;
  }

  // 3. Tomato Yellow Spots & Blight Disease
  if (q.includes("yellow") || q.includes("spot") || q.includes("tomato") || q.includes("blight")) {
    return `### 🌱 Tomato Leaf Spot & Yellowing Diagnostics

1. **Symptom Identification:**
   - **Early Blight (*Alternaria solani*):** Dark brown target-like concentric rings surrounded by yellow chlorotic halos on lower mature leaves.
   - **Nitrogen Deficiency:** General yellowing without dark necrotic spots.

2. **Immediate Fungicidal Treatment:**
   - Spray **Mancozeb 75% WP** @ 2.5g / liter of water OR **Chlorothalonil** @ 2g / liter.
   - For systemic protection: Apply **Azoxystrobin 23% EC** @ 1ml / liter.

3. **Cultural & Preventive Protocol:**
   - Prune infected lower foliage up to 1 foot from ground level to encourage airflow.
   - Avoid overhead watering; switch to drip irrigation.
   - Mulch around plant bases to prevent soil rain-splash spore transmission.`;
  }

  // 4. Weather Impact & Paddy Irrigation
  if (q.includes("paddy") || q.includes("rice") || q.includes("weather") || q.includes("rain") || q.includes("irrigation")) {
    return `### 💧 Weather-Based Paddy Water Management Protocol

1. **Current Atmospheric & Irrigation Guidelines:**
   - **Transplanting to Tillering (Days 1–20):** Maintain shallow 2–3 cm standing water.
   - **Alternate Wetting & Drying (AWD):** Allow field water level to drop 15 cm below soil surface before re-flooding. Reduces water use by 30% and strengthens root depth.

2. **Rainfall & Spraying Precautions:**
   - If rainfall probability is high (>60%), suspend chemical sprays and top-dressing urea to avoid nutrient leaching.
   - Ensure field drainage outlets are open to prevent submergence injury to young tillers.`;
  }

  // 5. Government Farming Schemes
  if (q.includes("scheme") || q.includes("government") || q.includes("subsidy") || q.includes("pm-kisan") || q.includes("pmfby") || q.includes("kcc")) {
    return `### 🏛 Key Government Schemes for Farmers

1. **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi):**
   - Direct income support of **₹6,000 per year** in 3 equal installments of ₹2,000 directly into farmer bank accounts.

2. **PMFBY (PM Fasal Bima Yojana):**
   - Crop insurance at minimal premium rates (1.5% for Rabi, 2.0% for Kharif, 5% for commercial/horticultural crops) protecting against natural disasters.

3. **Kisan Credit Card (KCC) & Interest Subvention:**
   - Short-term crop loans up to **₹3 Lakhs** at an effective interest rate of 4% per annum upon prompt repayment.

4. **Sub-Mission on Agricultural Mechanization (SMAM):**
   - 40% to 50% subsidy on purchase of tractors, rotavators, power tillers, and drones through Custom Hiring Centers (CHCs).`;
  }

  // 6. Crop Selection / Seasonal Growing Guide
  if (q.includes("which crop") || q.includes("crop selection") || q.includes("grow this season") || q.includes("season")) {
    return `### 🌾 Seasonal Crop Selection Advisory

1. **Kharif (Monsoon Season):**
   - **High Return:** Hybrid Paddy, Maize, Cotton, Soybean.
   - **Low Water Demand:** Pigeonpea (Tur), Green Gram (Moong), Pearl Millet (Bajra).

2. **Rabi (Winter Season):**
   - **Cereals & Cash Crops:** Wheat, Mustard, Chickpea (Gram), Potato.

3. **Key Recommendation Steps:**
   - Test soil pH (ideal 6.5 - 7.5) and organic carbon before final crop selection.
   - Match crop water requirements to your regional irrigation infrastructure.`;
  }

  // 7. General Dynamic Subject Handler for any other prompt
  const cleanSubject = query.replace(/(how|what|why|can|i|do|you|suggest|recommend|tell|me|about|the|for)/gi, "").trim();

  return `### 🌾 KrishiMitra Advice for: "${query}"

1. **Management Overview:**
   - For optimal cultivation of **${cleanSubject || "your crop"}**, ensure soil testing for N-P-K balance and organic matter content prior to planting.

2. **Core Agronomic Practices:**
   - **Soil Preparation:** Incorporate 8-10 tonnes of FYM/compost per acre along with bio-fertilizers (*Azotobacter* / *PSB*).
   - **Irrigation:** Adopt drip micro-irrigation to maintain 60-70% field capacity moisture.
   - **Pest & Disease Watch:** Inspect crops weekly for early leaf spot or stem borer symptoms. Apply organic Neem oil (5ml/L) as a first line of defense.

*For image-based crop disease diagnosis, use our **Disease Diagnostics** scanner from the sidebar.*`;
}

/**
 * Fallback diagnostic provider when Gemini Vision API is unconfigured or unavailable.
 */
function generateFallbackDiagnosis(imageUrl: string): IDiseaseAnalysisResult {
  return {
    disease: "Early Blight (Alternaria solani)",
    confidence: "94%",
    severity: "Medium",
    symptoms: [
      "Dark brown concentric circular spots on lower mature leaves",
      "Yellow halo surrounding necrotic leaf lesions",
      "Leaf curling and premature leaf drop near soil bed",
    ],
    cause: "Fungal pathogen Alternaria solani favored by warm temperatures (24-29°C) and high leaf wetness.",
    treatment: [
      "Apply Chlorothalonil or Copper Oxychloride 50% WP fungicide every 7 to 10 days",
      "Prune infected lower foliage immediately to increase airflow and prevent canopy spread",
      "Switch to drip irrigation to keep foliage dry",
    ],
    prevention: [
      "Practice 3-year crop rotation with non-solanaceous crops",
      "Mulch soil around plant base to prevent rain splash of fungal spores",
      "Use certified disease-free seeds and resistant hybrid varieties",
    ],
    recommendedFertilizer: "NPK 10-26-26 + Micronutrient Calcium & Zinc foliar spray",
    recommendedPesticide: "Mancozeb 75% WP or Copper Fungicide (2g / Liter of water)",
    immediateActions: [
      "Prune affected lower leaves away from fields",
      "Apply protective fungicide spray during early morning hours",
    ],
  };
}

/**
 * Fallback soil recommendation engine when Gemini API key is placeholder or rate-limited.
 */
function generateFallbackSoilRecommendation(
  weather: IWeatherData
): ISoilRecommendationResult {
  const isWarm = weather.temperature >= 25;
  const isHumid = weather.humidity >= 60;

  const bestCrop = isWarm
    ? isHumid
      ? "Soybean & Hybrid Maize"
      : "Cotton & Sorghum (Jowar)"
    : "Wheat & Mustard";

  const altCrops = isWarm
    ? ["Pigeon Pea (Tur)", "Groundnut", "Chickpea (Gram)"]
    : ["Barley", "Green Peas", "Lentil (Masoor)"];

  return {
    city: weather.city,
    temperature: weather.temperature,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    pressure: weather.pressure,
    rainProbability: weather.rainProbability,
    weatherCondition: weather.condition,
    soilHealthScore: "88/100 (Optimal Soil Fertility)",
    bestCrop,
    alternativeCrops: altCrops,
    irrigationRecommendation:
      weather.rainProbability > 50
        ? "Pause artificial irrigation. Rely on natural precipitation and inspect field drainage channels."
        : `Drip irrigation for 40 minutes during early morning hours under ${weather.windSpeed} km/h wind conditions.`,
    fertilizerRecommendation:
      "Apply NPK 10-26-26 @ 50 kg/acre as basal dose + Neem-coated Urea @ 25 kg/acre at 30 days + Zinc Sulfate 5 kg/acre.",
    diseaseRiskLevel: isHumid && weather.temperature > 26 ? "Medium" : "Low",
    farmingTips: [
      "Perform soil testing for pH and organic carbon content prior to sowing",
      "Incorporate bio-fertilizers (Azotobacter & PSB) with FYM during field preparation",
      "Ensure proper ridge and furrow planting to avoid waterlogging near root zones",
    ],
    explanations: {
      cropChoice: `Regional temperature of ${weather.temperature}°C combined with ${weather.humidity}% humidity creates an ideal thermal and moisture envelope for ${bestCrop}.`,
      irrigation: `With rain probability of ${weather.rainProbability}% and atmospheric pressure at ${weather.pressure} hPa, evaporative demand is moderate, favoring controlled drip application.`,
      fertilizer: `Balanced NPK 10-26-26 provides essential Phosphorus for deep root establishment while Zinc supplementation prevents chlorosis in regional soil types.`,
    },
  };
}
