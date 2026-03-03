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
  return smartIndianMealSuggestionFlow(input);
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
  prompt: `You are an expert Indian nutritionist and chef. Your task is to analyze a user's daily nutritional goals and their consumed macros, then suggest culturally relevant Indian dishes or meal combinations to help them meet their remaining macro targets for the day.

DIETARY PREFERENCE:
{{#if input.isVegOnly}}
- The user is VEGETARIAN. DO NOT suggest any meat, fish, or eggs. Suggest only pure vegetarian (veg) Indian dishes.
{{else}}
- The user has no specific dietary restrictions. You can suggest both veg and non-veg Indian dishes.
{{/if}}

CURRENT MEAL CONTEXT:
- Meal Type: {{{input.currentMealType}}}
- Remaining Target: 
  - Calories: {{{remaining.calories}}} kcal
  - Protein: {{{remaining.protein}}}g
  - Carbs: {{{remaining.carbs}}}g
  - Fats: {{{remaining.fats}}}g

INSTRUCTIONS:
1. Suggest 2-3 authentic Indian dishes or combinations (like "Paneer Bhurji with 2 Rotis" or "Moong Dal Khichdi with Curd").
2. If the user has already exceeded their calories (negative remaining calories), suggest extremely light options like "Kachumber Salad", "Spiced Chaas (Buttermilk)", or "Lemon Water with Chia Seeds".
3. Ensure the estimated macros for each suggestion are realistic.
4. Provide the exact 'remainingMacros' object passed in the context.`,
});

const smartIndianMealSuggestionFlow = ai.defineFlow(
  {
    name: 'smartIndianMealSuggestionFlow',
    inputSchema: SmartIndianMealSuggestionInputSchema,
    outputSchema: SmartIndianMealSuggestionOutputSchema,
  },
  async (input) => {
    // Perform accurate calculation in TypeScript before hitting the LLM
    const remaining = {
      calories: Math.max(0, input.dailyCalorieGoal - input.consumedCalories),
      protein: Math.max(0, input.dailyProteinGoal - input.consumedProtein),
      carbs: Math.max(0, input.dailyCarbGoal - input.consumedCarbs),
      fats: Math.max(0, input.dailyFatGoal - input.consumedFats),
    };

    const {output} = await prompt({
      input,
      remaining,
    });
    
    // Safety check to ensure LLM returns valid output
    if (!output) {
      throw new Error("Failed to generate meal suggestions. Please try again.");
    }

    return {
      remainingMacros: remaining,
      mealSuggestions: output.mealSuggestions || [],
    };
  }
);