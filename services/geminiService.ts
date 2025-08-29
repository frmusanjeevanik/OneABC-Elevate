import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A real app would have more robust error handling or secrets management
  console.warn("API_KEY environment variable not set. Gemini API will not be available.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
let chat: Chat | null = null;

const initializeChat = () => {
    if (API_KEY) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a friendly and helpful AI assistant named 'Elevate Guide' for the OneABC Elevate education loan app. Your tone must be empathetic, encouraging, and supportive. You are speaking to students and their parents who may be anxious about the loan process. Keep responses concise and easy to understand. Your primary goal is to answer questions about the loan process, explain financial terms simply, and guide users on how to use the app. Do not provide specific financial advice or personal data. If asked for something you can't do, politely explain your limitations and suggest contacting human support for personal account matters. Start your first message with a warm welcome.`,
            },
        });
    }
};

initializeChat();

export const getChatbotResponse = async (message: string, history: ChatMessage[]): Promise<string> => {
  if (!chat) {
    return "I'm sorry, my connection to the support service is currently unavailable. Please try again later.";
  }

  try {
    // Note: The current SDK's chat doesn't directly take a history object in `sendMessage`. 
    // The `chat` instance maintains the history. For a stateless function, you'd rebuild the history.
    // However, since we initialize `chat` once, it maintains its own state.
    // To be safe and ensure context for stateless API designs, you could re-initialize with history,
    // but we'll rely on the stateful `chat` object here.
    
    const response: GenerateContentResponse = await chat.sendMessage({ message });
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
            text: "From the provided image of an Indian PAN card, extract the person's full name and their PAN number. Ensure the PAN number is extracted with 100% accuracy."
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        pan: { type: Type.STRING }
                    },
                    required: ["name", "pan"]
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);

        if (!data.name || !data.pan) {
            throw new Error("Could not extract all required fields from the document.");
        }
        
        return data;

    } catch (error) {
        console.error("Error in Gemini document extraction:", error);
        throw new Error("Failed to analyze the document. Please try a clearer image.");
    }
};