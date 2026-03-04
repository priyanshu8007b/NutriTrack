'use server';
/**
 * @fileOverview A Local Macro-Matching Engine for suggesting culturally relevant Indian dishes.
 * This replaces the external GenAI flow to provide 100% reliability without API keys.
 */

import { INDIAN_FOOD_DATABASE, FoodItem } from '@/lib/mock-data';

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
  // We prioritize the macro that is furthest from its goal percentage-wise
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
    
    // Penalty for exceeding calorie gap (if we have a significant gap)
    if (remaining.calories > 100 && food.calories > remaining.calories * 1.2) {
      score -= 50;
    }

    // Bonus for bridging the priority macro
    if (priorityMacro === 'protein') score += food.protein * 2;
    if (priorityMacro === 'carbs') score += food.carbs * 1.5;
    if (priorityMacro === 'fats') score += food.fats * 1.2;

    // Bonus for fitting into the calorie "sweet spot" (approx 80% of remaining for the meal)
    const targetMealCal = remaining.calories;
    const calDiff = Math.abs(food.calories - targetMealCal);
    score += Math.max(0, 100 - (calDiff / 5));

    return { food, score };
  });

  // Sort and pick top 3
  const topMatches = scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(match => ({
      dishName: match.food.name,
      description: `Authentic ${match.food.category} dish. Serving Size: ${match.food.servingSize}. Recommended to balance your remaining ${priorityMacro} needs.`,
      estimatedMacros: {
        calories: match.food.calories,
        protein: match.food.protein,
        carbs: match.food.carbs,
        fats: match.food.fats,
      },
      isCombination: false
    }));

  // If we have few remaining calories, add a "Light Option" as a fallback
  if (remaining.calories < 150 && topMatches.length > 0) {
    const lightOption = INDIAN_FOOD_DATABASE.find(f => f.calories < 100 && (input.isVegOnly ? f.isVeg : true));
    if (lightOption) {
      topMatches[2] = {
        dishName: lightOption.name,
        description: "A light, healthy choice to stay within your remaining calorie limit.",
        estimatedMacros: {
          calories: lightOption.calories,
          protein: lightOption.protein,
          carbs: lightOption.carbs,
          fats: lightOption.fats,
        },
        isCombination: false
      };
    }
  }

  // Artificial delay to mimic "AI" processing feel
  await new Promise(resolve => setTimeout(resolve, 800));

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
