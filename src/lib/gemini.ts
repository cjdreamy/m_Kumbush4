import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(prompt: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    return "api not found , Please configure your VITE_GEMINI_API_KEY in the .env file.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview", // Use the latest high-speed model
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return `AI Error: ${error.message || "Unknown error"}.`;
  }
}

export async function generateCareInsights(context: string) {
  const prompt = `As a senior healthcare data analyst for "M-Kumbusha", analyze the following 7-day adherence data and dashboard stats. 
  
Identify patterns, risks, and provide 3-4 actionable insights for the caregiver. 
Use Markdown for presentation:
- Use **bold** for emphasis
- Use bullet points for insights
- Use a "### Recommendations" header
- ALWAYS include a horizontal rule and a medical disclaimer at the bottom.

Data:
${context}`;

  return generateAIResponse(prompt);
}

export async function generateVoiceScript(elderlyName: string, medicationName: string, instructions: string, tone: string = "warm and comforting") {
  const prompt = `Generate a short, ${tone} voice reminder script for ${elderlyName} to take their ${medicationName}. 
  Instructions: ${instructions}. 
  The script should be clear, easy to understand for an elderly person, and friendly. 
  Keep it under 40 words. 
  Return ONLY the script text.`;

  return generateAIResponse(prompt);
}

export async function getAiAssistantAdvice(question: string, profileInfo: string) {
  const prompt = `You are the M-Kumbusha AI Care Assistant. Answer the following caregiver question accurately and empathetically.
  
Caregiver Context: ${profileInfo}
Question: ${question}

Use Markdown formatting:
- Use headers for structure
- Use bold text for key terms
- Add a "Safety Tip" section if applicable
- ALWAYS add a medical disclaimer.`;

  return generateAIResponse(prompt);
}
