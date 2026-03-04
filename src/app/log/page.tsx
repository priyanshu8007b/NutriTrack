"use client"

import * as React from "react"
import { 
  Search, 
  Plus, 
  Trash2, 
  Info, 
  UtensilsCrossed, 
  Leaf, 
  Target,
  History,
  ChevronRight,
  ChevronLeft,
  ShoppingBag
} from "lucide-react"
import { INDIAN_FOOD_DATABASE, FoodItem } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
  addDocumentNonBlocking,
  setDocumentNonBlocking
} from "@/firebase"
import { collection, doc } from "firebase/firestore"

type MealCategory = "All" | "Breakfast" | "Lunch" | "Snacks" | "Dinner"

export default function LogMealPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [mounted, setMounted] = React.useState(false)
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null)
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<MealCategory>("All")
  const [selectedItems, setSelectedItems] = React.useState<{ food: FoodItem, quantity: number }[]>([])
  
  const [itemToPick, setItemToPick] = React.useState<FoodItem | null>(null)
  const [pickQuantity, setPickQuantity] = React.useState(1)
  const [isDailyDetailOpen, setIsDailyDetailOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setCurrentDate(new Date())
  }, [])

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return doc(db, "userProfiles", user.uid)
  }, [db, user?.uid])
  const { data: userProfile } = useDoc(userProfileRef)

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
    if (!allLogs || !currentDate) return []
    return allLogs.filter(log => {
      const logDate = new Date(log.loggedAt)
      return logDate.getDate() === currentDate.getDate() &&
             logDate.getMonth() === currentDate.getMonth() &&
             logDate.getFullYear() === currentDate.getFullYear()
    })
  }, [allLogs, currentDate])

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

  const handleVegToggle = (checked: boolean) => {
    if (!db || !user?.uid) return
    const ref = doc(db, "userProfiles", user.uid)
    setDocumentNonBlocking(ref, { 
      id: user.uid,
      isVegOnly: checked,
      email: user.email || (user.isAnonymous ? "guest" : "user"),
      createdAt: userProfile?.createdAt || new Date().toISOString()
    }, { merge: true })
  }

  const formatServing = (serving: string) => {
    if (serving.toLowerCase().includes("bowl") && !serving.includes("(")) {
      return serving.replace(/bowl/i, "bowl (250g)")
    }
    return serving
  }

  const filteredFoods = INDIAN_FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase())
    const matchesVeg = userProfile?.isVegOnly ? food.isVeg : true
    if (!matchesVeg || !matchesSearch) return false
    if (selectedCategory === "All") return true
    if (selectedCategory === "Breakfast") return food.category === "Breakfast" || food.category === "Bread"
    if (selectedCategory === "Snacks") return food.category === "Snack" || food.category === "Beverage"
    const isMainMeal = ["Main Course", "Lentils", "Rice", "Bread", "Side Dish"].includes(food.category)
    return isMainMeal
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
    toast({ title: "Added to Plate", description: `${itemToPick.name} added.` })
    setItemToPick(null)
  }

  const handleRemoveItem = (id: number) => setSelectedItems(prev => prev.filter(item => item.food.id !== id))

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
      toast({ variant: "destructive", title: "Authentication Required" })
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
    toast({ title: "Meal Logged", description: "Successfully added items to history." })
    setSelectedItems([])
  }

  const categories: MealCategory[] = ["All", "Breakfast", "Lunch", "Snacks", "Dinner"]

  if (!mounted || !currentDate) return null

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Log Indian Meal</h1>
          <p className="text-muted-foreground text-sm md:text-lg">Track regional authenticity and nutritional balance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Leaf className={cn("w-4 h-4", userProfile?.isVegOnly ? "text-green-600" : "text-muted-foreground")} />
              <Label htmlFor="veg-mode-log" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Veg Only</Label>
            </div>
            <Switch 
              id="veg-mode-log" 
              checked={userProfile?.isVegOnly || false} 
              onCheckedChange={handleVegToggle}
            />
          </div>

          <button 
            onClick={() => setIsDailyDetailOpen(true)}
            className="group text-left bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-primary/50 transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
              <Target className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Today's Total</p>
              <p className="text-xl font-black">{Math.round(totalCaloriesToday)} <span className="text-xs text-muted-foreground">/ {calorieTarget} kcal</span></p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="p-4 md:p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search over 1,000+ Indian dishes..." 
                  className="pl-10 h-12 bg-secondary/20 border-border/50"
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
                    className="rounded-full px-4 h-9 font-bold"
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
                      className="group flex items-center justify-between p-4 md:p-5 hover:bg-primary/5 transition-all cursor-pointer"
                      onClick={() => handleStartPick(food)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", food.isVeg ? "bg-green-600" : "bg-red-600")} />
                          <span className="font-bold text-foreground">{food.name}</span>
                        </div>
                        <div className="flex gap-3 items-center mt-1">
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest py-0 px-2">{food.category}</Badge>
                          <span className="text-[10px] text-muted-foreground font-medium">{food.calories} kcal • {formatServing(food.servingSize)}</span>
                        </div>
                      </div>
                      <Button variant="secondary" size="icon" className="h-10 w-10 group-hover:bg-primary group-hover:text-primary-foreground rounded-full">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="shadow-xl border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem] sticky top-8">
            <CardHeader className="border-b border-border/50 bg-secondary/10 py-5 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl font-black flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                  </div>
                  New Meal
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground font-black px-3 py-1">{selectedItems.length} Items</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedItems.length > 0 ? (
                <div className="space-y-6">
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-4">
                      {selectedItems.map((item) => (
                        <div key={item.food.id} className="flex flex-col gap-3 group">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm block">{item.food.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-black">{Math.round(item.food.calories * item.quantity)} kcal • {item.quantity} svg</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center bg-secondary/30 rounded-lg p-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.food.id, -0.5)}>-</Button>
                                <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.food.id, 0.5)}>+</Button>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(item.food.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                          <Separator className="bg-border/30" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground font-bold text-[10px] uppercase">Plate Calories</span>
                      <span className="text-2xl font-black text-primary">{Math.round(currentPlateTotals.calories)} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className="bg-white/50 py-1 rounded">P: {Math.round(currentPlateTotals.protein)}g</div>
                      <div className="bg-white/50 py-1 rounded">C: {Math.round(currentPlateTotals.carbs)}g</div>
                      <div className="bg-white/50 py-1 rounded">F: {Math.round(currentPlateTotals.fats)}g</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <UtensilsCrossed className="w-8 h-8 opacity-10 mb-2" />
                  <p className="font-bold text-sm">Select items to build your meal</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button className="w-full h-12 rounded-2xl font-black shadow-lg" disabled={selectedItems.length === 0} onClick={handleSave}>Log This Meal</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={!!itemToPick} onOpenChange={(open) => !open && setItemToPick(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{itemToPick?.name}</DialogTitle>
            <DialogDescription>Serving: {itemToPick && formatServing(itemToPick.servingSize)}</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="flex items-center justify-center gap-8">
              <Button variant="outline" size="icon" className="h-16 w-16 rounded-3xl" onClick={() => setPickQuantity(prev => Math.max(0.5, prev - 0.5))}><ChevronLeft className="w-8 h-8" /></Button>
              <div className="text-center"><span className="text-5xl font-black text-primary">{pickQuantity}</span><p className="text-[10px] font-black uppercase text-muted-foreground">Servings</p></div>
              <Button variant="outline" size="icon" className="h-16 w-16 rounded-3xl" onClick={() => setPickQuantity(prev => prev + 0.5)}><ChevronRight className="w-8 h-8" /></Button>
            </div>
          </div>
          <DialogFooter><Button className="w-full h-14 rounded-2xl font-black" onClick={handleConfirmPick}>Add to Plate</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDailyDetailOpen} onOpenChange={setIsDailyDetailOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 rounded-[2.5rem]">
          <DialogHeader className="p-8 pb-4"><DialogTitle className="text-3xl font-black">Daily Nutrition Overview</DialogTitle></DialogHeader>
          <ScrollArea className="px-8 pb-8 h-[500px]">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end"><span className="text-xs font-black uppercase text-muted-foreground">Progress</span><span className="text-xl font-black">{Math.round(totalCaloriesToday)} / {calorieTarget} kcal</span></div>
                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full transition-all" style={{ width: `${Math.min((todayTotals.calories / calorieTarget) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2"><History className="w-4 h-4" />Logged Today</h3>
                {todayLogs.length > 0 ? (
                  <div className="space-y-3">
                    {todayLogs.map((log) => {
                      const food = INDIAN_FOOD_DATABASE.find(f => f.id.toString() === log.foodId)
                      return (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border">
                          <div><span className="font-bold block">{food?.name}</span><span className="text-[10px] text-muted-foreground uppercase">{log.quantity} svg</span></div>
                          <div className="text-right"><span className="block font-black text-sm">{Math.round((food?.calories || 0) * log.quantity)} kcal</span></div>
                        </div>
                      )
                    })}
                  </div>
                ) : <p className="text-center text-muted-foreground italic py-8">No logged entries yet.</p>}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
