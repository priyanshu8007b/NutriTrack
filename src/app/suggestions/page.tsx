"use client"

import * as React from "react"
import { Sparkles, Loader2, ArrowRight, Info, CheckCircle2, Utensils, Zap, Target } from "lucide-react"
import { smartIndianMealSuggestion, SmartIndianMealSuggestionOutput } from "@/ai/flows/smart-indian-meal-suggestion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEFAULT_GOALS, FOOD_BY_ID } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase 
} from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function SuggestionsPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [loading, setLoading] = React.useState(false)
  const [mealType, setMealType] = React.useState("Lunch")
  const [result, setResult] = React.useState<SmartIndianMealSuggestionOutput | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // --- Real-time Data ---

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

  const todayTotals = React.useMemo(() => {
    if (!allLogs || !mounted) return { calories: 0, protein: 0, carbs: 0, fats: 0 }
    const now = new Date()
    const todayLogs = allLogs.filter(log => {
      const logDate = new Date(log.loggedAt)
      return logDate.getDate() === now.getDate() &&
             logDate.getMonth() === now.getMonth() &&
             logDate.getFullYear() === now.getFullYear()
    })

    return todayLogs.reduce((acc, log) => {
      const food = FOOD_BY_ID.get(log.foodId)
      if (!food) return acc
      return {
        calories: acc.calories + (food.calories * log.quantity),
        protein: acc.protein + (food.protein * log.quantity),
        carbs: acc.carbs + (food.carbs * log.quantity),
        fats: acc.fats + (food.fats * log.quantity),
      }
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 })
  }, [allLogs, mounted])

  const calorieTarget = userGoal?.targetCalories || DEFAULT_GOALS.calories
  const proteinTarget = userGoal ? Math.round(userGoal.targetCalories * (userGoal.targetProteinRatio || 0.2) / 4) : DEFAULT_GOALS.protein
  const carbsTarget = userGoal ? Math.round(userGoal.targetCalories * (userGoal.targetCarbsRatio || 0.5) / 4) : DEFAULT_GOALS.carbs
  const fatsTarget = userGoal ? Math.round(userGoal.targetCalories * (userGoal.targetFatsRatio || 0.3) / 9) : DEFAULT_GOALS.fats

  const handleSuggest = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to get personalized meal suggestions.",
      })
      return
    }

    setLoading(true)
    setResult(null)
    
    try {
      const output = await smartIndianMealSuggestion({
        dailyCalorieGoal: calorieTarget,
        dailyProteinGoal: proteinTarget,
        dailyCarbGoal: carbsTarget,
        dailyFatGoal: fatsTarget,
        consumedCalories: todayTotals.calories || 0,
        consumedProtein: todayTotals.protein || 0,
        consumedCarbs: todayTotals.carbs || 0,
        consumedFats: todayTotals.fats || 0,
        isVegOnly: userProfile?.isVegOnly || false,
        currentMealType: mealType
      })
      setResult(output)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Suggestion failed",
        description: error.message || "Something went wrong while generating suggestions. Make sure you have set your goals and logged some meals today.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
            <Zap className="w-3 h-3 fill-primary" />
            GenAI Powered
          </Badge>
          {userProfile?.isVegOnly && (
            <Badge variant="outline" className="px-3 py-1 border-green-500/30 bg-green-50 text-green-700 font-black uppercase tracking-widest text-[10px]">
              Veg Only Enabled
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Smart Indian Suggestions
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            Our AI analyzes your real-time remaining macros to suggest authentic Indian meals.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xl border-border/50 bg-card/50 backdrop-blur-sm sticky top-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                Preferences
              </CardTitle>
              <CardDescription>Tailor your next authentic meal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground/80 uppercase tracking-tight">What's your next meal?</label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger className="h-12 border-border/50 bg-secondary/20 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 shadow-lg shadow-primary/30 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleSuggest}
                disabled={loading}
              >
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Spices...
                    </>
                  ) : (
                    <>
                      Get Smart Suggestion
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </div>
              </Button>
              
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    Suggestions consider your <strong>logged calories</strong> ({Math.round(todayTotals.calories)}) and <strong>macro balance</strong> for today.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <Target className="w-4 h-4" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                  <span>Calories</span>
                  <span>{Math.round(todayTotals.calories)} / {calorieTarget}</span>
                </div>
                <Progress value={(todayTotals.calories / calorieTarget) * 100} className="h-1" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="block text-[8px] font-black uppercase text-muted-foreground">Prot</span>
                  <span className="text-xs font-bold text-accent">{Math.round(todayTotals.protein)}g</span>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] font-black uppercase text-muted-foreground">Carb</span>
                  <span className="text-xs font-bold">{Math.round(todayTotals.carbs)}g</span>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] font-black uppercase text-muted-foreground">Fat</span>
                  <span className="text-xs font-bold">{Math.round(todayTotals.fats)}g</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-secondary/10 rounded-[2.5rem] border border-dashed border-border/50 px-8">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-lg transform -rotate-3">
                <Utensils className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div className="max-w-md space-y-2">
                <p className="text-2xl font-black text-foreground">Waiting for your request</p>
                <p className="text-muted-foreground font-medium">
                  Select a meal type on the left and click the button to see AI-powered recommendations based on your real-time nutrition data.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-[6px] border-primary/10 border-t-primary animate-spin" />
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-foreground tracking-tight">Balancing Macros...</p>
                <p className="text-muted-foreground font-medium animate-pulse">Our nutritionist AI is crafting your menu.</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fill-mode-both">
              <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 overflow-hidden shadow-sm">
                <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Target Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <MacroStat label="Remaining Cal" value={result.remainingMacros.calories} unit="kcal" color="primary" />
                    <MacroStat label="Target Protein" value={result.remainingMacros.protein} unit="g" color="accent" />
                    <MacroStat label="Target Carbs" value={result.remainingMacros.carbs} unit="g" color="foreground" />
                    <MacroStat label="Target Fats" value={result.remainingMacros.fats} unit="g" color="foreground" />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-8">
                {result.mealSuggestions.map((suggestion, idx) => (
                  <Card key={idx} className="group shadow-md hover:shadow-2xl border-border/50 transition-all duration-500 overflow-hidden rounded-[2rem]">
                    <div className="flex flex-col md:flex-row min-h-[300px]">
                      <div className="md:w-1/3 bg-secondary/30 relative flex items-center justify-center p-12 overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Utensils className="w-20 h-20 text-primary/20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 relative z-10" />
                        {suggestion.isCombination && (
                          <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <Badge className="bg-accent text-accent-foreground font-black uppercase tracking-tighter text-[10px] px-3 py-1 shadow-lg shadow-accent/20">
                              Balanced Combo
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-between space-y-8">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                              {suggestion.dishName}
                            </h3>
                            <div className="h-1 w-12 bg-primary rounded-full transform group-hover:w-24 transition-all duration-500" />
                          </div>
                          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                            {suggestion.description}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <MacroValue label="Calories" value={suggestion.estimatedMacros.calories} unit="kcal" highlight />
                          <MacroValue label="Protein" value={suggestion.estimatedMacros.protein} unit="g" />
                          <MacroValue label="Carbs" value={suggestion.estimatedMacros.carbs} unit="g" />
                          <MacroValue label="Fats" value={suggestion.estimatedMacros.fats} unit="g" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MacroStat({ label, value, unit, color }: any) {
  const isPositive = value > 0;
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn(
          "text-3xl font-black",
          color === "primary" ? "text-primary" : color === "accent" ? "text-accent" : "text-foreground"
        )}>
          {isPositive ? Math.round(value) : 0}
        </span>
        <span className="text-xs font-bold text-muted-foreground/60">{unit}</span>
      </div>
    </div>
  )
}

function MacroValue({ label, value, unit, highlight }: any) {
  return (
    <div className={cn(
      "text-center p-3 rounded-2xl border border-border/50 bg-secondary/5",
      highlight && "bg-primary/5 border-primary/20"
    )}>
      <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">{label}</span>
      <div className="flex items-baseline justify-center gap-0.5">
        <span className={cn("text-lg font-black", highlight ? "text-primary" : "text-foreground")}>{Math.round(value)}</span>
        <span className="text-[10px] font-bold text-muted-foreground/50">{unit}</span>
      </div>
    </div>
  )
}