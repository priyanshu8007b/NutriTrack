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

export async function smartIndianMealSuggestion(input: SmartIndianMealSuggestionInput): Promise<SmartIndianMealSuggestionOutput> {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error("API Key is missing. Please add GOOGLE_GENAI_API_KEY to your Environment Variables.");
    }
    
    return await smartIndianMealSuggestionFlow(input);
  } catch (error: any) {
    console.error("AI Flow Execution Error:", error);
    const message = error.message || "Unknown error";
    
    if (message.includes('API_KEY_INVALID') || message.includes('403') || message.includes('401')) {
      throw new Error("Invalid API Key. Please get a fresh key from https://aistudio.google.com/app/apikey");
    }
    
    if (message.includes('quota') || message.includes('429')) {
      throw new Error("AI service quota exceeded. Please try again in a moment.");
    }

    throw new Error(message || "The AI nutritionist encountered an issue.");
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
  system: `You are an expert Indian nutritionist and master chef. Your goal is to suggest authentic, healthy, and culturally relevant Indian meals that help users meet their daily macro-nutrient targets.

  Core Guidelines:
  1. DIETARY STRICTION: If 'isVegOnly' is true, NEVER suggest meat, eggs, or fish. Focus on lentils, paneer, soy, and dairy.
  2. CULTURAL DEPTH: Suggest dishes from diverse Indian regions (North, South, East, West). Use specific names like 'Misal Pav', 'Ragi Mudde', 'Kadhi Pakora'.
  3. MACRO FOCUS: If protein is needed, suggest high-protein options like 'Dal Chilla', 'Soy Keema', or 'Grilled Fish'.
  4. LIGHT OPTIONS: If remaining calories are <200, suggest healthy Indian snacks like 'Makhana', 'Sprout Salad', or 'Buttermilk'.`,
  prompt: `
  CONTEXT:
  - User Preference: {{#if input.isVegOnly}}Vegetarian Only{{else}}Any (Veg/Non-Veg){{/if}}
  - Current Meal: {{{input.currentMealType}}}
  - Remaining Target for Today: 
    - Calories: {{{remaining.calories}}} kcal
    - Protein: {{{remaining.protein}}}g
    - Carbs: {{{remaining.carbs}}}g
    - Fats: {{{remaining.fats}}}g

  TASK:
  Provide 3 unique Indian meal suggestions that logically fit into the remaining macro budget.
  Ensure the 'remainingMacros' in the output matches the calculated remaining values provided here.`,
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

    const result = await prompt({
      input,
      remaining,
    });
    
    if (!result || !result.output) {
      throw new Error("AI failed to generate suggestions.");
    }

    return result.output;
  }
);
