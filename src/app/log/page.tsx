
"use client"

import * as React from "react"
import { 
  Search, 
  Plus, 
  Trash2, 
  Clock, 
  Calculator, 
  Info, 
  UtensilsCrossed, 
  Filter, 
  Leaf, 
  Utensils, 
  Target,
  History,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  ShoppingBag
} from "lucide-react"
import { INDIAN_FOOD_DATABASE, FoodItem } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  addDocumentNonBlocking 
} from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Progress } from "@/components/ui/progress"

type MealCategory = "All" | "Breakfast" | "Lunch" | "Snacks" | "Dinner"

export default function LogMealPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [mounted, setMounted] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<MealCategory>("All")
  const [selectedItems, setSelectedItems] = React.useState<{ food: FoodItem, quantity: number }[]>([])
  
  // Modal states
  const [itemToPick, setItemToPick] = React.useState<FoodItem | null>(null)
  const [pickQuantity, setPickQuantity] = React.useState(1)
  const [isDailyDetailOpen, setIsDailyDetailOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // --- Real-time Data ---
  
  const userGoalRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return doc(db, "userProfiles", user.uid, "userGoal", "userGoal")
  }, [db, user?.uid])
  const { data: userGoal } = useDoc(userGoalRef)

  const mealLogsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return collection(db, "userProfiles", user.uid, "mealLogs")
  }, [db, user?.uid])
  
  const { data: allLogs } = useCollection(mealLogsQuery)

  const todayLogs = React.useMemo(() => {
    if (!allLogs || !mounted) return []
    const now = new Date()
    return allLogs.filter(log => {
      const logDate = new Date(log.loggedAt)
      return logDate.getDate() === now.getDate() &&
             logDate.getMonth() === now.getMonth() &&
             logDate.getFullYear() === now.getFullYear()
    })
  }, [allLogs, mounted])

  const todayTotals = React.useMemo(() => {
    return todayLogs.reduce((acc, log) => {
      const food = INDIAN_FOOD_DATABASE.find(f => f.id.toString() === log.foodId)
      if (!food) return acc
      return {
        calories: acc.calories + (food.calories * log.quantity),
        protein: acc.protein + (food.protein * log.quantity),
        carbs: acc.carbs + (food.carbs * log.quantity),
        fats: acc.fats + (food.fats * log.quantity),
      }
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 })
  }, [todayLogs])

  const currentPlateTotals = React.useMemo(() => {
    return selectedItems.reduce((acc, item) => ({
      calories: acc.calories + (item.food.calories * item.quantity),
      protein: acc.protein + (item.food.protein * item.quantity),
      carbs: acc.carbs + (item.food.carbs * item.quantity),
      fats: acc.fats + (item.food.fats * item.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
  }, [selectedItems])

  const totalCaloriesToday = todayTotals.calories + currentPlateTotals.calories
  
  const calorieTarget = userGoal?.targetCalories || 2000
  const proteinTarget = userGoal ? Math.round(userGoal.targetCalories * userGoal.targetProteinRatio / 4) : 100
  const carbsTarget = userGoal ? Math.round(userGoal.targetCalories * userGoal.targetCarbsRatio / 4) : 250
  const fatsTarget = userGoal ? Math.round(userGoal.targetCalories * userGoal.targetFatsRatio / 9) : 65

  // --- Helpers ---

  const formatServing = (serving: string) => {
    if (serving.toLowerCase().includes("bowl") && !serving.includes("(")) {
      return serving.replace(/bowl/i, "bowl (250g)")
    }
    return serving
  }

  const filteredFoods = INDIAN_FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase())
    if (selectedCategory === "All") return matchesSearch
    if (selectedCategory === "Breakfast") return matchesSearch && (food.category === "Breakfast" || food.category === "Bread")
    if (selectedCategory === "Snacks") return matchesSearch && (food.category === "Snack" || food.category === "Beverage")
    const isMainMeal = ["Main Course", "Lentils", "Rice", "Bread", "Side Dish"].includes(food.category)
    return matchesSearch && isMainMeal
  }).slice(0, 50) 

  const handleStartPick = (food: FoodItem) => {
    setItemToPick(food)
    setPickQuantity(1)
  }

  const handleConfirmPick = () => {
    if (!itemToPick) return
    setSelectedItems(prev => {
      const existing = prev.find(item => item.food.id === itemToPick.id)
      if (existing) {
        return prev.map(item => item.food.id === itemToPick.id ? { ...item, quantity: item.quantity + pickQuantity } : item)
      }
      return [...prev, { food: itemToPick, quantity: pickQuantity }]
    })
    
    toast({
      title: "Added to Plate",
      description: `${itemToPick.name} (${pickQuantity} servings) added. Click 'Log This Meal' to finalize.`,
    })
    
    setItemToPick(null)
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

  const handleSave = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to log meals." })
      return
    }

    const logsCol = collection(db, "userProfiles", user.uid, "mealLogs")
    selectedItems.forEach(item => {
      addDocumentNonBlocking(logsCol, {
        userId: user.uid,
        foodId: item.food.id.toString(),
        quantity: item.quantity,
        loggedAt: new Date().toISOString()
      })
    })

    toast({
      title: "Meal Logged",
      description: `Successfully added ${selectedItems.length} items to your history.`,
    })
    setSelectedItems([])
  }

  const categories: MealCategory[] = ["All", "Breakfast", "Lunch", "Snacks", "Dinner"]

  if (!mounted) return null

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Log Indian Meal</h1>
          <p className="text-muted-foreground text-sm md:text-lg">Track regional authenticity and nutritional balance.</p>
        </div>

        <button 
          onClick={() => setIsDailyDetailOpen(true)}
          className="group text-left bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-primary/50 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Target className="w-6 h-6 text-primary group-hover:text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Today's Total (Incl. Plate)</p>
            <p className="text-xl font-black">
              {Math.round(totalCaloriesToday)} <span className="text-xs text-muted-foreground">/ {calorieTarget} kcal</span>
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Left Side: Search & Food List */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="space-y-4 p-4 md:p-6">
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
                      "rounded-full px-4 h-9 font-bold transition-all active:scale-95",
                      selectedCategory === cat ? "shadow-md" : "border-border/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/50">
              <ScrollArea className="h-[400px] md:h-[600px]">
                <div className="divide-y divide-border/30">
                  {filteredFoods.map((food) => (
                    <div 
                      key={food.id} 
                      className="group flex items-center justify-between p-4 md:p-5 hover:bg-primary/5 transition-all cursor-pointer bg-card/50"
                      onClick={() => handleStartPick(food)}
                    >
                      <div className="flex flex-col gap-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            food.isVeg ? "bg-green-600" : "bg-red-600"
                          )} />
                          <span className="font-bold text-foreground text-sm md:text-base leading-tight group-hover:text-primary transition-colors">{food.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mt-1">
                          <Badge variant="outline" className="text-[8px] md:text-[9px] uppercase font-black tracking-widest py-0 px-2 bg-secondary/50 border-none">
                            {food.category}
                          </Badge>
                          <span className="text-[10px] md:text-xs text-muted-foreground font-medium italic">
                            Serving: {formatServing(food.servingSize)} • {food.calories} kcal
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="icon" className="shrink-0 h-10 w-10 group-hover:bg-primary group-hover:text-primary-foreground rounded-full shadow-sm transition-all active:scale-90">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Current Plate */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xl border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem] sticky top-8">
            <CardHeader className="border-b border-border/50 bg-secondary/10 py-5 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                  </div>
                  New Meal
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground font-black px-3 py-1 animate-in zoom-in duration-300">
                  {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedItems.length > 0 ? (
                <div className="space-y-6">
                  <ScrollArea className="max-h-[300px] pr-2">
                    <div className="space-y-4">
                      {selectedItems.map((item) => (
                        <div key={item.food.id} className="flex flex-col gap-3 group animate-in slide-in-from-right-4 duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm truncate max-w-[150px] md:max-w-[200px] leading-tight">{item.food.name}</span>
                              <div className="flex gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                                <span>{(item.food.calories * item.quantity).toFixed(0)} kcal</span>
                                <span>•</span>
                                <span className="text-primary font-bold">{item.quantity} servings</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center bg-secondary/30 rounded-lg p-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white/50 active:scale-90" onClick={() => handleUpdateQuantity(item.food.id, -0.5)}>-</Button>
                                <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white/50 active:scale-90" onClick={() => handleUpdateQuantity(item.food.id, 0.5)}>+</Button>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full active:scale-90" onClick={() => handleRemoveItem(item.food.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Separator className="bg-border/30" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 space-y-2 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Plate Calories</span>
                      <span className="text-2xl font-black text-primary">{Math.round(currentPlateTotals.calories)} <span className="text-[10px] uppercase">kcal</span></span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-white/50 rounded-lg py-2">
                        <span className="block text-[8px] font-black uppercase text-muted-foreground">Prot</span>
                        <span className="text-xs font-bold text-accent">{Math.round(currentPlateTotals.protein)}g</span>
                      </div>
                      <div className="text-center bg-white/50 rounded-lg py-2">
                        <span className="block text-[8px] font-black uppercase text-muted-foreground">Carb</span>
                        <span className="text-xs font-bold">{Math.round(currentPlateTotals.carbs)}g</span>
                      </div>
                      <div className="text-center bg-white/50 rounded-lg py-2">
                        <span className="block text-[8px] font-black uppercase text-muted-foreground">Fat</span>
                        <span className="text-xs font-bold">{Math.round(currentPlateTotals.fats)}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 opacity-10" />
                  </div>
                  <p className="font-bold text-sm">Select items to build your meal</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 px-6 pb-6">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-12 rounded-2xl text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={selectedItems.length === 0}
                onClick={handleSave}
              >
                Log This Meal
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Serving Picker Dialog */}
      <Dialog open={!!itemToPick} onOpenChange={(open) => !open && setItemToPick(null)}>
        <DialogContent className="sm:max-w-[400px] max-[400px]:w-[95%] rounded-[2rem] animate-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">{itemToPick?.name}</DialogTitle>
            <DialogDescription className="font-medium">
              Standard Serving: {itemToPick && formatServing(itemToPick.servingSize)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="flex items-center justify-center gap-8">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-3xl border-2 hover:bg-secondary/20 active:scale-90 transition-transform"
                onClick={() => setPickQuantity(prev => Math.max(0.5, prev - 0.5))}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <div className="text-center">
                <span className="text-5xl font-black text-primary">{pickQuantity}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Servings</p>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-3xl border-2 hover:bg-secondary/20 active:scale-90 transition-transform"
                onClick={() => setPickQuantity(prev => prev + 0.5)}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
            
            <div className="bg-secondary/10 p-4 rounded-2xl border border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Calories</span>
                  <span className="font-black">{(itemToPick?.calories || 0) * pickQuantity} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Protein</span>
                  <span className="font-black text-accent">{(itemToPick?.protein || 0) * pickQuantity}g</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.97]" 
              onClick={handleConfirmPick}
            >
              Add to Plate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Daily Details Dialog */}
      <Dialog open={isDailyDetailOpen} onOpenChange={setIsDailyDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem]">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-3xl font-black">Daily Nutrition Overview</DialogTitle>
            <DialogDescription className="font-medium">
              Status for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-8 pb-8">
            <div className="space-y-8">
              {/* Combined Progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Combined Progress (Logged + Plate)</span>
                  <span className="text-xl font-black">{Math.round(totalCaloriesToday)} / {calorieTarget} <span className="text-xs font-bold text-muted-foreground">kcal</span></span>
                </div>
                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${Math.min((todayTotals.calories / calorieTarget) * 100, 100)}%` }}
                  />
                  <div 
                    className="bg-accent h-full opacity-50 transition-all duration-500" 
                    style={{ width: `${Math.min((currentPlateTotals.calories / calorieTarget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Logged ({Math.round(todayTotals.calories)} kcal)</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent opacity-50" /> On Plate ({Math.round(currentPlateTotals.calories)} kcal)</span>
                </div>
              </div>

              {/* Macros Breakdown (Logged Only) */}
              <div className="grid grid-cols-3 gap-4">
                <MacroDetailCard 
                  label="Protein" 
                  current={todayTotals.protein} 
                  target={proteinTarget} 
                  unit="g" 
                  color="hsl(var(--accent))" 
                />
                <MacroDetailCard 
                  label="Carbs" 
                  current={todayTotals.carbs} 
                  target={carbsTarget} 
                  unit="g" 
                  color="hsl(var(--primary))" 
                />
                <MacroDetailCard 
                  label="Fats" 
                  current={todayTotals.fats} 
                  target={fatsTarget} 
                  unit="g" 
                  color="hsl(var(--foreground))" 
                />
              </div>

              {/* Current Plate Preview */}
              {selectedItems.length > 0 && (
                <div className="space-y-4 p-5 bg-accent/5 rounded-[2rem] border border-accent/10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Currently On Plate (Not Logged Yet)
                  </h3>
                  <div className="space-y-2">
                    {selectedItems.map((item) => (
                      <div key={item.food.id} className="flex justify-between items-center text-sm">
                        <span className="font-bold">{item.food.name} <span className="text-xs text-muted-foreground">({item.quantity} svg)</span></span>
                        <span className="font-black text-accent">{Math.round(item.food.calories * item.quantity)} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Meals Logged Today
                </h3>
                {todayLogs.length > 0 ? (
                  <div className="space-y-3">
                    {todayLogs.slice().reverse().map((log) => {
                      const food = INDIAN_FOOD_DATABASE.find(f => f.id.toString() === log.foodId)
                      return (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border/50">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{food?.name || "Unknown Dish"}</span>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                              {log.quantity} × {food ? formatServing(food.servingSize) : "serving"} • {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block font-black text-sm">{Math.round((food?.calories || 0) * log.quantity)} kcal</span>
                            <span className="text-[9px] font-bold text-accent uppercase">{Math.round((food?.protein || 0) * log.quantity)}g Protein</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="font-medium italic">No logged entries yet today.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-6 bg-secondary/20 border-t border-border/50 flex justify-end">
            <Button variant="ghost" className="font-bold active:scale-95" onClick={() => setIsDailyDetailOpen(false)}>Close Summary</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MacroDetailCard({ label, current, target, unit, color }: any) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0
  return (
    <div className="p-4 bg-card border border-border/50 rounded-2xl space-y-3 shadow-sm">
      <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black" style={{ color }}>{Math.round(current)}</span>
        <span className="text-[10px] font-bold text-muted-foreground">/ {Math.round(target)}{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500" 
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
