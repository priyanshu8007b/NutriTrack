'use server';
/**
 * @fileOverview A Local Macro-Matching Engine for suggesting culturally relevant Indian dishes.
 * Implements strict constraints: Max 1/3 daily calories per meal and ~40% protein calorie ratio.
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
  proteinRatio: number;
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

  // Constraint: Single meal should not exceed 1/3rd of daily calorie requirement
  const maxMealCalories = input.dailyCalorieGoal / 3;

  // Filter the database based on dietary preferences
  let candidates = INDIAN_FOOD_DATABASE.filter(food => {
    if (input.isVegOnly && !food.isVeg) return false;
    
    // Basic category matching
    if (input.currentMealType === 'Breakfast') {
      return food.category === 'Breakfast' || food.category === 'Bread';
    }
    if (input.currentMealType === 'Snack') {
      return food.category === 'Snack' || food.category === 'Beverage';
    }
    return food.category !== 'Breakfast' && food.category !== 'Beverage';
  });

  // Score candidates based on protein ratio (Target: 40% calories from protein)
  const scoredCandidates = candidates.map(food => {
    // 1. Determine serving size that fits the remaining gap but stays under 1/3rd daily cap
    // We aim for the smaller of (remaining calories) or (1/3rd daily calories)
    const targetCalories = Math.min(remaining.calories, maxMealCalories);
    
    // Clamp servings between 0.5 and 2.5
    let idealServings = Math.min(2.5, Math.max(0.5, Math.round((targetCalories / food.calories) * 2) / 2));
    
    const totalCalories = food.calories * idealServings;
    const totalProtein = food.protein * idealServings;
    
    // 2. Calculate Protein Ratio (Calories from protein / Total Calories)
    // Protein has 4 kcal per gram
    const proteinCalories = totalProtein * 4;
    const proteinRatio = totalCalories > 0 ? proteinCalories / totalCalories : 0;

    let score = 0;

    // A. Bonus for being close to the 40% protein calorie target
    // We penalize distance from 0.40 ratio
    const ratioDistance = Math.abs(proteinRatio - 0.40);
    score += Math.max(0, 500 - (ratioDistance * 1000));

    // B. Bonus for fitting the calorie target well (up to the cap)
    const calorieFit = 1 - Math.abs(totalCalories - targetCalories) / targetCalories;
    score += calorieFit * 200;

    // C. Penalty if it significantly exceeds the 1/3rd daily calorie cap
    if (totalCalories > maxMealCalories * 1.1) {
      score -= 1000;
    }

    return { food, score, idealServings, totalCalories, totalProtein, proteinRatio };
  });

  // Sort and pick top 3
  const topMatches = scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(match => ({
      dishName: match.food.name,
      description: `Optimized for protein balance (~${(match.proteinRatio * 100).toFixed(0)}% cal from protein). This suggestion respects your ${Math.round(maxMealCalories)} kcal meal cap.`,
      servings: match.idealServings,
      servingSize: match.food.servingSize,
      estimatedMacros: {
        calories: Math.round(match.food.calories * match.idealServings),
        protein: Math.round(match.food.protein * match.idealServings),
        carbs: Math.round(match.food.carbs * match.idealServings),
        fats: Math.round(match.food.fats * match.idealServings),
      },
      isCombination: false,
      proteinRatio: match.proteinRatio
    }));

  // Artificial delay for UX "Processing" feel
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
