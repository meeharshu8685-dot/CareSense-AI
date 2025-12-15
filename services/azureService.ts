
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
        apiVersion: "2024-12-01-preview",
        dangerouslyAllowBrowser: true
    });

    const systemPrompt = `
    You are CareSense AI. Provide brief, accurate health awareness guidance. NOT medical advice.

    Tasks:
    1. **Classify Risk:** "Low", "Medium", or "High". Be conservative.
    2. **Explanation:** MAX 2 SENTENCES. Explain the risk level simply based on the specific symptoms provided.
    3. **Wellness Tips:** Provide exactly 3 short, actionable, and relevant self-care tips (e.g., hydration, rest).
    4. **Next Steps:** 1 clear instruction on what to do next. For "High" risk, say "Seek professional help immediately."
    5. **Disclaimer:** Include the mandatory non-medical disclaimer.

    **CRITICAL:** 
    - Be extremely CONCISE. 
    - **DO NOT DIAGNOSE** or name conditions. 
    - **DO NOT PRESCRIBE** meds.
    - Output valid JSON matching the schema.
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
        });

        const jsonText = response.choices[0].message.content;
        if (!jsonText) {
            throw new Error("No content received from Azure OpenAI");
        }

        const result = JSON.parse(jsonText) as AIAnalysisResult;
        return result;

    } catch (e: any) {
        console.error("Failed to call Azure OpenAI or parse response:", e);
        // Throw the actual error message so the UI can show it
        throw new Error(e.message || "Received an invalid response from the AI service.");
    }
};

export { getHealthRiskAnalysis };
