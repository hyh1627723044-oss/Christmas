
import { GoogleGenAI, Type } from "@google/genai";
import { ShapeType, ChristmasBlessing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBlessing = async (shape: ShapeType): Promise<ChristmasBlessing> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, cozy, and poetic Christmas blessing in Chinese based on the shape: ${shape}. 
      The blessing should be warm and feel like a holiday gift.
      Format the output as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["title", "message"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      shape,
      title: data.title || "圣诞快乐",
      message: data.message || "愿你的冬日充满温暖与欢笑。"
    };
  } catch (error) {
    console.error("Failed to generate blessing:", error);
    return {
      shape,
      title: "圣诞奇迹",
      message: "在这个神奇的时刻，愿所有的美好都如约而至。"
    };
  }
};
