import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePayrollInsights(payrollData: any) {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Analyze the following payroll data and provide 3 key insights:
      1. Cost trends
      2. Anomaly detection (spikes or unusual patterns)
      3. Suggestions for optimization

      Data: ${JSON.stringify(payrollData)}
      Return the response in clear markdown format.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to generate AI insights");
  }
}

export async function smartAssistant(query: string, context: any) {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      You are a Smart Payroll Assistant for HR and Admins.
      Current Context (Data): ${JSON.stringify(context)}
      User Inquiry: "${query}"

      Explain things clearly. If the user asks for a calculation, perform it.
      If they ask for specific employee details, refer to the provided context.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Assistant Error:", error);
    throw new Error("AI Assistant unreachable");
  }
}
