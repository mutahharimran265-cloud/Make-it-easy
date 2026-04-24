import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Recipe {
  name: string;
  pronunciation?: string;
  cookingTime: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  ingredients: { item: string; amount: string; category: string }[];
  missingIngredients: string[];
  instructions: string[];
  description: string;
  imageUrl?: string;
}

export const recipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Simple, easy to pronounce name of the dish" },
      pronunciation: { type: Type.STRING, description: "Simple phonetic pronunciation guide" },
      cookingTime: { type: Type.STRING, description: "Estimated time to cook (e.g., 15 mins)" },
      calories: { type: Type.NUMBER, description: "Estimated total calories per serving" },
      macros: {
        type: Type.OBJECT,
        properties: {
          protein: { type: Type.NUMBER, description: "Grams of protein" },
          carbs: { type: Type.NUMBER, description: "Grams of carbs" },
          fat: { type: Type.NUMBER, description: "Grams of fat" }
        },
        required: ["protein", "carbs", "fat"]
      },
      difficulty: { type: Type.STRING, enum: ["Easy"], description: "Always set to Easy for this app" },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Dietary tags like Vegan, Keto, Gluten-Free, High Protein, etc."
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            amount: { type: Type.STRING },
            category: { type: Type.STRING, description: "e.g., Produce, Pantry, Protein" }
          },
          required: ["item", "amount"]
        }
      },
      missingIngredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Standard ingredients the user doesn't have but needs to make this authentic (excluding basic staples like oil/salt/pepper/butter/water)."
      },
      instructions: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      description: { type: Type.STRING, description: "A brief, friendly description of the dish" }
    },
    required: ["name", "cookingTime", "calories", "macros", "difficulty", "tags", "ingredients", "missingIngredients", "instructions", "description"]
  }
};

export async function analyzeIngredientsFromImage(base64Image: string): Promise<string[]> {
  try {
    const prompt = "Look at this image of kitchen items or a pantry and list the ingredients you see. Only provide the names of the ingredients as a comma-separated list. Be accurate and helpful.";
    
    // Using flash model for fast vision analysis
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ]
    });

    const text = response.text;
    if (!text) return [];
    
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return [];
  }
}

export async function generateRecipes(ingredients: string[], preferences: string[] = []): Promise<Recipe[]> {
  try {
    const prompt = `You are a world-renowned Michelin-star Executive Chef and Culinary Historian. I have these ingredients: ${ingredients.join(", ")}. 
    
    CRITICAL INSTRUCTIONS:
    1. LANGUAGE: ALL TEXT IN YOUR JSON OUTPUT MUST BE IN EASY, SIMPLE ENGLISH. Do not use complex vocabulary. Explain techniques simply (e.g. instead of "blanch", say "boil quickly"). Even if the input ingredients are in another language, the entire response must be in very basic English.
    2. STRICT AUTHENTICITY: Provide 4 deeply authentic, traditional recipes. Do not invent fake fusion dishes.
    3. PROFESSIONAL CLARITY: Keep the tone professional but use easy-to-understand words.
    4. PREFERENCES & DIETARY: Respect these preferences strictly: ${preferences.length > 0 ? preferences.join(', ') : 'None'}. Provide appropriate dietary tags.
    5. NUTRITION: Accurately estimate the total calories, protein, carbs, and fat for a single standard serving. Be realistic.
    6. EXACT MISSING ITEMS: List only essential, authentic ingredients the user is missing to make the dish correctly (excluding basic staples). Keep it concise.
    7. STAPLES: Assume salt, pepper, cooking oil, water, and butter are available.
    8. FORMAT: Strictly follow the provided JSON schema.
    
    Make the instructions structured, historically accurate, and professionally formatted.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema as any,
      },
    });

    if (!response.text) return [];
    const recipes: Recipe[] = JSON.parse(response.text);
    return recipes.map(r => ({
      ...r,
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(r.name + ' delicious food plating photography')}?width=800&height=800&nologo=true`
    }));
  } catch (error) {
    console.error("Error generating recipes:", error);
    return [];
  }
}

export async function generateRecipeImage(recipeName: string): Promise<string | undefined> {
  try {
    const prompt = `A crisp, photorealistic, professional top-down or 45-degree angle food photography shot of a perfectly plated "${recipeName}". 
    The style should be ultra-realistic, appetizing, and clean. 
    High-end restaurant quality, natural soft window lighting, wooden or marble background, vibrant colors. 
    No text, no watermarks, just the delicious final product.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
  return undefined;
}
