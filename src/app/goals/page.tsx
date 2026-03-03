"use client"

import * as React from "react"
import { Target, Save, Info, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DEFAULT_GOALS } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function GoalsPage() {
  const [goals, setGoals] = React.useState(DEFAULT_GOALS)
  const { toast } = useToast()

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
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Calorie Target
            </CardTitle>
            <CardDescription>Set your total daily energy expenditure goal</CardDescription>
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
            
            <div className="pt-4 border-t border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Energy Breakdown</span>
              </div>
              <div className="h-4 w-full bg-secondary/30 rounded-full flex overflow-hidden">
                <div style={{ width: '20%' }} className="bg-primary h-full" />
                <div style={{ width: '50%' }} className="bg-accent h-full" />
                <div style={{ width: '30%' }} className="bg-foreground h-full opacity-60" />
              </div>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Protein</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> Carbs</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-foreground/60" /> Fats</span>
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
              These goals are estimates. For competitive athletic training or medical conditions, we recommend consulting with a certified nutritionist to personalize your Indian diet plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MacroInput({ label, value, onChange, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-sm font-bold text-foreground">{label}</label>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-black text-${color}`}>{value}</span>
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