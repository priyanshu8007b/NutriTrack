export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
}

export const INDIAN_FOOD_DATABASE: FoodItem[] = [
  { id: 1, name: "Paneer Butter Masala", calories: 350, protein: 12, carbs: 8, fats: 30, category: "Main Course" },
  { id: 2, name: "Butter Chicken", calories: 400, protein: 25, carbs: 10, fats: 30, category: "Main Course" },
  { id: 3, name: "Tandoori Roti", calories: 120, protein: 3, carbs: 24, fats: 1, category: "Bread" },
  { id: 4, name: "Butter Naan", calories: 260, protein: 7, carbs: 45, fats: 6, category: "Bread" },
  { id: 5, name: "Dal Tadka", calories: 180, protein: 9, carbs: 25, fats: 6, category: "Lentils" },
  { id: 6, name: "Jeera Rice", calories: 200, protein: 4, carbs: 40, fats: 2, category: "Rice" },
  { id: 7, name: "Masala Dosa", calories: 330, protein: 6, carbs: 48, fats: 12, category: "Breakfast" },
  { id: 8, name: "Idli (2 pcs)", calories: 120, protein: 4, carbs: 24, fats: 0.5, category: "Breakfast" },
  { id: 9, name: "Samosa (1 pc)", calories: 250, protein: 4, carbs: 30, fats: 12, category: "Snack" },
  { id: 10, name: "Chicken Biryani", calories: 500, protein: 30, carbs: 60, fats: 15, category: "Main Course" },
  { id: 11, name: "Aloo Gobi", calories: 150, protein: 3, carbs: 15, fats: 8, category: "Side Dish" },
  { id: 12, name: "Gulab Jamun (1 pc)", calories: 150, protein: 2, carbs: 25, fats: 6, category: "Dessert" },
];

export interface MealLog {
  id: string;
  foodId: number;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  loggedAt: string;
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const DEFAULT_GOALS: UserGoals = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fats: 65,
};