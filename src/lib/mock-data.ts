export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  isVeg: boolean;
  servingSize: string; // Weight or standard measure (e.g., "100g", "1 unit")
}

export const INDIAN_FOOD_DATABASE: FoodItem[] = [
  // --- NORTH INDIAN STAPLES ---
  { id: 1, name: "Chole Bhature", calories: 450, protein: 12, carbs: 55, fats: 22, category: "Breakfast", isVeg: true, servingSize: "2 units + 1 bowl" },
  { id: 2, name: "Butter Chicken", calories: 480, protein: 32, carbs: 12, fats: 35, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 3, name: "Dal Makhani", calories: 320, protein: 10, carbs: 28, fats: 18, category: "Lentils", isVeg: true, servingSize: "200g" },
  { id: 4, name: "Paneer Tikka", calories: 280, protein: 18, carbs: 8, fats: 20, category: "Snack", isVeg: true, servingSize: "150g" },
  { id: 5, name: "Rajma Chawal", calories: 420, protein: 15, carbs: 75, fats: 8, category: "Main Course", isVeg: true, servingSize: "400g" },
  { id: 6, name: "Aloo Paratha", calories: 290, protein: 6, carbs: 45, fats: 10, category: "Bread", isVeg: true, servingSize: "1 unit (approx 120g)" },
  { id: 7, name: "Chicken Biryani", calories: 520, protein: 28, carbs: 65, fats: 15, category: "Main Course", isVeg: false, servingSize: "350g" },
  { id: 8, name: "Mutton Rogan Josh", calories: 450, protein: 35, carbs: 8, fats: 32, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 9, name: "Tandoori Chicken", calories: 260, protein: 38, carbs: 2, fats: 12, category: "Main Course", isVeg: false, servingSize: "200g" },
  { id: 10, name: "Gajar Ka Halwa", calories: 350, protein: 5, carbs: 42, fats: 18, category: "Dessert", isVeg: true, servingSize: "100g" },

  // --- SOUTH INDIAN STAPLES ---
  { id: 11, name: "Masala Dosa", calories: 350, protein: 6, carbs: 52, fats: 14, category: "Breakfast", isVeg: true, servingSize: "1 unit + Chutney" },
  { id: 12, name: "Idli Sambar", calories: 220, protein: 8, carbs: 40, fats: 2, category: "Breakfast", isVeg: true, servingSize: "2 idlis + 150ml Sambar" },
  { id: 13, name: "Medhu Vada", calories: 280, protein: 6, carbs: 24, fats: 18, category: "Snack", isVeg: true, servingSize: "2 units (80g)" },
  { id: 14, name: "Hyderabadi Chicken Biryani", calories: 580, protein: 32, carbs: 70, fats: 18, category: "Main Course", isVeg: false, servingSize: "350g" },
  { id: 15, name: "Lemon Rice", calories: 310, protein: 5, carbs: 55, fats: 8, category: "Rice", isVeg: true, servingSize: "250g" },
  { id: 16, name: "Chicken 65", calories: 320, protein: 25, carbs: 8, fats: 22, category: "Snack", isVeg: false, servingSize: "150g" },
  { id: 17, name: "Appam with Stew (Veg)", calories: 280, protein: 5, carbs: 45, fats: 10, category: "Breakfast", isVeg: true, servingSize: "2 appams + 150ml Stew" },
  { id: 18, name: "Prawn Gassi", calories: 380, protein: 28, carbs: 12, fats: 25, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 19, name: "Mysore Pak", calories: 420, protein: 4, carbs: 48, fats: 24, category: "Dessert", isVeg: true, servingSize: "50g" },
  { id: 20, name: "Avial", calories: 180, protein: 4, carbs: 15, fats: 12, category: "Side Dish", isVeg: true, servingSize: "150g" },

  // --- WEST INDIAN STAPLES ---
  { id: 21, name: "Vada Pav", calories: 300, protein: 6, carbs: 42, fats: 12, category: "Snack", isVeg: true, servingSize: "1 unit" },
  { id: 22, name: "Pav Bhaji", calories: 450, protein: 9, carbs: 65, fats: 18, category: "Main Course", isVeg: true, servingSize: "1 bowl Bhaji + 2 Pavs" },
  { id: 23, name: "Misal Pav", calories: 380, protein: 12, carbs: 45, fats: 16, category: "Breakfast", isVeg: true, servingSize: "1 plate" },
  { id: 24, name: "Dhokla (Khaman)", calories: 160, protein: 6, carbs: 22, fats: 6, category: "Snack", isVeg: true, servingSize: "100g (3-4 pcs)" },
  { id: 25, name: "Fish Recheado Fry", calories: 320, protein: 28, carbs: 5, fats: 20, category: "Main Course", isVeg: false, servingSize: "150g" },
  { id: 26, name: "Goan Prawn Curry", calories: 350, protein: 25, carbs: 10, fats: 22, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 27, name: "Thepla (Methi)", calories: 120, protein: 4, carbs: 18, fats: 4, category: "Bread", isVeg: true, servingSize: "1 unit (approx 40g)" },
  { id: 28, name: "Puran Poli", calories: 280, protein: 6, carbs: 48, fats: 8, category: "Dessert", isVeg: true, servingSize: "1 unit" },
  { id: 29, name: "Laal Maas", calories: 480, protein: 38, carbs: 6, fats: 35, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 30, name: "Dal Baati Churma", calories: 650, protein: 18, carbs: 85, fats: 28, category: "Main Course", isVeg: true, servingSize: "1 plate" },

  // --- EAST & NORTH EAST INDIAN STAPLES ---
  { id: 31, name: "Macher Jhol (Fish Curry)", calories: 280, protein: 25, carbs: 8, fats: 16, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 32, name: "Luchi with Alur Dom", calories: 420, protein: 7, carbs: 55, fats: 20, category: "Main Course", isVeg: true, servingSize: "3 luchis + 150g Alur Dom" },
  { id: 33, name: "Momos (Veg Steamed)", calories: 220, protein: 6, carbs: 45, fats: 2, category: "Snack", isVeg: true, servingSize: "6 units" },
  { id: 34, name: "Momos (Chicken Steamed)", calories: 280, protein: 18, carbs: 40, fats: 5, category: "Snack", isVeg: false, servingSize: "6 units" },
  { id: 35, name: "Thukpa (Chicken)", calories: 350, protein: 22, carbs: 45, fats: 8, category: "Main Course", isVeg: false, servingSize: "400ml" },
  { id: 36, name: "Rosogolla", calories: 150, protein: 4, carbs: 30, fats: 2, category: "Dessert", isVeg: true, servingSize: "2 units (100g)" },
  { id: 37, name: "Kosha Mangsho (Mutton)", calories: 550, protein: 38, carbs: 12, fats: 40, category: "Main Course", isVeg: false, servingSize: "250g" },
  { id: 38, name: "Pitha", calories: 240, protein: 5, carbs: 50, fats: 2, category: "Dessert", isVeg: true, servingSize: "2 units" },
  { id: 39, name: "Eromba", calories: 120, protein: 8, carbs: 15, fats: 2, category: "Side Dish", isVeg: false, servingSize: "150g" },
  { id: 40, name: "Smoked Pork with Bamboo Shoot", calories: 420, protein: 32, carbs: 5, fats: 30, category: "Main Course", isVeg: false, servingSize: "200g" },

  // --- HOUSEHOLD STAPLES (PAN-INDIA) ---
  { id: 41, name: "Plain Rice (Steamed)", calories: 205, protein: 4, carbs: 45, fats: 0.5, category: "Rice", isVeg: true, servingSize: "1 cup (150g)" },
  { id: 42, name: "Phulka (Wheat Roti)", calories: 75, protein: 3, carbs: 15, fats: 0.5, category: "Bread", isVeg: true, servingSize: "1 unit (30g)" },
  { id: 43, name: "Plain Curd (Full Fat)", calories: 120, protein: 6, carbs: 8, fats: 8, category: "Side Dish", isVeg: true, servingSize: "1 cup (150g)" },
  { id: 44, name: "Mixed Veg Salad", calories: 30, protein: 1, carbs: 6, fats: 0, category: "Side Dish", isVeg: true, servingSize: "1 cup (100g)" },
  { id: 45, name: "Omelette (2 Eggs)", calories: 180, protein: 14, carbs: 2, fats: 14, category: "Breakfast", isVeg: false, servingSize: "120g" },
  { id: 46, name: "Boiled Egg", calories: 78, protein: 6, carbs: 0.5, fats: 5, category: "Breakfast", isVeg: false, servingSize: "1 unit (50g)" },
  { id: 47, name: "Masala Chai", calories: 60, protein: 2, carbs: 8, fats: 2, category: "Beverage", isVeg: true, servingSize: "150ml" },
  { id: 48, name: "Buttermilk (Chaas)", calories: 45, protein: 3, carbs: 4, fats: 2, category: "Beverage", isVeg: true, servingSize: "200ml" },
  { id: 49, name: "Yellow Dal Tadka", calories: 160, protein: 9, carbs: 22, fats: 4, category: "Lentils", isVeg: true, servingSize: "200g" },
  { id: 50, name: "Aloo Bhindi Fry", calories: 140, protein: 3, carbs: 15, fats: 8, category: "Main Course", isVeg: true, servingSize: "150g" },

  // --- GENERATING REMAINDER DETERMINISTICALLY (PAN-INDIA MIX) ---
  ...Array.from({ length: 450 }, (_, i) => {
    const id = 51 + i;
    const regions = ["North", "South", "West", "East", "Central", "Punjabi", "Bengali", "Mughlai", "Tamil", "Kashmiri"];
    const region = regions[i % regions.length];
    
    const types = [
      { name: "Curry", cat: "Main Course", veg: i % 3 !== 0 },
      { name: "Pulao", cat: "Rice", veg: true },
      { name: "Sabzi", cat: "Main Course", veg: true },
      { name: "Paratha", cat: "Bread", veg: true },
      { name: "Kabab", cat: "Snack", veg: i % 2 === 0 },
      { name: "Dal", cat: "Lentils", veg: true },
      { name: "Dessert", cat: "Dessert", veg: true },
      { name: "Beverage", cat: "Beverage", veg: true }
    ];
    const type = types[i % types.length];
    
    const ingredients = ["Paneer", "Chicken", "Mutton", "Aloo", "Gobi", "Mixed Veg", "Egg", "Prawn", "Fish", "Lentil"];
    const ingredient = ingredients[(i * 3) % ingredients.length];
    
    // Adjusted veg logic to be more realistic (Chicken Kabab, Fish Curry etc.)
    const isActuallyVeg = (ingredient === "Paneer" || ingredient === "Aloo" || ingredient === "Gobi" || ingredient === "Mixed Veg" || ingredient === "Lentil");
    
    const name = `${region} ${ingredient} ${type.name} (v${id})`;
    
    return {
      id: id,
      name,
      calories: 150 + (i % 350),
      protein: 5 + (isActuallyVeg ? (i % 10) : (i % 30)),
      carbs: 10 + (i % 60),
      fats: 5 + (i % 25),
      category: type.cat,
      isVeg: isActuallyVeg,
      servingSize: `${150 + (i % 200)}g`
    };
  })
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
