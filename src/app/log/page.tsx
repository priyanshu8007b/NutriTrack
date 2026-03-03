"use client"

import * as React from "react"
import { Search, Plus, Trash2, Clock, Calculator, Info, UtensilsCrossed, Filter, Leaf, Utensils } from "lucide-react"
import { INDIAN_FOOD_DATABASE, FoodItem } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type MealCategory = "All" | "Breakfast" | "Lunch" | "Snacks" | "Dinner"

export default function LogMealPage() {
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<MealCategory>("All")
  const [selectedItems, setSelectedItems] = React.useState<{ food: FoodItem, quantity: number }[]>([])
  const { toast } = useToast()

  const filteredFoods = INDIAN_FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase())
    
    if (selectedCategory === "All") return matchesSearch
    
    if (selectedCategory === "Breakfast") {
      return matchesSearch && (food.category === "Breakfast" || food.category === "Bread")
    }
    
    if (selectedCategory === "Snacks") {
      return matchesSearch && (food.category === "Snack" || food.category === "Beverage")
    }
    
    const isMainMeal = ["Main Course", "Lentils", "Rice", "Bread", "Side Dish"].includes(food.category)
    if (selectedCategory === "Lunch" || selectedCategory === "Dinner") {
      return matchesSearch && isMainMeal
    }
    
    return matchesSearch
  })

  const handleAddItem = (food: FoodItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.food.id === food.id)
      if (existing) {
        return prev.map(item => 
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { food, quantity: 1 }]
    })
  }

  const handleRemoveItem = (id: number) => {
    setSelectedItems(prev => prev.filter(item => item.food.id !== id))
  }

  const handleUpdateQuantity = (id: number, delta: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.food.id === id) {
        const newQty = Math.max(0.5, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const totals = selectedItems.reduce((acc, item) => ({
    calories: acc.calories + (item.food.calories * item.quantity),
    protein: acc.protein + (item.food.protein * item.quantity),
    carbs: acc.carbs + (item.food.carbs * item.quantity),
    fats: acc.fats + (item.food.fats * item.quantity),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 })

  const handleSave = () => {
    toast({
      title: "Meal Logged Successfully",
      description: `Added ${selectedItems.length} items to your daily log.`,
    })
    setSelectedItems([])
  }

  const categories: MealCategory[] = ["All", "Breakfast", "Lunch", "Snacks", "Dinner"]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Log Indian Meal</h1>
        <p className="text-muted-foreground mt-2 text-lg">Detailed tracking with authentic weights and regional variety.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search over 1,000+ Indian dishes..." 
                  className="pl-10 h-12 bg-secondary/20 border-border/50 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full px-4 h-9 font-bold transition-all",
                      selectedCategory === cat ? "shadow-md" : "border-border/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-1 gap-3">
                  {filteredFoods.map((food) => (
                    <div 
                      key={food.id} 
                      className="group flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-card/50"
                      onClick={() => handleAddItem(food)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {food.isVeg ? <Leaf className="w-3 h-3 text-green-600 fill-current" /> : <Utensils className="w-3 h-3 text-red-600" />}
                          <span className="font-bold text-foreground text-base">{food.name}</span>
                        </div>
                        <div className="flex gap-3 items-center mt-1">
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest py-0 px-2 bg-secondary/50 border-none">
                            {food.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium italic">
                            Serving: {food.servingSize} • {food.calories} kcal
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="icon" className="group-hover:bg-primary group-hover:text-primary-foreground rounded-full shadow-sm transition-colors">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                  {filteredFoods.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                        <Filter className="w-6 h-6 text-muted-foreground opacity-20" />
                      </div>
                      <p className="text-muted-foreground font-medium">No regional matches found.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-primary/20 sticky top-8 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="border-b border-border/50 bg-secondary/10 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                  </div>
                  Your Plate
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground font-black px-3 py-1">
                  {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedItems.length > 0 ? (
                <div className="space-y-6">
                  <ScrollArea className="max-h-[350px] pr-4">
                    <div className="space-y-4">
                      {selectedItems.map((item) => (
                        <div key={item.food.id} className="flex flex-col gap-3 group">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm truncate max-w-[200px] leading-tight">{item.food.name}</span>
                              <div className="flex gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                                <span>{(item.food.calories * item.quantity).toFixed(0)} kcal</span>
                                <span>•</span>
                                <span>{item.food.servingSize} × {item.quantity}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center bg-secondary/30 rounded-lg p-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-md hover:bg-white/50"
                                  onClick={() => handleUpdateQuantity(item.food.id, -0.5)}
                                >
                                  -
                                </Button>
                                <span className="w-9 text-center font-black text-sm">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-md hover:bg-white/50"
                                  onClick={() => handleUpdateQuantity(item.food.id, 0.5)}
                                >
                                  +
                                </Button>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={() => handleRemoveItem(item.food.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Separator className="bg-border/30" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest">Logged Intake</span>
                      <span className="text-3xl font-black text-primary">{totals.calories.toFixed(0)} <span className="text-xs uppercase">kcal</span></span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/50 p-3 rounded-2xl border border-border/50 text-center">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Protein</span>
                        <span className="font-black text-accent text-sm">{totals.protein.toFixed(1)}g</span>
                      </div>
                      <div className="bg-white/50 p-3 rounded-2xl border border-border/50 text-center">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Carbs</span>
                        <span className="font-black text-foreground text-sm">{totals.carbs.toFixed(1)}g</span>
                      </div>
                      <div className="bg-white/50 p-3 rounded-2xl border border-border/50 text-center">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Fats</span>
                        <span className="font-black text-foreground text-sm">{totals.fats.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-6">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                    <UtensilsCrossed className="w-10 h-10 opacity-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-lg text-foreground">Nothing on your plate</p>
                    <p className="text-sm font-medium">Add items to start tracking your regional meal.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3 border-t border-border/50 pt-6 px-6 pb-6">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={selectedItems.length === 0}
                onClick={handleSave}
              >
                Log This Meal
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
