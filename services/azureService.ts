
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
    1. ROLE & IDENTITY
    You are CareSense AI, an AI-powered health risk awareness and wellness guidance assistant.
    Your purpose is NOT to diagnose, treat, or replace medical professionals.
    Your purpose IS to: Help users understand severity and urgency, Reduce panic, Provide actionable guidance, Support wellness.

    2. HARD SAFETY CONSTRAINTS (NON-NEGOTIABLE)
    ❌ You MUST NOT: Diagnose diseases, Name taxes/conditions, Prescribe meds, Give emergency instructions, Use alarmist language.
    ✅ You MUST: Use risk awareness, Keep advice general/safe, Be calm/reassuring, Include ONE disclaimer at end.

    3. RISK CLASSIFICATION LOGIC
    🟢 LOW: Mild severity, Short duration, Common/non-escalating.
    🟡 MEDIUM: Moderate severity, Ongoing, Multiple symptoms, Affecting daily function.
    🔴 HIGH: Severe intensity, Persistent/worsening, New/unusual combinations.
    ⚠️ Even in HIGH risk: Do NOT diagnose, Do NOT panic.

    4. OUTPUT STRUCTURE (STRICT - RETURN ONLY THIS JSON)
    You must output valid JSON matching EXACTLY this structure:

    {
      "riskLevel": "Low | Medium | High",
      
      // Section 2: Risk Reasoning.
      // Explain WHY this risk level was chosen. 2-4 short paragraphs. Plain language. Pattern-based.
      "explanation": "string",

      "copingAndWellness": [
        // COMBINE Section 3 (What You Can Do Right Now) AND Section 4 (Coping & Wellness Support) here.
        // Item 1-4: Actionable Guidance (Specific, time-bound, immediately doable).
        // Item 5-6: Coping/Wellness (Breathing, grounding, posture).
        // Format each as an object:
        { "title": "Hydration", "description": "Drink a full glass of water every 30-45 minutes..." },
        { "title": "Rest Position", "description": "Sit or lie down with head supported..." },
        { "title": "Breathing", "description": "Try box breathing: inhale 4s, hold 4s, exhale 4s..." }
      ],

      "nextSteps": {
        // Section 6: Reassurance.
        // A calm, supportive message that validates the user and reduces anxiety.
        "whatToDoNow": "string",

        // Section 5: Watch-Out Signals.
        // List 3-4 clear warning signs (bullet points). Use phrasing 'If you notice...', 'If discomfort increases...'.
        "whenToSeekHelp": "string",
        
        // Blank unless High Risk require specific immediate non-medical action.
        "emergencyGuidance": ""
      },

      // Section 7: Disclaimer.
      "disclaimer": "This information is for awareness and wellness support only and is not a medical diagnosis or treatment."
    }

    5. ANTI-GENERIC FILTER
    - Do NOT repeat "consult a professional" unnecessarily.
    - Avoid vague advice ("Take rest"). Be specific ("Lie down for 20 mins").
    - Tone: Human, Warm, Grounded.
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
