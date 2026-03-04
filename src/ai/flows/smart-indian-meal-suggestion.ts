'use server';
/**
 * @fileOverview A GenAI tool for suggesting culturally relevant Indian dishes or meal combinations to meet remaining daily macro targets.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartIndianMealSuggestionInputSchema = z.object({
  dailyCalorieGoal: z.number().describe("The user's daily calorie target."),
  dailyProteinGoal: z.number().describe("The user's daily protein target in grams."),
  dailyCarbGoal: z.number().describe("The user's daily carbohydrate target in grams."),
  dailyFatGoal: z.number().describe("The user's daily fat target in grams."),
  consumedCalories: z.number().describe('Calories consumed so far today.'),
  consumedProtein: z.number().describe('Protein consumed so far today in grams.'),
  consumedCarbs: z.number().describe('Carbohydrates consumed so far today in grams.'),
  consumedFats: z.number().describe('Fats consumed so far today in grams.'),
  isVegOnly: z.boolean().optional().describe('Whether the user only eats vegetarian food.'),
  currentMealType: z.string().optional().describe('The current meal type for which suggestions are needed (e.g., "Lunch", "Dinner", "Snack").')
});
export type SmartIndianMealSuggestionInput = z.infer<typeof SmartIndianMealSuggestionInputSchema>;

const MealSuggestionSchema = z.object({
  dishName: z.string().describe('The name of the suggested Indian dish or meal combination.'),
  description: z.string().describe('A brief description of the dish/combination.'),
  estimatedMacros: z.object({
    calories: z.number().describe('Estimated calories for the suggestion.'),
    protein: z.number().describe('Estimated protein in grams for the suggestion.'),
    carbs: z.number().describe('Estimated carbohydrates in grams for the suggestion.'),
    fats: z.number().describe('Estimated fats in grams for the suggestion.'),
  }).describe('Estimated macronutrients for the suggested meal.'),
  isCombination: z.boolean().describe('True if the suggestion is a combination of dishes, false otherwise.'),
});

const SmartIndianMealSuggestionOutputSchema = z.object({
  remainingMacros: z.object({
    calories: z.number().describe('Remaining calories needed for the day.'),
    protein: z.number().describe('Remaining protein needed for the day in grams.'),
    carbs: z.number().describe('Remaining carbohydrates needed for the day in grams.'),
    fats: z.number().describe('Remaining fats needed for the day in grams.'),
  }).describe("The user's remaining macronutrient targets for the day."),
  mealSuggestions: z.array(MealSuggestionSchema).describe('A list of culturally relevant Indian meal suggestions.'),
});
export type SmartIndianMealSuggestionOutput = z.infer<typeof SmartIndianMealSuggestionOutputSchema>;

/**
 * Server Action to generate smart meal suggestions.
 */
export async function smartIndianMealSuggestion(input: SmartIndianMealSuggestionInput): Promise<SmartIndianMealSuggestionOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key Missing: Please add GOOGLE_GENAI_API_KEY to your Vercel Environment Variables.");
  }

  try {
    return await smartIndianMealSuggestionFlow(input);
  } catch (error: any) {
    console.error("Smart Suggestion Error:", error);
    const message = error.message || "";
    
    if (message.includes('404') || message.includes('not found')) {
      throw new Error("Model Configuration Error: The AI service could not find the requested model. This often happens due to regional restrictions on Gemini or an API version mismatch.");
    }
    
    if (message.includes('403') || message.includes('API_KEY_INVALID')) {
      throw new Error("Invalid API Key: Your Gemini API key is invalid or unauthorized. Please verify it in Vercel.");
    }

    throw new Error(message || "The AI nutritionist encountered an issue generating your suggestions.");
  }
}

const prompt = ai.definePrompt({
  name: 'smartIndianMealSuggestionPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: z.object({
    input: SmartIndianMealSuggestionInputSchema,
    remaining: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fats: z.number(),
    })
  })},
  output: {schema: SmartIndianMealSuggestionOutputSchema},
  system: `You are an expert Indian nutritionist. Suggest healthy, authentic Indian meals.
  - If isVegOnly is true, NO meat/eggs/fish.
  - Suggest regional dishes with estimated macros.
  - Focus on balancing the remaining macros provided.
  - Use common household measurements in descriptions.`,
  prompt: `
  User Preference: {{#if input.isVegOnly}}Vegetarian{{else}}Any{{/if}}
  Current Meal: {{{input.currentMealType}}}
  Remaining Today: 
  - Cal: {{{remaining.calories}}}
  - Prot: {{{remaining.protein}}}g
  - Carbs: {{{remaining.carbs}}}g
  - Fats: {{{remaining.fats}}}g

  Suggest 3 meals that fit this budget.`,
});

const smartIndianMealSuggestionFlow = ai.defineFlow(
  {
    name: 'smartIndianMealSuggestionFlow',
    inputSchema: SmartIndianMealSuggestionInputSchema,
    outputSchema: SmartIndianMealSuggestionOutputSchema,
  },
  async (input) => {
    const remaining = {
      calories: Math.round(Math.max(0, input.dailyCalorieGoal - input.consumedCalories)),
      protein: Math.round(Math.max(0, input.dailyProteinGoal - input.consumedProtein)),
      carbs: Math.round(Math.max(0, input.dailyCarbGoal - input.consumedCarbs)),
      fats: Math.round(Math.max(0, input.dailyFatGoal - input.consumedFats)),
    };

    const result = await prompt({ input, remaining });
    if (!result || !result.output) {
      throw new Error("AI failed to generate output.");
    }

    return result.output;
  }
);
