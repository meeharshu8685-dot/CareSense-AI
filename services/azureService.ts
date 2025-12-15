
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
    You are CareSense AI, a health risk awareness and wellness guidance assistant.

    IMPORTANT RULES:
    - Do NOT diagnose any disease or condition.
    - Do NOT give medical treatment or prescriptions.
    - Do NOT repeat generic advice like "consult a doctor" unless clearly necessary.
    - Be practical, specific, and reassuring.
    - Avoid alarmist language.

    TASK:
    Analyze the user's symptoms and wellness inputs.
    Classify the situation into ONE risk level: "Low", "Medium", or "High".

    Then provide VALUE in this exact JSON structure:

    {
      "riskLevel": "Low | Medium | High",
      "explanation": "Risk Summary: Explain what the risk level means in simple language and WHY it was chosen. (2-3 lines)",
      "copingAndWellness": [
        // Combine 'What You Can Do Right Now' (4-6 actionable items) AND 'Coping & Wellness Support' (2-3 techniques) here.
        { "title": "Hydration", "description": "Drink 250ml of water every hour..." },
        { "title": "Rest Position", "description": "Lie flat on your back..." },
        { "title": "Breathing", "description": "Try the 4-7-8 breathing technique..." }
      ],
      "nextSteps": {
        "whatToDoNow": "Reassurance & Primary Action: Start with a calm, supportive message. Then give 1 clear instruction on what to do next.",
        "whenToSeekHelp": "Watch-Out Signals: List 3-4 clear warning signs (bullet points) that mean the situation may need professional attention.",
        "emergencyGuidance": "Only if High Risk."
      },
      "disclaimer": "This information is for awareness and wellness support only and is not a medical diagnosis or treatment."
    }

    **CRITICAL:** 
    - Output valid JSON matching EXACTLY the structure above.
    - The 'copingAndWellness' array must contain objects with 'title' and 'description'.
    - Use clear, empathetic language.
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

        // Sanitize the JSON text by removing markdown code block markers if present
        const cleanJson = jsonText.replace(/```json\n?|```/g, '').trim();

        let result: AIAnalysisResult;
        try {
            const parsed = JSON.parse(cleanJson);

            // ADAPTER: Handle if AI returns "wellnessTips" (string[]) instead of "copingAndWellness" (obj[])
            let copingAndWellness = parsed.copingAndWellness;
            if (!copingAndWellness && Array.isArray(parsed.wellnessTips)) {
                copingAndWellness = parsed.wellnessTips.map((tip: string) => ({
                    title: "Tip",
                    description: tip
                }));
            }

            // Check minimal structure
            if (parsed && typeof parsed === 'object' && Array.isArray(copingAndWellness)) {
                // Return structured result with normalized data
                result = {
                    ...parsed,
                    copingAndWellness: copingAndWellness
                } as AIAnalysisResult;
            } else {
                // It parses but structure is still wrong
                console.warn("AI returned unstructured JSON:", parsed);
                result = {
                    riskLevel: parsed.riskLevel || 'Medium',
                    explanation: parsed.explanation || (typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed)),
                    copingAndWellness: [],
                    nextSteps: parsed.nextSteps || {
                        whatToDoNow: "Please consult a healthcare provider.",
                        whenToSeekHelp: "If symptoms persist.",
                        emergencyGuidance: ""
                    },
                    disclaimer: parsed.disclaimer || "This AI response was unstructured. Please verify all information.",
                    rawResponse: JSON.stringify(parsed, null, 2)
                };
            }
        } catch (parseError) {
            console.warn("AI returned non-JSON text:", cleanJson);
            // Fallback for completely non-JSON text
            result = {
                riskLevel: 'Medium',
                explanation: "We received a text response instead of structured data.",
                copingAndWellness: [],
                nextSteps: {
                    whatToDoNow: "Review the raw response below.",
                    whenToSeekHelp: "If you feel unwell.",
                    emergencyGuidance: ""
                },
                disclaimer: "Standard disclaimer applies.",
                rawResponse: cleanJson
            };
        }

        return result;

    } catch (e: any) {
        console.error("Failed to call Azure OpenAI or parse response:", e);
        // Throw the actual error message so the UI can show it
        throw new Error(e.message || "Received an invalid response from the AI service.");
    }
};

export { getHealthRiskAnalysis };
