
"use client"

import * as React from "react"
import { Target, Save, Info, RefreshCcw, Calculator as CalcIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DEFAULT_GOALS } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GoalsPage() {
  const [goals, setGoals] = React.useState(DEFAULT_GOALS)
  const { toast } = useToast()

  // Calculator State
  const [weight, setWeight] = React.useState("")
  const [height, setHeight] = React.useState("")
  const [age, setAge] = React.useState("")
  const [gender, setGender] = React.useState("male")
  const [activity, setActivity] = React.useState("1.2") // Multiplier

  const handleSave = () => {
    toast({
      title: "Goals Updated",
      description: "Your new nutritional targets have been saved successfully.",
    })
  }

  const handleReset = () => {
    setGoals(DEFAULT_GOALS)
    toast({
      title: "Goals Reset",
      description: "Targets returned to standard recommendations.",
    })
  }

  const calculateCalories = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseFloat(age)
    const act = parseFloat(activity)

    if (isNaN(w) || isNaN(h) || isNaN(a)) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter valid weight, height, and age.",
      })
      return
    }

    // Harris-Benedict Equation
    let bmr = 0
    if (gender === "male") {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a)
    }

    const tdee = Math.round(bmr * act)
    setGoals(prev => ({ ...prev, calories: tdee }))
    
    toast({
      title: "Calories Calculated",
      description: `Target set to ${tdee} kcal based on your metrics.`,
    })
  }

  // Energy Breakdown Calculation
  const totalCaloriesFromMacros = (goals.protein * 4) + (goals.carbs * 4) + (goals.fats * 9)
  const proteinPercent = totalCaloriesFromMacros > 0 ? ((goals.protein * 4) / totalCaloriesFromMacros) * 100 : 0
  const carbsPercent = totalCaloriesFromMacros > 0 ? ((goals.carbs * 4) / totalCaloriesFromMacros) * 100 : 0
  const fatsPercent = totalCaloriesFromMacros > 0 ? ((goals.fats * 9) / totalCaloriesFromMacros) * 100 : 0

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Calorie Target
              </CardTitle>
              <CardDescription>Set your daily energy expenditure goal</CardDescription>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-10 w-10">
                  <CalcIcon className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>TDEE Calculator</DialogTitle>
                  <DialogDescription>
                    Estimate your daily calorie needs based on your metrics and exercise routine.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gender" className="text-right">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight" className="text-right font-medium">Weight (kg)</Label>
                    <Input id="weight" type="number" placeholder="70" className="col-span-3" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="height" className="text-right font-medium">Height (cm)</Label>
                    <Input id="height" type="number" placeholder="175" className="col-span-3" value={height} onChange={(e) => setHeight(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right font-medium">Age</Label>
                    <Input id="age" type="number" placeholder="25" className="col-span-3" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity" className="text-right font-medium">Exercise</Label>
                    <Select value={activity} onValueChange={setActivity}>
                      <SelectTrigger className="col-span-3">
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
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={calculateCalories} className="w-full h-12 font-bold">Calculate & Apply</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="text-center py-8 bg-secondary/10 rounded-3xl border border-primary/10">
              <span className="text-6xl font-black text-primary">{goals.calories}</span>
              <span className="text-lg font-bold text-muted-foreground block mt-2">kcal / day</span>
            </div>
            <div className="space-y-4">
              <Slider 
                value={[goals.calories]} 
                min={1200} 
                max={4000} 
                step={50}
                onValueChange={([val]) => setGoals(prev => ({ ...prev, calories: val }))}
              />
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span>1200 kcal</span>
                <span>4000 kcal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Macro Distribution</CardTitle>
            <CardDescription>Customize your daily nutrient balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <MacroInput 
              label="Protein (g)" 
              value={goals.protein} 
              onChange={(val) => setGoals(prev => ({ ...prev, protein: val }))}
              color="primary"
            />
            <MacroInput 
              label="Carbohydrates (g)" 
              value={goals.carbs} 
              onChange={(val) => setGoals(prev => ({ ...prev, carbs: val }))}
              color="accent"
            />
            <MacroInput 
              label="Fats (g)" 
              value={goals.fats} 
              onChange={(val) => setGoals(prev => ({ ...prev, fats: val }))}
              color="foreground"
            />
            
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Energy Breakdown</span>
                <span>Total: {totalCaloriesFromMacros} kcal</span>
              </div>
              <div className="h-4 w-full bg-secondary/30 rounded-full flex overflow-hidden">
                <div style={{ width: `${proteinPercent}%` }} className="bg-primary h-full transition-all duration-500" />
                <div style={{ width: `${carbsPercent}%` }} className="bg-accent h-full transition-all duration-500" />
                <div style={{ width: `${fatsPercent}%` }} className="bg-foreground h-full opacity-60 transition-all duration-500" />
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> {proteinPercent.toFixed(0)}% Protein</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> {carbsPercent.toFixed(0)}% Carbs</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-foreground/60" /> {fatsPercent.toFixed(0)}% Fats</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex gap-4">
          <Info className="w-6 h-6 text-primary shrink-0" />
          <div className="space-y-2">
            <p className="font-black text-primary uppercase tracking-widest text-xs">A note from PaushtikPath</p>
            <p className="text-muted-foreground leading-relaxed">
              Calculations are based on the Harris-Benedict formula. These goals are estimates; for competitive training or medical conditions, we recommend consulting a certified nutritionist.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MacroInput({ label, value, onChange, color }: any) {
  const colorClass = color === "primary" ? "text-primary" : color === "accent" ? "text-accent" : "text-foreground"
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-sm font-bold text-foreground">{label}</label>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-black ${colorClass}`}>{value}</span>
          <span className="text-xs font-bold text-muted-foreground">g</span>
        </div>
      </div>
      <Slider 
        value={[value]} 
        min={20} 
        max={300} 
        step={5}
        onValueChange={([val]) => onChange(val)}
      />
    </div>
  )
}
