import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A real app would have more robust error handling or secrets management
  console.warn("API_KEY environment variable not set. Gemini API will not be available.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getChatbotResponse = async (message: string, history: ChatMessage[]): Promise<string> => {
  if (!API_KEY) {
    return "I'm sorry, my connection to the support service is currently unavailable. Please try again later.";
  }

  try {
    const contents = [
      ...history.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: `You are a friendly and helpful AI assistant named 'Elevate Guide' for the OneABC Elevate education loan app. Your tone must be empathetic, encouraging, and supportive. You are speaking to students and their parents who may be anxious about the loan process. Keep responses concise and easy to understand. Your primary goal is to answer questions about the loan process, explain financial terms simply, and guide users on how to use the app. Do not provide specific financial advice or personal data. If asked for something you can't do, politely explain your limitations and suggest contacting human support for personal account matters. Start your first message with a warm welcome.`,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm having a little trouble connecting right now. Please try your question again in a moment.";
  }
};


export const extractInfoFromDocument = async (base64Image: string, mimeType: string): Promise<{ name: string; pan: string; }> => {
    if (!API_KEY) {
        throw new Error("API Key not configured for Gemini service.");
    }
    
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "First, verify if the provided image is a valid Indian PAN card. Then, extract the person's full name and their PAN number. If it is not a PAN card, set isPanCard to false and leave other fields null."
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isPanCard: { type: Type.BOOLEAN },
                        name: { type: Type.STRING, description: "The full name, only if isPanCard is true." },
                        pan: { type: Type.STRING, description: "The PAN number, only if isPanCard is true." }
                    },
                    required: ["isPanCard"]
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);

        if (!data.isPanCard) {
            throw new Error("The uploaded document does not appear to be a valid PAN card.");
        }

        if (!data.name || !data.pan) {
            throw new Error("Could not extract all required fields from the document.");
        }
        
        return { name: data.name, pan: data.pan };

    } catch (error) {
        console.error("Error in Gemini document extraction:", error);
        if (error instanceof Error) {
            throw error; // Re-throw the specific error
        }
        throw new Error("Failed to analyze the document. Please try a clearer image.");
    }
};

export const extractAadhaarInfoFromDocument = async (base64Image: string, mimeType: string): Promise<{ name: string; aadhaar: string; }> => {
    if (!API_KEY) { throw new Error("API Key not configured for Gemini service."); }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: "First, verify if the provided image is a valid Indian Aadhaar card. If it is, extract the person's full name and their Aadhaar number. IMPORTANT: For privacy, you MUST return the Aadhaar number with the first 8 digits masked with 'X'. The format should be 'XXXX-XXXX-NNNN'. If it is not an Aadhaar card, set isAadhaarCard to false." }
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isAadhaarCard: { type: Type.BOOLEAN },
                        name: { type: Type.STRING, description: "The full name, only if isAadhaarCard is true." },
                        aadhaar: { type: Type.STRING, description: "The masked Aadhaar number, e.g., XXXX-XXXX-1234, only if isAadhaarCard is true." }
                    },
                    required: ["isAadhaarCard"]
                },
            },
        });
        const data = JSON.parse(response.text.trim());
        
        if (!data.isAadhaarCard) {
            throw new Error("The uploaded document does not appear to be a valid Aadhaar card.");
        }

        if (!data.name || !data.aadhaar) { throw new Error("Could not extract all required fields from Aadhaar card."); }
        return { name: data.name, aadhaar: data.aadhaar };
    } catch (error) {
        console.error("Error in Gemini Aadhaar extraction:", error);
         if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to analyze the Aadhaar card. Please try a clearer image.");
    }
};

export const extractGenericInfoFromDocument = async (base64Image: string, mimeType: string): Promise<{ documentType: string; institute: string; }> => {
    if (!API_KEY) { throw new Error("API Key not configured for Gemini service."); }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: "First, verify if the provided image is a valid educational document (like an admission letter or a marksheet). If it is, identify the type of document and extract the name of the institution or university. If it is not a valid educational document, set isEducationalDocument to false." }
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isEducationalDocument: { type: Type.BOOLEAN },
                        documentType: { type: Type.STRING, description: "e.g., 'Admission Letter', 'Marksheet', only if isEducationalDocument is true." },
                        institute: { type: Type.STRING, description: "The name of the university or institute, only if isEducationalDocument is true." }
                    },
                    required: ["isEducationalDocument"]
                },
            },
        });
        const data = JSON.parse(response.text.trim());

        if (!data.isEducationalDocument) {
            throw new Error("This does not appear to be a valid admission letter or marksheet.");
        }

        if (!data.documentType || !data.institute) { throw new Error("Could not extract required fields from the document."); }
        return { documentType: data.documentType, institute: data.institute };
    } catch (error) {
        console.error("Error in Gemini generic document extraction:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to analyze the document. Please try a clearer image.");
    }
};

export const identifyDocumentType = async (base64Image: string, mimeType: string): Promise<string> => {
    if (!API_KEY) { throw new Error("API Key not configured for Gemini service."); }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: `Analyze the image and identify the document type. Is it an Indian PAN Card, an Aadhaar Card, an Admission Letter, or a Marksheet? Respond with a single JSON object: {"documentType": "PAN"}, {"documentType": "AADHAAR"}, {"documentType": "ADMISSION"}, {"documentType": "MARKSHEET"}, or {"documentType": "OTHER"}.` }
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        documentType: { type: Type.STRING, description: "The type of the document." }
                    },
                    required: ["documentType"]
                },
            },
        });
        const data = JSON.parse(response.text.trim());
        return data.documentType || 'OTHER';
    } catch (error) {
        console.error("Error in Gemini document identification:", error);
        throw new Error("Could not identify the document type.");
    }
};