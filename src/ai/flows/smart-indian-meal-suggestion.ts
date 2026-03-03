
'use server';
/**
 * @fileOverview A GenAI tool for suggesting culturally relevant Indian dishes or meal combinations to meet remaining daily macro targets.
 *
 * - smartIndianMealSuggestion - A function that handles the meal suggestion process.
 * - SmartIndianMealSuggestionInput - The input type for the smartIndianMealSuggestion function.
 * - SmartIndianMealSuggestionOutput - The return type for the smartIndianMealSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartIndianMealSuggestionInputSchema = z.object({
  dailyCalorieGoal: z.number().describe('The user\'s daily calorie target.'),
  dailyProteinGoal: z.number().describe('The user\'s daily protein target in grams.'),
  dailyCarbGoal: z.number().describe('The user\'s daily carbohydrate target in grams.'),
  dailyFatGoal: z.number().describe('The user\'s daily fat target in grams.'),
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
  }).describe('The user\'s remaining macronutrient targets for the day.'),
  mealSuggestions: z.array(MealSuggestionSchema).describe('A list of culturally relevant Indian meal suggestions.'),
});
export type SmartIndianMealSuggestionOutput = z.infer<typeof SmartIndianMealSuggestionOutputSchema>;

export async function smartIndianMealSuggestion(input: SmartIndianMealSuggestionInput): Promise<SmartIndianMealSuggestionOutput> {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error("GOOGLE_GENAI_API_KEY is missing. Please add it to your .env file or Vercel Environment Variables.");
    }
    return await smartIndianMealSuggestionFlow(input);
  } catch (error: any) {
    console.error("AI Flow Error:", error);
    const message = error.message || "";
    if (message.includes('API_KEY_INVALID') || message.includes('403') || message.includes('401')) {
      throw new Error("Your Google AI API Key is invalid. Please get a fresh key from https://aistudio.google.com/app/apikey");
    }
    throw new Error(error.message || "The AI nutritionist is currently offline. Please check your API key and try again.");
  }
}

const prompt = ai.definePrompt({
  name: 'smartIndianMealSuggestionPrompt',
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
  system: `You are an expert Indian nutritionist and chef. Your task is to analyze a user's daily nutritional goals and their consumed macros, then suggest authentic and healthy Indian dishes or meal combinations. 
  
  Focus on:
  1. Cultural relevance: Use regional names (e.g., "Paneer Bhurji", "Moong Dal Khichdi", "Chicken Chettinad").
  2. Macro accuracy: Suggestions must realistically help fill the remaining macro gap.
  3. Dietary strictness: If 'isVegOnly' is true, NEVER suggest meat, eggs, or fish.`,
  prompt: `
DIETARY PREFERENCE:
{{#if input.isVegOnly}}
- VEGETARIAN ONLY.
{{else}}
- ANY (Veg or Non-Veg).
{{/if}}

CURRENT MEAL CONTEXT:
- Meal Type: {{{input.currentMealType}}}
- Remaining Target: 
  - Calories: {{{remaining.calories}}} kcal
  - Protein: {{{remaining.protein}}}g
  - Carbs: {{{remaining.carbs}}}g
  - Fats: {{{remaining.fats}}}g

INSTRUCTIONS:
1. Suggest 2-3 authentic Indian options.
2. If remaining calories are low (<200), suggest light options like "Buttermilk (Chaas)" or "Spiced Sprouted Salad".
3. Return the exact 'remainingMacros' provided in the context.`,
});

const smartIndianMealSuggestionFlow = ai.defineFlow(
  {
    name: 'smartIndianMealSuggestionFlow',
    inputSchema: SmartIndianMealSuggestionInputSchema,
    outputSchema: SmartIndianMealSuggestionOutputSchema,
  },
  async (input) => {
    // Precise calculation
    const remaining = {
      calories: Math.round(Math.max(0, input.dailyCalorieGoal - input.consumedCalories)),
      protein: Math.round(Math.max(0, input.dailyProteinGoal - input.consumedProtein)),
      carbs: Math.round(Math.max(0, input.dailyCarbGoal - input.consumedCarbs)),
      fats: Math.round(Math.max(0, input.dailyFatGoal - input.consumedFats)),
    };

    const {output} = await prompt({
      input,
      remaining,
    });
    
    if (!output || !output.mealSuggestions) {
      throw new Error("The AI failed to generate specific meal suggestions. Please try adjusting your meal type.");
    }

    return output;
  }
);
