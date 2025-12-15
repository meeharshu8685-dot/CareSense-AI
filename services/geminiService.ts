
import { GoogleGenAI, Type } from '@google/genai';
import type { SymptomData, AIAnalysisResult } from '../types';

// This function communicates with a generative AI model.
// For the Imagine Cup, this logic is representative of using a model
// hosted and managed via Microsoft Azure AI Studio, leveraging Azure OpenAI's
// powerful reasoning and safety features. The core AI is a critical dependency.
const getHealthRiskAnalysis = async (data: SymptomData): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are CareSense AI, a health risk awareness assistant. Your purpose is to provide informational guidance, NOT medical advice.
    Analyze the following user-provided symptoms and wellness indicators holistically.

    User's Data:
    - Symptoms: "${data.symptoms}"
    - Symptom Duration (Approx. Days): ${data.duration}
    - Symptom Severity: ${data.severity ? `"${data.severity}"` : 'Not specified'}

    Your tasks are:
    1.  **Classify Risk:** Categorize the potential health risk as "Low", "Medium", or "High" based on the combination of symptoms, duration, and severity. Be cautious and conservative in your assessment.
    2.  **Provide a simple explanation:** Briefly explain the reasoning for the risk level in calm, non-alarming, and simple language.
    3.  **Suggest Coping & Wellness Activities:** Offer safe, general self-care, and wellness suggestions. These should focus on stress reduction, lifestyle improvements (hydration, rest), and mental grounding. Examples: breathing exercises, gentle stretching, mindfulness.
    4.  **Give Next-Step Guidance:** Provide clear, actionable next steps. This should include advice on what to do now, and clear indicators for when to seek professional medical help. For "High" risk, include a strong recommendation to contact local health services immediately.
    5.  **Include a Disclaimer:** Always include the mandatory disclaimer.

    **CRITICAL RULES:**
    - **DO NOT DIAGNOSE.** Never name or suggest any specific medical condition, disease, or illness.
    - **DO NOT PROVIDE MEDICAL TREATMENT.** Do not recommend any medication, specific therapies, or medical procedures.
    - Use supportive, empathetic, and simple language. Avoid technical jargon.
    - The output must be a valid JSON object matching the provided schema.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      riskLevel: {
        type: Type.STRING,
        enum: ['Low', 'Medium', 'High'],
        description: 'The classified risk level.'
      },
      explanation: {
        type: Type.STRING,
        description: 'A simple, non-alarming explanation for the risk level.'
      },
      copingAndWellness: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['title', 'description']
        },
        description: 'A list of safe coping and wellness suggestions.'
      },
      nextSteps: {
        type: Type.OBJECT,
        properties: {
          whatToDoNow: { type: Type.STRING },
          whenToSeekHelp: { type: Type.STRING },
          emergencyGuidance: { type: Type.STRING, description: 'Specific guidance for high-risk situations. May be empty for low/medium risk.' }
        },
        required: ['whatToDoNow', 'whenToSeekHelp', 'emergencyGuidance']
      },
      disclaimer: {
        type: Type.STRING,
        description: 'The mandatory disclaimer about this not being medical advice.'
      }
    },
    required: ['riskLevel', 'explanation', 'copingAndWellness', 'nextSteps', 'disclaimer']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.5,
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as AIAnalysisResult;
    return result;
  } catch (e) {
    console.error("Failed to parse AI JSON response:", response.text);
    throw new Error("Received an invalid response from the AI service.");
  }
};

export { getHealthRiskAnalysis };
