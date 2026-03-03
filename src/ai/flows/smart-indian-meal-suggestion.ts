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
  input: {schema: SmartIndianMealSuggestionInputSchema},
  output: {schema: SmartIndianMealSuggestionOutputSchema},
  prompt: `You are an expert Indian nutritionist and chef. Your task is to analyze a user's daily nutritional goals and their consumed macros, then suggest culturally relevant Indian dishes or meal combinations to help them meet their remaining macro targets for the day.

DIETARY PREFERENCE:
{{#if isVegOnly}}
- The user is VEGETARIAN. DO NOT suggest any meat, fish, or eggs. Suggest only pure vegetarian (veg) Indian dishes.
{{else}}
- The user has no specific dietary restrictions. You can suggest both veg and non-veg Indian dishes.
{{/if}}

CALCULATION TASK:
1. Calculate remaining macros: (Goal - Consumed).
2. If any remaining macro is negative (meaning the user has exceeded their goal), suggest very light, low-calorie Indian options like salads (Kachumber), buttermilk (Chaas), or clear soups that still provide some protein if needed.
3. Suggest 1-2 authentic Indian dishes or combinations appropriate for the current meal type: {{{currentMealType}}}.

USER DATA:
Daily Goals:
- Calories: {{{dailyCalorieGoal}}}
- Protein: {{{dailyProteinGoal}}}g
- Carbs: {{{dailyCarbGoal}}}g
- Fats: {{{dailyFatGoal}}}g

Consumed So Far:
- Calories: {{{consumedCalories}}}
- Protein: {{{consumedProtein}}}g
- Carbs: {{{consumedCarbs}}}g
- Fats: {{{consumedFats}}}g

Ensure the 'remainingMacros' in the output accurately reflects (Goal - Consumed). Provide authentic dish names (e.g., 'Paneer Bhurji with Roti', 'Moong Dal Khichdi').`,
});

const smartIndianMealSuggestionFlow = ai.defineFlow(
  {
    name: 'smartIndianMealSuggestionFlow',
    inputSchema: SmartIndianMealSuggestionInputSchema,
    outputSchema: SmartIndianMealSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
