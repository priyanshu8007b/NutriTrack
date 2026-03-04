'use server';
/**
 * @fileOverview AI Flow for suggesting Indian meals based on macro goals.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { INDIAN_FOOD_DATABASE } from '@/lib/mock-data';

const SuggestionInputSchema = z.object({
  targetCalories: z.number(),
  remainingCalories: z.number(),
  remainingProtein: z.number(),
  remainingCarbs: z.number(),
  remainingFats: z.number(),
  isVegOnly: z.boolean().default(false),
});

export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

const MealSuggestionSchema = z.object({
  foodId: z.string(),
  name: z.string(),
  servings: z.number(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  reason: z.string(),
});

const SuggestionOutputSchema = z.object({
  suggestions: z.array(MealSuggestionSchema),
  insight: z.string(),
});

export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;

const suggestionPrompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: { schema: SuggestionInputSchema },
  output: { schema: SuggestionOutputSchema },
  prompt: `You are an expert Indian Nutritionist. 
User Goal: {{{targetCalories}}} kcal/day.
Remaining for the day: {{{remainingCalories}}} kcal, P: {{{remainingProtein}}}g, C: {{{remainingCarbs}}}g, F: {{{remainingFats}}}g.
Vegetarian Only: {{#if isVegOnly}}YES{{else}}NO{{/if}}.

STRICT CONSTRAINTS for suggestions:
1. Each suggestion must be LESS than 1/3rd of the daily target ({{{targetCalories}}} / 3).
2. Prioritize high-protein options (aim for ~40% of suggestion calories from protein).
3. Use only real Indian dishes from the provided database context.
4. Calculate 'servings' (0.5, 1, 1.5, or 2) to fit the remaining calories and protein needs.

Database context (Top relevant matches):
{{#each filteredDb}}
- ID: {{id}}, Name: {{name}}, Calories: {{calories}}, P: {{protein}}, C: {{carbs}}, F: {{fats}}, Veg: {{isVeg}}
{{/each}}

Provide 3 distinct suggestions from the database above. Add a short "insight" about how to balance the rest of the day.`,
});

export async function smartIndianMealSuggestion(input: SuggestionInput): Promise<SuggestionOutput> {
  return smartIndianMealSuggestionFlow(input);
}

const smartIndianMealSuggestionFlow = ai.defineFlow(
  {
    name: 'smartIndianMealSuggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema,
  },
  async (input) => {
    // Pre-filter database to help the LLM stay accurate
    const filteredDb = INDIAN_FOOD_DATABASE
      .filter(f => (input.isVegOnly ? f.isVeg : true))
      .filter(f => f.calories <= (input.targetCalories / 3))
      .sort((a, b) => (b.protein / b.calories) - (a.protein / a.calories)) // Sort by protein density
      .slice(0, 40); // Send top 40 matches to context

    const { output } = await suggestionPrompt({
      ...input,
      filteredDb: filteredDb as any,
    });
    
    return output!;
  }
);
