
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { FengShuiReport } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFengShui = async (images: string[]): Promise<FengShuiReport> => {
  const ai = getAI();
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1]
    }
  }));

  const prompt = `Analyze these 2 images representing the North and South walls of a bedroom.
  Perform a professional Feng Shui analysis based on the energy axis created by these two opposing views.
  
  Return a JSON object with:
  1. overallScore (0-100): Current harmony score.
  2. potentialScore (0-100): Score the room would reach if all hidden issues were corrected (must be significantly higher).
  3. energyFlow: Description of the Chi flow between these two walls.
  4. positives: List of existing good Feng Shui features.
  5. issues: List of detected problems with title, description, and severity. Do NOT provide solutions or "how-to-fix" instructions.
  6. elementalBalance: Percentage distribution of the 5 elements.
  7. visualMapPrompt: A highly detailed architectural technical description for a 3D top-down aerial render.
  
  All text in the report must be in English.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [...imageParts, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          potentialScore: { type: Type.NUMBER },
          energyFlow: { type: Type.STRING },
          positives: { type: Type.ARRAY, items: { type: Type.STRING } },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['title', 'description', 'severity']
            }
          },
          elementalBalance: {
            type: Type.OBJECT,
            properties: {
              wood: { type: Type.NUMBER },
              fire: { type: Type.NUMBER },
              earth: { type: Type.NUMBER },
              metal: { type: Type.NUMBER },
              water: { type: Type.NUMBER }
            }
          },
          visualMapPrompt: { type: Type.STRING }
        },
        required: ['overallScore', 'potentialScore', 'energyFlow', 'positives', 'issues', 'elementalBalance', 'visualMapPrompt']
      }
    }
  });

  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr) as FengShuiReport;
};

export const generateAerialMap = async (images: string[], prompt: string): Promise<string> => {
  const ai = getAI();
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1]
    }
  }));

  // Using gemini-3-pro-image-preview (Nano Banana Pro) for ultimate architectural quality.
  const fullPrompt = `ARCHITECTURAL MASTERPIECE: Realistic, top view, aerial, architecture view of room. 
  CRITICAL FENG SHUI OVERLAY: Identify major conflict zones (Sha Chi) and mark them with sharp, glowing neon red circles or translucent red caution zones directly on the 3D objects that are misaligned.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        ...imageParts,
        { text: fullPrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "2K"
      }
    }
  });

  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image was generated");
};

export const editImageWithGemini = async (imageData: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageData.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
        {
          text: `Apply this Feng Shui improvement to the image: ${prompt}. Maintain the room's overall structure and lighting quality.`,
        },
      ],
    },
  });

  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image was generated");
};
