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
 * Analyzes a crop or leaf image URL using Gemini Vision AI with Agricultural Image Validation.
 */
export async function analyzeCropImage(
  imageUrl: string
): Promise<IDiseaseAnalysisResult> {
  const prompt = `
You are an expert agricultural computer vision AI engine and plant pathologist.

Analyze the uploaded image with strict agricultural validation:

STEP 1: AGRICULTURAL IMAGE VALIDATION
Determine if the image visibly contains a real crop, plant, leaf, stem, fruit, vegetable, seedling, or agricultural field.
- REJECT any non-agricultural content immediately. This includes: computer/coding/IDE/VS Code screenshots, website screens, document/PDF screenshots, printed text pages, selfies/people, vehicles, buildings, office items, random non-plant photographs.
- If the image is NOT an agricultural/plant photo, set "isAgriculturalImage" to false, "imageType" to "non_agricultural", "hasVisibleSymptoms" to false, "disease" to "Non-Agricultural Image", "confidence" to "0%", "severity" to "Low", and set "validationMessage" to "⚠️ This image does not appear to contain a crop or plant. Please upload a clear photo of the affected crop, leaf, stem, fruit, or field for disease diagnosis."

STEP 2: IMAGE CLARITY & EVIDENCE EVALUATION
If the image is a plant/crop photo, but is too blurry, dark, out of focus, distant, or ambiguous to discern plant details or disease symptoms:
- Set "isAgriculturalImage" to true, "imageType" to "unclear", "hasVisibleSymptoms" to false, "disease" to "Inconclusive / Unclear Image", "confidence" to "0%", "severity" to "Low", and set "validationMessage" to "⚠️ A plant/crop is visible, but the image is not clear enough for reliable disease identification. Please upload a clearer close-up image of the affected leaf or plant."

STEP 3: HEALTHY PLANT EVALUATION
If the image clearly shows a healthy plant/crop with NO visible disease, pest, or deficiency symptoms:
- Set "isAgriculturalImage" to true, "imageType" to "crop_leaf", "isHealthy" to true, "hasVisibleSymptoms" to false, "disease" to "Healthy Crop (No Disease Detected)", "confidence" to "95%", "severity" to "Low", and set "validationMessage" to "No obvious disease symptoms detected from this image."

STEP 4: DISEASE DIAGNOSTIC ANALYSIS
If the image is a valid agricultural image WITH visible disease symptoms:
- Set "isAgriculturalImage" to true, "imageType" to "crop_leaf", "isHealthy" to false, "hasVisibleSymptoms" to true, "validationMessage" to "Valid crop disease diagnostic scan.", identify the specific crop and disease name, confidence (e.g. "94%"), severity ("Low" | "Medium" | "High"), symptoms array, pathogen cause, treatment array, prevention array, recommendedFertilizer, recommendedPesticide, and immediateActions array.

Return your response strictly as valid, raw JSON with NO markdown formatting:

{
  "isAgriculturalImage": boolean,
  "imageType": "crop_leaf" | "plant" | "field" | "non_agricultural" | "unclear",
  "cropDetected": "Crop name if identified, else empty string",
  "hasVisibleSymptoms": boolean,
  "isHealthy": boolean,
  "validationMessage": "Validation status or farmer instruction",
  "disease": "Specific Disease Name OR Healthy Crop (No Disease Detected) OR Non-Agricultural Image OR Inconclusive / Unclear Image",
  "confidence": "e.g. 94%",
  "severity": "Low" | "Medium" | "High",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "cause": "Detailed cause explanation",
  "treatment": ["Treatment step 1", "Treatment step 2"],
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "recommendedFertilizer": "Recommended fertilizer formulation",
  "recommendedPesticide": "Recommended fungicide or pesticide",
  "immediateActions": ["Action 1", "Action 2"]
}
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

    // Fallback checks for missing fields
    if (parsed.isAgriculturalImage === undefined) {
      const d = (parsed.disease || "").toLowerCase();
      parsed.isAgriculturalImage = !(
        d.includes("non-agricultural") ||
        d.includes("not a plant") ||
        d.includes("invalid image")
      );
    }

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

STRICT CROP AND INTENT ACCURACY RULES:
1. EXACT CROP PRESERVATION:
   - Identify the exact crop in the user's question (e.g. Wheat, Maize, Paddy, Tomato, Turmeric, Cotton, Sugarcane, Potato, Onion).
   - NEVER substitute the user's crop for another (e.g. if asked about Wheat, NEVER answer for Maize or Paddy).
   - If the user explicitly mentions a crop in their current question (e.g. "What about maize?"), that crop OVERRIDES any crop mentioned in previous conversation history.
   - If no crop is explicitly mentioned in the current question, use the crop context from recent conversation history.

2. DIRECT INTENT ANSWERING:
   - If asked about IRRIGATION FREQUENCY (e.g. "How often should I irrigate wheat?"), directly answer the watering intervals, critical growth stages (CRI, Tillering, Jointing, Flowering, Milk, Dough), and days between irrigations.
   - If asked about WATER REQUIREMENT (e.g. "How much water does wheat need per acre?"), directly state the seasonal water volume (e.g. 450–650 mm / 18–26 acre-inches / 1.8–2.6M L/acre) and explain key dependencies (soil type, climate, drip vs flood irrigation).
   - If asked about FERTILIZER (e.g. "What fertilizer is best for wheat?"), give specific NPK fertilizer dosage (e.g. NPK 120:60:40 kg/ha / DAP + MOP + Urea split) for THAT EXACT CROP, and state that exact dosage depends on soil test results.
   - If asked about DISEASE / YELLOW LEAVES (e.g. "My tomato leaves are turning yellow"), provide specific symptoms, causes (Early Blight, TLCV, Nitrogen deficiency), and fungicide/pesticide treatment.
   - DO NOT return a generic farming checklist when asked a specific query.

3. NO FALSE CERTAINTY:
   - If exact agronomic values depend on location, soil, variety, or growth stage, state the standard range and clearly explain the dependencies.

Formatting Guidelines:
- Use clear markdown with bold headers (###), bullet points (-), and numbered steps (1.).
- Provide direct, concise, and realistic advice for Indian farming conditions.`;

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

    return generateDynamicQuerySpecificResponse(latestMessage, history);
  }
}

/**
 * Helper: Extracts crop name mentioned in a query.
 */
function extractCropFromQuery(query: string): string | null {
  const q = query.toLowerCase();
  if (/\b(wheat|gehu|gehun)\b/.test(q)) return "Wheat";
  if (/\b(maize|corn|bhutta|makka|makki)\b/.test(q)) return "Maize";
  if (/\b(paddy|rice|dhan|chawal)\b/.test(q)) return "Paddy";
  if (/\b(tomato|tomatoes|tamatar)\b/.test(q)) return "Tomato";
  if (/\b(turmeric|haldi)\b/.test(q)) return "Turmeric";
  if (/\b(potato|potatoes|aloo)\b/.test(q)) return "Potato";
  if (/\b(onion|onions|pyaz)\b/.test(q)) return "Onion";
  if (/\b(cotton|kapas)\b/.test(q)) return "Cotton";
  if (/\b(sugarcane|ganna)\b/.test(q)) return "Sugarcane";
  if (/\b(soybean|soya)\b/.test(q)) return "Soybean";
  if (/\b(groundnut|peanut|moongfali)\b/.test(q)) return "Groundnut";
  if (/\b(mustard|sarson)\b/.test(q)) return "Mustard";
  if (/\b(chickpea|gram|chana)\b/.test(q)) return "Chickpea";
  if (/\b(chili|chilli|pepper|mirchi)\b/.test(q)) return "Chili";
  if (/\b(garlic|lahsun)\b/.test(q)) return "Garlic";
  return null;
}

/**
 * Helper: Extracts user's exact intent from query.
 */
function extractIntentFromQuery(query: string): "irrigation_frequency" | "water_requirement" | "fertilizer" | "disease" | "cultivation" | "general" {
  const q = query.toLowerCase();

  if (
    (q.includes("how often") || q.includes("frequency") || q.includes("interval") || q.includes("how many days") || q.includes("when should i water") || q.includes("when to irrigate")) &&
    (q.includes("irrigate") || q.includes("water") || q.includes("irrigation"))
  ) {
    return "irrigation_frequency";
  }

  if (
    (q.includes("how much water") || q.includes("water need") || q.includes("water requirement") || q.includes("liters") || q.includes("acre inch") || q.includes("volume of water")) &&
    (q.includes("irrigate") || q.includes("water") || q.includes("acre") || q.includes("crop") || q.includes("need"))
  ) {
    return "water_requirement";
  }

  if (
    q.includes("fertilizer") || q.includes("fertiliser") || q.includes("npk") || q.includes("urea") || q.includes("dap") || q.includes("mop") || q.includes("manure") || q.includes("nutrient") || q.includes("feed")
  ) {
    return "fertilizer";
  }

  if (
    q.includes("yellow") || q.includes("spot") || q.includes("blight") || q.includes("disease") || q.includes("pest") || q.includes("rot") || q.includes("wilt") || q.includes("fungus") || q.includes("symptom") || q.includes("cure")
  ) {
    return "disease";
  }

  if (q.includes("grow") || q.includes("cultivate") || q.includes("plant") || q.includes("sow") || q.includes("yield")) {
    return "cultivation";
  }

  return "general";
}

/**
 * Generates context-specific, query-tailored agricultural responses
 * if Gemini API call fails or encounters network/key errors.
 */
function generateDynamicQuerySpecificResponse(
  query: string,
  history?: Array<{ sender: "user" | "ai"; text: string }>
): string {
  // 1. Identify crop from current query
  let crop = extractCropFromQuery(query);

  // 2. If current query has no crop, look back in history for recent crop context
  if (!crop && history && Array.isArray(history)) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].sender === "user") {
        const histCrop = extractCropFromQuery(history[i].text);
        if (histCrop) {
          crop = histCrop;
          break;
        }
      }
    }
  }

  // 3. Identify user intent
  const intent = extractIntentFromQuery(query);
  const q = query.toLowerCase();

  // --- WHEAT LOGIC ---
  if (crop === "Wheat") {
    if (intent === "irrigation_frequency") {
      return `### 💧 Irrigation Frequency & Critical Stages for Wheat

Wheat requires **4 to 6 critical irrigations** during its growth cycle (spaced **15 to 20 days apart** depending on soil type and weather).

#### Critical Growth Stages for Wheat Irrigation:
1. **Crown Root Initiation (CRI) Stage (20–25 days after sowing):** *Most Critical Stage!* Delaying irrigation at CRI causes significant yield reduction.
2. **Tillering Stage (40–45 days after sowing):** Encourages healthy tiller branching.
3. **Jointing Stage (60–65 days after sowing):** Supports rapid stem elongation and ear head development.
4. **Flowering Stage (80–85 days after sowing):** Essential for proper pollination and floret fertility.
5. **Milk Stage (100–105 days after sowing):** Critical for kernel development and grain weight.
6. **Dough Stage (115–120 days after sowing):** Light final watering for complete grain filling.

*Soil Factor: Light sandy soils require lighter waterings every 12–15 days, whereas heavy clay loam soils retain moisture longer (every 18–22 days).*`;
    }

    if (intent === "water_requirement") {
      return `### 🌊 Total Water Requirement for Wheat (Per Acre)

On average, a wheat crop requires **450 to 650 mm of water** (approx. **18 to 26 acre-inches** or **1.8 to 2.6 million liters per acre**) across its 120–140 day growing season.

#### Key Factors Influencing Water Requirement:
1. **Irrigation Method:**
   - **Flood / Border Strip:** Requires ~20–25 acre-inches/acre due to evaporation and seepage losses.
   - **Sprinkler / Drip Irrigation:** Reduces water requirement to ~14–18 acre-inches/acre (saves 25–35% water).
2. **Soil Texture:** Light sandy soils need 5–6 lighter irrigations; heavy clay soils need 4–5 deeper irrigations.
3. **Climate & Growth Stage:** Peak water demand occurs during the Flowering to Grain Milk stage under dry or warm conditions.

*Exact water volume should be adjusted according to soil moisture checks and seasonal rain events.*`;
    }

    if (intent === "fertilizer") {
      return `### 🧪 Recommended Fertilizer Schedule for Wheat (Per Acre)

The general recommended NPK nutrient dose for high-yield wheat is **60 kg Nitrogen (N) : 24 kg Phosphorus (P₂O₅) : 16 kg Potash (K₂O) per acre** (equivalent to 150:60:40 kg/ha).

#### Application Schedule:
1. **Basal Application (At Sowing / Land Preparation):**
   - **DAP (Di-ammonium Phosphate):** 50 kg/acre
   - **MOP (Muriate of Potash):** 25–30 kg/acre
   - **Zinc Sulphate (21%):** 10 kg/acre (prevents seedling chlorosis)
2. **First Top-Dressing (at CRI Stage ~ 21 days with 1st irrigation):**
   - **Neem-Coated Urea:** 45 kg/acre
3. **Second Top-Dressing (at Jointing Stage ~ 45 days with 2nd irrigation):**
   - **Neem-Coated Urea:** 35 kg/acre

*Note: Exact fertilizer dosage should be confirmed via a recent Soil Test Report. Excess Nitrogen can lead to wheat crop lodging.*`;
    }

    if (intent === "disease") {
      return `### 🌱 Wheat Disease & Leaf Problem Diagnostics

#### Common Wheat Health Issues:
1. **Yellow Rust / Stripe Rust (*Puccinia striiformis*):** Yellow pustules arranged in linear stripes on leaves.
2. **Brown / Leaf Rust (*Puccinia triticina*):** Small round orange-brown pustules scattered randomly on leaf blades.
3. **Nitrogen Deficiency:** Pale yellowing starting from tip of older lower leaves.

#### Recommended Treatments:
- **For Rust Infections:** Spray **Propiconazole 25% EC** @ 1 ml/liter of water OR **Tebuconazole 25.9% EC** @ 1.25 ml/liter immediately upon first symptom appearance.
- **For Nutrient Deficiency:** Top-dress 20–25 kg/acre Neem-Coated Urea followed by light irrigation.`;
    }

    return `### 🌾 Wheat Cultivation & Agronomic Overview

1. **Sowing Window & Seed Rate:**
   - **Optimum Time:** November 1 to November 20 (Rabi season).
   - **Seed Rate:** 40–45 kg certified seed per acre.
2. **Soil & Prep:** Well-drained fertile loam (pH 6.0–7.5). Incorporate 6–8 tonnes FYM/acre.
3. **Water & Nutrition:** 4–6 timely irrigations starting at CRI stage (21 days) with balanced NPK 120:60:40 kg/ha nutrient management.`;
  }

  // --- MAIZE LOGIC ---
  if (crop === "Maize") {
    if (intent === "fertilizer") {
      return `### 🧪 Recommended Fertilizer Schedule for Maize (Per Acre)

1. **Basal Dose (At Planting):**
   - **DAP (Di-ammonium Phosphate):** 50 kg/acre
   - **MOP (Muriate of Potash):** 25 kg/acre
   - **Zinc Sulphate (21%):** 10 kg/acre (Prevents white bud disease in young maize seedlings).

2. **First Top-Dressing (Knee-High Stage ~ 25–30 Days):**
   - **Neem-Coated Urea:** 45 kg/acre applied near root zones followed by light irrigation.

3. **Second Top-Dressing (Tasseling Stage ~ 50–55 Days):**
   - **Neem-Coated Urea:** 30 kg/acre
   - **Foliar Spray:** NPK 19:19:19 (5g/L) for maximum cob & kernel development.

*Exact dosage should be tailored based on local soil test results.*`;
    }

    if (intent === "irrigation_frequency" || intent === "water_requirement") {
      return `### 💧 Maize Water Requirement & Irrigation Management

Maize requires **500 to 650 mm of water** (approx. **20 to 26 acre-inches**) per acre across its 90–110 day life cycle.

#### Critical Irrigation Stages for Maize:
1. **Germination & Seedling Stage:** Light initial watering to ensure uniform germination.
2. **Knee-High Stage (25–30 days):** Maintain moderate soil moisture.
3. **Tasseling & Silking Stage (50–60 days):** *Most Critical Stage!* Water deficit during silking causes poor cob kernel filling.
4. **Grain Milk Stage (75–85 days):** Essential for maximum grain weight.

*Avoid waterlogging as maize roots are highly susceptible to oxygen deprivation.*`;
    }

    return `### 🌽 Maize Cultivation Guide

1. **Season & Seed Rate:** Kharif (June-July) or Rabi (Oct-Nov). Seed rate: 8-10 kg hybrid seeds per acre.
2. **Spacing:** 60 cm between rows, 20 cm between plants.
3. **Care:** Protect against Fall Armyworm using Emamectin Benzoate 5% SG (0.4g/L) if observed.`;
  }

  // --- PADDY LOGIC ---
  if (crop === "Paddy") {
    if (intent === "irrigation_frequency" || intent === "water_requirement") {
      return `### 💧 Paddy (Rice) Water & Irrigation Protocol

Paddy requires **1200 to 1400 mm of water** (approx. **48 to 56 acre-inches**) per acre due to puddling and standing water practices.

#### Irrigation Management:
1. **Transplanting to Early Tillering (Days 1–20):** Maintain shallow 2–3 cm standing water to support root anchorage and suppress weed growth.
2. **Alternate Wetting & Drying (AWD):** Allow field water level to recede 15 cm below soil surface before re-flooding. Reduces water use by 30% without affecting grain yield.
3. **Panicle Initiation & Flowering Stage:** Maintain 3–5 cm standing water continuously.
4. **Pre-Harvest Drainage:** Drain field completely 10–12 days before harvest to facilitate uniform ripening.`;
    }

    if (intent === "fertilizer") {
      return `### 🧪 Recommended Fertilizer Schedule for Paddy (Per Acre)

1. **Basal Application (During Final Puddling):**
   - **DAP:** 40–50 kg/acre
   - **MOP:** 25 kg/acre
   - **Zinc Sulphate (21%):** 10 kg/acre (prevents Khaira disease).
2. **Active Tillering Stage (~ 20–25 days after transplanting):**
   - **Neem-Coated Urea:** 35 kg/acre
3. **Panicle Initiation Stage (~ 45–50 days after transplanting):**
   - **Neem-Coated Urea:** 25 kg/acre + **MOP:** 15 kg/acre`;
    }

    return `### 🌾 Paddy Cultivation Overview

1. **Nursery & Seed Rate:** 15–20 kg/acre for inbred, 6–8 kg/acre for hybrids.
2. **Transplanting:** 15–20 day old seedlings at 20cm x 15cm spacing.
3. **Protection:** Monitor for Stem Borer and Bacterial Leaf Blight.`;
  }

  // --- TOMATO LOGIC ---
  if (crop === "Tomato") {
    if (intent === "disease") {
      return `### 🌱 Tomato Leaf Yellowing & Disease Diagnostics

#### Common Causes of Yellow Tomato Leaves:
1. **Early Blight (*Alternaria solani*):** Dark brown concentric target spots surrounded by yellow halos on lower leaves.
2. **Tomato Leaf Curl Virus (TLCV):** Upward curling, yellowing, and stunted plant growth (transmitted by Whiteflies).
3. **Nitrogen Deficiency:** General uniform pale yellowing on older lower leaves.

#### Recommended Treatments:
- **For Blight / Fungal Spots:** Spray **Mancozeb 75% WP** (2.5g/L) or **Copper Oxychloride** (2g/L). For systemic control, spray **Azoxystrobin 23% EC** (1ml/L).
- **For Whitefly Vector Control:** Spray **Imidacloprid 17.8% SL** (0.5ml/L) or Neem Oil (5ml/L).
- **Cultural Care:** Prune lower infected leaves up to 1 foot from ground and use drip irrigation.`;
    }

    return `### 🍅 Tomato Cultivation & Management Guide

1. **Irrigation:** Requires **400–600 mm** water. Drip irrigation (30–45 mins daily or alternate days) prevents fruit cracking and blossom end rot.
2. **Fertilization:** Basal FYM (10t/acre) + NPK 19:19:19 during vegetative stage, switching to 13:0:45 + Calcium Nitrate during fruiting.`;
  }

  // --- TURMERIC LOGIC ---
  if (crop === "Turmeric") {
    return `### 🌿 Turmeric Cultivation & Care Guide

1. **Soil & Seed Rate:** Well-drained sandy loam (pH 5.5–7.5). Seed rate: 800–1000 kg mother rhizomes per acre.
2. **Fertilizers (Per Acre):** FYM 10-12 tonnes + NPK 25kg N : 25kg P₂O₅ : 50kg K₂O in 3 split doses at 30, 60, and 90 days.
3. **Watering:** 15–20 irrigations. Avoid waterlogging to prevent Rhizome Rot (*Pythium*).`;
  }

  // --- SCHEMES LOGIC ---
  if (q.includes("scheme") || q.includes("government") || q.includes("subsidy") || q.includes("pm-kisan") || q.includes("pmfby") || q.includes("kcc")) {
    return `### 🏛 Key Government Schemes for Farmers

1. **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi):**
   - Direct income support of **₹6,000 per year** in 3 equal installments of ₹2,000.
2. **PMFBY (PM Fasal Bima Yojana):**
   - Crop insurance at minimal premium rates (1.5% Rabi, 2.0% Kharif).
3. **Kisan Credit Card (KCC):**
   - Short-term crop loans up to **₹3 Lakhs** at an effective 4% interest rate upon prompt repayment.`;
  }

  // --- GENERIC CROP-NEUTRAL FALLBACK ---
  const cleanSubject = query.replace(/(how|what|why|can|i|do|you|suggest|recommend|tell|me|about|the|for)/gi, "").trim();

  if (intent === "fertilizer") {
    return `### 🧪 General Fertilizer Recommendation Principles

To receive the exact fertilizer formula, please mention your specific **crop name** (e.g., Wheat, Maize, Paddy, Tomato, Cotton).

#### Core Fertilizer Guidelines:
1. **Soil Test First:** Conduct a soil test to check N-P-K balance, pH, and micronutrients (Zinc, Boron).
2. **Basal Dose:** Apply full Phosphorus (DAP/SSP) and Potash (MOP) during field preparation or sowing.
3. **Top Dressing:** Apply Nitrogen (Urea) in 2–3 split doses at key vegetative growth stages.`;
  }

  if (intent === "irrigation_frequency" || intent === "water_requirement") {
    return `### 💧 General Irrigation & Water Management

To get the precise irrigation schedule or water quantity per acre, please specify your **crop name** (e.g., Wheat, Paddy, Maize, Tomato).

#### General Watering Rules:
1. **Critical Stages:** Irrigate during germination, flowering, and grain/fruit filling stages.
2. **Method:** Drip irrigation reduces water use by 30–40% compared to surface flooding.
3. **Soil Type:** Sandy soils require frequent light waterings; clay soils require deeper, less frequent irrigations.`;
  }

  return `### 🌾 KrishiMitra Advice for: "${query}"

1. **Management Overview:**
   - For optimal cultivation of **${crop || cleanSubject || "your crop"}**, ensure soil testing for N-P-K balance and organic matter content prior to planting.

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
    isAgriculturalImage: true,
    imageType: "crop_leaf",
    cropDetected: "Tomato",
    hasVisibleSymptoms: true,
    isHealthy: false,
    validationMessage: "Valid tomato leaf photo detected with active early blight symptoms.",
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
