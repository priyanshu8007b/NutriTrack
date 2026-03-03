"use client"

import * as React from "react"
import { 
  TrendingUp, 
  Flame, 
  Dna, 
  Wheat, 
  Droplets,
  Plus,
  ArrowRight,
  Sparkles,
  Utensils,
  LogIn
} from "lucide-react"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DEFAULT_GOALS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"

const weeklyData = [
  { day: "Mon", calories: 0 },
  { day: "Tue", calories: 0 },
  { day: "Wed", calories: 0 },
  { day: "Thu", calories: 0 },
  { day: "Fri", calories: 0 },
  { day: "Sat", calories: 0 },
  { day: "Sun", calories: 0 },
]

export default function DashboardPage() {
  const { user, isUserLoading } = useUser()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const consumed = user ? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  } : null

  const macroData = [
    { name: "Protein", value: 0, color: "hsl(var(--primary))" },
    { name: "Carbs", value: 0, color: "hsl(var(--accent))" },
    { name: "Fats", value: 0, color: "hsl(var(--chart-3))" },
  ]

  if (!mounted) return null

  if (!user && !isUserLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Utensils className="w-10 h-10 text-primary" />
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Track Your Indian Nutrition</h1>
          <p className="text-lg text-muted-foreground">
            Sign in to start logging your meals, setting nutritional goals, and getting AI-powered Indian dish suggestions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold px-8 h-14 text-lg">
              <Link href="/login">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In to Start
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 font-bold border-border/50">
              <Link href="/database">Explore Database</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user?.displayName ? `Namaste, ${user.displayName.split(' ')[0]}!` : "Namaste!"}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your nutritional overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-border/50 text-foreground hover:bg-primary/5">
            <Link href="/database">Browse Foods</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 font-bold">
            <Link href="/log">
              <Plus className="w-4 h-4 mr-2" />
              Log Meal
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Calories" 
          current={consumed?.calories || 0} 
          target={DEFAULT_GOALS.calories} 
          unit="kcal" 
          icon={Flame}
          color="primary"
        />
        <SummaryCard 
          title="Protein" 
          current={consumed?.protein || 0} 
          target={DEFAULT_GOALS.protein} 
          unit="g" 
          icon={Dna}
          color="primary"
        />
        <SummaryCard 
          title="Carbs" 
          current={consumed?.carbs || 0} 
          target={DEFAULT_GOALS.carbs} 
          unit="g" 
          icon={Wheat}
          color="accent"
        />
        <SummaryCard 
          title="Fats" 
          current={consumed?.fats || 0} 
          target={DEFAULT_GOALS.fats} 
          unit="g" 
          icon={Droplets}
          color="chart-3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-bold">Weekly Intake Trends</CardTitle>
              <CardDescription>Daily calorie consumption over the last 7 days</CardDescription>
            </div>
            <Tabs defaultValue="calories" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calories">Calories</TabsTrigger>
                <TabsTrigger value="macros">Macros</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border/50 rounded-xl">
              <div className="text-center p-6">
                <p className="font-bold text-muted-foreground">No logs yet this week</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Start logging meals to see your progress.</p>
                <Button asChild variant="link" className="mt-2 text-primary p-0">
                  <Link href="/log">Log your first meal</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Macro Distribution</CardTitle>
            <CardDescription>Today's nutrient balance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
             <div className="h-[200px] w-full flex items-center justify-center border-2 border-dashed border-border/50 rounded-full aspect-square max-w-[200px]">
               <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">No Data</span>
             </div>
            <div className="w-full space-y-3 mt-6">
              {["Protein", "Carbs", "Fats"].map((name) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="text-muted-foreground">0%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Smart Indian Suggestion
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                <Link href="/suggestions">
                  Full Tools <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-8 rounded-xl border border-dashed border-primary/20 bg-primary/5 text-center">
              <p className="text-sm font-bold text-primary italic">"Input your logs to get personalized suggestions based on your remaining macros."</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Meals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Utensils className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm font-medium">Your meal log is empty for today.</p>
              <Button asChild variant="link" className="text-primary mt-1">
                <Link href="/log">Add a meal now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({ title, current, target, unit, icon: Icon, color }: any) {
  const percentage = Math.min(Math.round((current / target) * 100), 100)
  
  return (
    <Card className="shadow-sm border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            `bg-${color}/10`
          )}>
            <Icon className={cn("w-5 h-5", `text-${color}`)} />
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full uppercase tracking-wider">
            {percentage}% Goal
          </span>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{current.toLocaleString()}</span>
            <span className="text-sm font-medium text-muted-foreground">/ {target.toLocaleString()} {unit}</span>
          </div>
        </div>
        <Progress 
          value={percentage} 
          className="h-2" 
        />
      </CardContent>
    </Card>
  )
}
