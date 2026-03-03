"use client"

import * as React from "react"
import { Sparkles, Loader2, ArrowRight, Info, CheckCircle2, Utensils } from "lucide-react"
import { smartIndianMealSuggestion, SmartIndianMealSuggestionOutput } from "@/ai/flows/smart-indian-meal-suggestion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEFAULT_GOALS } from "@/lib/mock-data"

export default function SuggestionsPage() {
  const [loading, setLoading] = React.useState(false)
  const [mealType, setMealType] = React.useState("Lunch")
  const [result, setResult] = React.useState<SmartIndianMealSuggestionOutput | null>(null)

  const handleSuggest = async () => {
    setLoading(true)
    try {
      // Current consumed mock state
      const consumed = {
        calories: 1200,
        protein: 45,
        carbs: 150,
        fats: 35
      }

      const output = await smartIndianMealSuggestion({
        dailyCalorieGoal: DEFAULT_GOALS.calories,
        dailyProteinGoal: DEFAULT_GOALS.protein,
        dailyCarbGoal: DEFAULT_GOALS.carbs,
        dailyFatGoal: DEFAULT_GOALS.fats,
        consumedCalories: consumed.calories,
        consumedProtein: consumed.protein,
        consumedCarbs: consumed.carbs,
        consumedFats: consumed.fats,
        currentMealType: mealType
      })
      setResult(output)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="text-primary w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primary">GenAI Powered</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Smart Indian Suggestions</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg">
            Our AI analyzes your remaining macros and suggests authentic Indian meals to help you hit your daily targets.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 shadow-sm border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Preferences</CardTitle>
            <CardDescription>Tailor your next meal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">What's your next meal?</label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="h-12 border-border/50 focus:ring-primary/20">
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20"
              onClick={handleSuggest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Get Smart Suggestion
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Utensils className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="max-w-xs">
                <p className="font-bold text-foreground">No suggestions yet</p>
                <p className="text-sm text-muted-foreground">Select a meal type and click generate to get AI-powered recommendations based on your current macros.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-foreground">Thinking in Spices...</p>
                <p className="text-sm text-muted-foreground">Calculating the perfect balance for your goals.</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Macro Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MacroStat label="Remaining" value={result.remainingMacros.calories} unit="kcal" color="primary" />
                    <MacroStat label="Protein" value={result.remainingMacros.protein} unit="g" color="accent" />
                    <MacroStat label="Carbs" value={result.remainingMacros.carbs} unit="g" color="foreground" />
                    <MacroStat label="Fats" value={result.remainingMacros.fats} unit="g" color="foreground" />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6">
                {result.mealSuggestions.map((suggestion, idx) => (
                  <Card key={idx} className="shadow-md border-border/50 hover:shadow-xl transition-all group overflow-hidden">
                    <div className="flex flex-col lg:flex-row h-full">
                      <div className="lg:w-1/3 bg-secondary/20 relative flex items-center justify-center p-8">
                        <Utensils className="w-16 h-16 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                        {suggestion.isCombination && (
                          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-black uppercase tracking-tighter text-[10px]">
                            Recommended Combo
                          </Badge>
                        )}
                      </div>
                      <div className="lg:w-2/3 p-6 lg:p-8 space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{suggestion.dishName}</h3>
                          <p className="text-muted-foreground mt-2 leading-relaxed">{suggestion.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-secondary/10 p-4 rounded-2xl">
                          <MacroValue label="Calories" value={suggestion.estimatedMacros.calories} unit="kcal" />
                          <MacroValue label="Protein" value={suggestion.estimatedMacros.protein} unit="g" />
                          <MacroValue label="Carbs" value={suggestion.estimatedMacros.carbs} unit="g" />
                          <MacroValue label="Fats" value={suggestion.estimatedMacros.fats} unit="g" />
                        </div>

                        <div className="flex gap-3">
                          <Button className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                            Log as {mealType}
                          </Button>
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
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black text-${color}`}>{value > 0 ? value : 0}</span>
        <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function MacroValue({ label, value, unit }: any) {
  return (
    <div className="text-center">
      <span className="block text-[10px] font-black uppercase tracking-tight text-muted-foreground mb-1">{label}</span>
      <span className="block font-black text-foreground">{value}{unit}</span>
    </div>
  )
}