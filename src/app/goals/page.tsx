"use client"

import * as React from "react"
import { Target, Save, RefreshCcw, Calculator as CalcIcon, ChevronRight, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DEFAULT_GOALS } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useMemoFirebase,
  setDocumentNonBlocking 
} from "@/firebase"
import { doc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function GoalsPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const router = useRouter()

  const [goals, setGoals] = React.useState(DEFAULT_GOALS)
  const [hasCalculated, setHasCalculated] = React.useState(false)

  // Calculator State
  const [metrics, setMetrics] = React.useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activity: "1.2"
  })

  // --- Firestore Sync ---
  
  const userGoalRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null
    return doc(db, "userProfiles", user.uid, "userGoal", "userGoal")
  }, [db, user?.uid])

  const { data: remoteGoal, isLoading: isGoalLoading } = useDoc(userGoalRef)

  // Initialize from Firestore if data exists
  React.useEffect(() => {
    if (remoteGoal) {
      setGoals({
        calories: remoteGoal.targetCalories,
        protein: Math.round(remoteGoal.targetCalories * remoteGoal.targetProteinRatio / 4),
        carbs: Math.round(remoteGoal.targetCalories * remoteGoal.targetCarbsRatio / 4),
        fats: Math.round(remoteGoal.targetCalories * remoteGoal.targetFatsRatio / 9),
      })
      setHasCalculated(true)
    }
  }, [remoteGoal])

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const handleSave = () => {
    if (!user || !db) return

    const totalCaloriesFromMacros = (goals.protein * 4) + (goals.carbs * 4) + (goals.fats * 9)
    
    const goalData = {
      id: "userGoal",
      userId: user.uid,
      targetCalories: goals.calories,
      targetProteinRatio: (goals.protein * 4) / totalCaloriesFromMacros,
      targetCarbsRatio: (goals.carbs * 4) / totalCaloriesFromMacros,
      targetFatsRatio: (goals.fats * 9) / totalCaloriesFromMacros,
      updatedAt: new Date().toISOString()
    }

    const docRef = doc(db, "userProfiles", user.uid, "userGoal", "userGoal")
    setDocumentNonBlocking(docRef, goalData, { merge: true })

    toast({
      title: "Goals Saved",
      description: "Your nutritional targets have been synced to your profile.",
    })
  }

  const handleReset = () => {
    setGoals(DEFAULT_GOALS)
    setHasCalculated(false)
    setMetrics({
      weight: "",
      height: "",
      age: "",
      gender: "male",
      activity: "1.2"
    })
    toast({
      title: "Goals Reset",
      description: "Targets returned to standard recommendations.",
    })
  }

  const calculateCalories = () => {
    const w = parseFloat(metrics.weight)
    const h = parseFloat(metrics.height)
    const a = parseFloat(metrics.age)
    const act = parseFloat(metrics.activity)

    if (isNaN(w) || isNaN(h) || isNaN(a)) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter valid weight, height, and age to calculate.",
      })
      return
    }

    // Harris-Benedict Equation
    let bmr = 0
    if (metrics.gender === "male") {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a)
    }

    const tdee = Math.round(bmr * act)
    setGoals(prev => ({ ...prev, calories: tdee }))
    setHasCalculated(true)
    
    toast({
      title: "Calculation Complete",
      description: `Target set to ${tdee} kcal based on your metrics.`,
    })
  }

  const totalCaloriesFromMacros = (goals.protein * 4) + (goals.carbs * 4) + (goals.fats * 9)
  const proteinPercent = totalCaloriesFromMacros > 0 ? ((goals.protein * 4) / totalCaloriesFromMacros) * 100 : 0
  const carbsPercent = totalCaloriesFromMacros > 0 ? ((goals.carbs * 4) / totalCaloriesFromMacros) * 100 : 0
  const fatsPercent = totalCaloriesFromMacros > 0 ? ((goals.fats * 9) / totalCaloriesFromMacros) * 100 : 0

  if (isUserLoading || isGoalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Nutritional Goals</h1>
          <p className="text-muted-foreground mt-2 text-lg">Define your daily calorie and macro-nutrient targets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} className="h-11">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 h-11 px-8 shadow-lg shadow-primary/20">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-7 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalcIcon className="w-6 h-6 text-primary" />
              </div>
              Step 1: Calculate Your Needs
            </CardTitle>
            <CardDescription>Enter your metrics to determine your ideal daily intake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gender</Label>
                <Select value={metrics.gender} onValueChange={(val) => setMetrics(prev => ({ ...prev, gender: val }))}>
                  <SelectTrigger className="h-12 bg-secondary/10 border-none">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Age (years)</Label>
                <Input 
                  type="number" 
                  placeholder="25" 
                  className="h-12 bg-secondary/10 border-none"
                  value={metrics.age} 
                  onChange={(e) => setMetrics(prev => ({ ...prev, age: e.target.value }))} 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Weight (kg)</Label>
                <Input 
                  type="number" 
                  placeholder="70" 
                  className="h-12 bg-secondary/10 border-none"
                  value={metrics.weight} 
                  onChange={(e) => setMetrics(prev => ({ ...prev, weight: e.target.value }))} 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Height (cm)</Label>
                <Input 
                  type="number" 
                  placeholder="175" 
                  className="h-12 bg-secondary/10 border-none"
                  value={metrics.height} 
                  onChange={(e) => setMetrics(prev => ({ ...prev, height: e.target.value }))} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Activity Level</Label>
              <Select value={metrics.activity} onValueChange={(val) => setMetrics(prev => ({ ...prev, activity: val }))}>
                <SelectTrigger className="h-12 bg-secondary/10 border-none">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.2">Sedentary (No Exercise)</SelectItem>
                  <SelectItem value="1.375">Light (1-2 days/week)</SelectItem>
                  <SelectItem value="1.55">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="1.725">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="1.9">Extra Active (Hard physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calculateCalories} className="w-full h-14 text-lg font-bold group">
              Calculate Daily Calories
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {hasCalculated && (
              <div className="pt-8 border-t border-dashed border-border/50 animate-in fade-in slide-in-from-top-4">
                <div className="text-center py-8 bg-primary/5 rounded-3xl border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-2 right-4 flex items-center gap-1">
                    <Target className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-primary">Target Calculated</span>
                  </div>
                  <span className="text-6xl font-black text-primary">{goals.calories}</span>
                  <span className="text-lg font-bold text-muted-foreground block mt-2">kcal / day</span>
                </div>
                
                <div className="mt-8 space-y-4 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fine-tune Target</Label>
                    <span className="text-sm font-bold">{goals.calories} kcal</span>
                  </div>
                  <Slider 
                    value={[goals.calories]} 
                    min={1200} 
                    max={4000} 
                    step={50}
                    onValueChange={([val]) => setGoals(prev => ({ ...prev, calories: val }))}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-8">
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="bg-secondary/10 pb-6">
              <CardTitle className="text-xl font-bold">Step 2: Macro Balance</CardTitle>
              <CardDescription>Adjust your daily nutrient distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <MacroInput 
                label="Protein (g)" 
                value={goals.protein} 
                onChange={(val: number) => setGoals(prev => ({ ...prev, protein: val }))}
                color="primary"
                desc="Building blocks for muscle"
              />
              <MacroInput 
                label="Carbohydrates (g)" 
                value={goals.carbs} 
                onChange={(val: number) => setGoals(prev => ({ ...prev, carbs: val }))}
                color="accent"
                desc="Primary energy source"
              />
              <MacroInput 
                label="Fats (g)" 
                value={goals.fats} 
                onChange={(val: number) => setGoals(prev => ({ ...prev, fats: val }))}
                color="foreground"
                desc="Hormonal & brain health"
              />
              
              <div className="pt-8 border-t border-border/50 space-y-4">
                <div className="flex justify-between items-end text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <span>Energy Breakdown</span>
                  <span className="text-foreground text-sm">{totalCaloriesFromMacros} / {goals.calories} kcal</span>
                </div>
                <div className="h-4 w-full bg-secondary/30 rounded-full flex overflow-hidden">
                  <div style={{ width: `${proteinPercent}%` }} className="bg-primary h-full transition-all duration-500" />
                  <div style={{ width: `${carbsPercent}%` }} className="bg-accent h-full transition-all duration-500" />
                  <div style={{ width: `${fatsPercent}%` }} className="bg-foreground h-full opacity-60 transition-all duration-500" />
                </div>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> {proteinPercent.toFixed(0)}% Protein</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> {carbsPercent.toFixed(0)}% Carbs</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-foreground/60" /> {fatsPercent.toFixed(0)}% Fats</span>
                </div>

                {totalCaloriesFromMacros > goals.calories && (
                  <div className="p-3 bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-tight rounded-lg flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Warning: Macro total exceeds calorie target.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MacroInput({ label, value, onChange, color, desc }: any) {
  const colorClass = color === "primary" ? "text-primary" : color === "accent" ? "text-accent" : "text-foreground"
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <label className="text-sm font-black text-foreground uppercase tracking-tight">{label}</label>
          <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-black ${colorClass}`}>{value}</span>
          <span className="text-xs font-bold text-muted-foreground">g</span>
        </div>
      </div>
      <Slider 
        value={[value]} 
        min={10} 
        max={400} 
        step={5}
        onValueChange={([val]) => onChange(val)}
      />
    </div>
  )
}
