
import { AzureOpenAI } from "openai";
import type { SymptomData, AIAnalysisResult } from '../types';

// This function communicates with a generative AI model.
// For the Imagine Cup, this logic is representative of using a model
// hosted and managed via Microsoft Azure AI Studio, leveraging Azure OpenAI's
// powerful reasoning and safety features. The core AI is a critical dependency.
const getHealthRiskAnalysis = async (data: SymptomData): Promise<AIAnalysisResult> => {
    if (!import.meta.env.VITE_AZURE_OPENAI_API_KEY || !import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || !import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT) {
        throw new Error("Azure OpenAI environment variables not set (VITE_AZURE_OPENAI_API_KEY, ...)");
    }

    const client = new AzureOpenAI({
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
        apiVersion: "2024-05-01-preview",
        dangerouslyAllowBrowser: true
    });

    const systemPrompt = `
    You are CareSense AI, a health risk awareness assistant. Your purpose is to provide informational guidance, NOT medical advice.
    Analyze the user-provided symptoms and wellness indicators holistically.

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
    - The output must be a valid JSON object matching the requested schema.
  `;

    const userPrompt = `
    User's Data:
    - Symptoms: "${data.symptoms}"
    - Symptom Duration (Approx. Days): ${data.duration}
    - Symptom Severity: ${data.severity ? `"${data.severity}"` : 'Not specified'}
  `;

    try {
        const response = await client.chat.completions.create({
            model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const jsonText = response.choices[0].message.content;
        if (!jsonText) {
            throw new Error("No content received from Azure OpenAI");
        }

        const result = JSON.parse(jsonText) as AIAnalysisResult;
        return result;

    } catch (e) {
        console.error("Failed to call Azure OpenAI or parse response:", e);
        throw new Error("Received an invalid response from the AI service.");
    }
};

export { getHealthRiskAnalysis };
