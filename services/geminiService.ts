
import { GoogleGenAI, Type } from "@google/genai";
import { ShapeType, ChristmasBlessing } from "../types";

// Always use the specified initialization format with named parameters.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBlessing = async (shape: ShapeType): Promise<ChristmasBlessing> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, cool, and poetic Christmas blessing in Chinese based on the shape: ${shape}. 
      Context:
      - TREE: Traditional Christmas.
      - DIAMOND: "African Heart" (非洲之心), the ultimate grand prize from Delta Force game. Represents rarity and success.
      - MAGAZINE: "Commemorative Magazine" (纪念杂志), a prize from Delta Force. Represents memory and journey.
      - BELL: Christmas Bell, represents good news and joy.
      - FIREWORK: Celebration and bright future.
      The blessing should be high-end and feel like a holiday gift.
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

    // Access the .text property directly (do not call as a method).
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
