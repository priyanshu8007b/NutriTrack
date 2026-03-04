'use server';
/**
 * @fileOverview A Local Macro-Matching Engine for suggesting culturally relevant Indian dishes.
 * This provides 100% reliability without external API dependencies.
 */

import { INDIAN_FOOD_DATABASE } from '@/lib/mock-data';

export interface SmartIndianMealSuggestionInput {
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFats: number;
  isVegOnly?: boolean;
  currentMealType?: string;
}

export interface MealSuggestion {
  dishName: string;
  description: string;
  servings: number;
  servingSize: string;
  estimatedMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  isCombination: boolean;
}

export interface SmartIndianMealSuggestionOutput {
  remainingMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  mealSuggestions: MealSuggestion[];
}

/**
 * Local implementation of the suggestion engine.
 * Analyzes the macro gap and finds the best matching items from the database.
 */
export async function smartIndianMealSuggestion(input: SmartIndianMealSuggestionInput): Promise<SmartIndianMealSuggestionOutput> {
  // Calculate the macro gap
  const remaining = {
    calories: Math.max(0, input.dailyCalorieGoal - input.consumedCalories),
    protein: Math.max(0, input.dailyProteinGoal - input.consumedProtein),
    carbs: Math.max(0, input.dailyCarbGoal - input.consumedCarbs),
    fats: Math.max(0, input.dailyFatGoal - input.consumedFats),
  };

  // Filter the database based on dietary preferences
  let candidates = INDIAN_FOOD_DATABASE.filter(food => {
    if (input.isVegOnly && !food.isVeg) return false;
    
    // Simple category matching for meal types
    if (input.currentMealType === 'Breakfast') {
      return food.category === 'Breakfast' || food.category === 'Bread';
    }
    if (input.currentMealType === 'Snack') {
      return food.category === 'Snack' || food.category === 'Beverage';
    }
    // For Lunch/Dinner, avoid breakfast-only items
    return food.category !== 'Breakfast' && food.category !== 'Beverage';
  });

  // Ranking algorithm: Find foods that fit the calorie gap and help bridge the most needed macro
  const macroRatios = {
    protein: input.dailyProteinGoal > 0 ? remaining.protein / input.dailyProteinGoal : 0,
    carbs: input.dailyCarbGoal > 0 ? remaining.carbs / input.dailyCarbGoal : 0,
    fats: input.dailyFatGoal > 0 ? remaining.fats / input.dailyFatGoal : 0,
  };

  const priorityMacro = (macroRatios.protein >= macroRatios.carbs && macroRatios.protein >= macroRatios.fats) 
    ? 'protein' 
    : (macroRatios.carbs >= macroRatios.fats ? 'carbs' : 'fats');

  // Score candidates
  const scoredCandidates = candidates.map(food => {
    let score = 0;
    
    // Calculate ideal servings to fill calorie gap (clamped between 0.5 and 2.5)
    let idealServings = 1;
    if (remaining.calories > 0) {
      idealServings = Math.min(2.5, Math.max(0.5, Math.round((remaining.calories / food.calories) * 2) / 2));
    }

    const totalCalories = food.calories * idealServings;

    // Penalty for significantly exceeding calorie gap
    if (remaining.calories > 50 && totalCalories > remaining.calories * 1.3) {
      score -= 100;
    }

    // Bonus for bridging the priority macro (weighted by servings)
    if (priorityMacro === 'protein') score += (food.protein * idealServings) * 3;
    if (priorityMacro === 'carbs') score += (food.carbs * idealServings) * 1.5;
    if (priorityMacro === 'fats') score += (food.fats * idealServings) * 1.2;

    // Bonus for fitting into the calorie "sweet spot"
    const calDiff = Math.abs(totalCalories - remaining.calories);
    score += Math.max(0, 150 - (calDiff / 3));

    return { food, score, idealServings };
  });

  // Sort and pick top 3
  const topMatches = scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(match => ({
      dishName: match.food.name,
      description: `Authentic ${match.food.category} match. High in ${priorityMacro} to balance your remaining daily needs.`,
      servings: match.idealServings,
      servingSize: match.food.servingSize,
      estimatedMacros: {
        calories: Math.round(match.food.calories * match.idealServings),
        protein: Math.round(match.food.protein * match.idealServings),
        carbs: Math.round(match.food.carbs * match.idealServings),
        fats: Math.round(match.food.fats * match.idealServings),
      },
      isCombination: false
    }));

  // Artificial delay to mimic "Processing" feel
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    remainingMacros: {
      calories: Math.round(remaining.calories),
      protein: Math.round(remaining.protein),
      carbs: Math.round(remaining.carbs),
      fats: Math.round(remaining.fats),
    },
    mealSuggestions: topMatches
  };
}
