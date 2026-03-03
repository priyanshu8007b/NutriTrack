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
  Sparkles
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

const weeklyData = [
  { day: "Mon", calories: 1850 },
  { day: "Tue", calories: 2100 },
  { day: "Wed", calories: 1950 },
  { day: "Thu", calories: 1700 },
  { day: "Fri", calories: 2300 },
  { day: "Sat", calories: 2050 },
  { day: "Sun", calories: 1900 },
]

const macroData = [
  { name: "Protein", value: 30, color: "hsl(var(--primary))" },
  { name: "Carbs", value: 50, color: "hsl(var(--accent))" },
  { name: "Fats", value: 20, color: "hsl(var(--chart-3))" },
]

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const consumed = {
    calories: 1450,
    protein: 65,
    carbs: 180,
    fats: 42
  }

  if (!mounted) return null

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Namaste, Ananya!</h1>
          <p className="text-muted-foreground mt-1">Here's your nutritional overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
            <Link href="/database">Browse Foods</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
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
          current={consumed.calories} 
          target={DEFAULT_GOALS.calories} 
          unit="kcal" 
          icon={Flame}
          color="primary"
        />
        <SummaryCard 
          title="Protein" 
          current={consumed.protein} 
          target={DEFAULT_GOALS.protein} 
          unit="g" 
          icon={Dna}
          color="primary"
        />
        <SummaryCard 
          title="Carbs" 
          current={consumed.carbs} 
          target={DEFAULT_GOALS.carbs} 
          unit="g" 
          icon={Wheat}
          color="accent"
        />
        <SummaryCard 
          title="Fats" 
          current={consumed.fats} 
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
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'hsl(var(--card))'
                    }}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Macro Distribution</CardTitle>
            <CardDescription>Today's nutrient balance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 mt-6">
              {macroData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">{item.value}%</span>
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
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <h4 className="font-bold text-primary">Moong Dal Khichdi with Curd</h4>
              <p className="text-sm text-muted-foreground">
                You're high on fats but need protein. A light khichdi will provide high-quality protein while keeping calories in check.
              </p>
              <div className="flex gap-4 pt-2">
                <div className="text-xs">
                  <span className="block font-bold">320 kcal</span>
                  <span className="text-muted-foreground">Calories</span>
                </div>
                <div className="text-xs">
                  <span className="block font-bold text-accent">14g</span>
                  <span className="text-muted-foreground">Protein</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Meals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold">Paneer Tikka (4 pcs)</span>
                  <span className="text-xs text-muted-foreground">Lunch • 1:30 PM</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold">280 kcal</span>
                  <span className="text-xs text-muted-foreground text-primary font-medium">12g Protein</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold">Masala Omelette</span>
                  <span className="text-xs text-muted-foreground">Breakfast • 9:00 AM</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold">210 kcal</span>
                  <span className="text-xs text-muted-foreground text-primary font-medium">14g Protein</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-center border-t border-border/50">
               <Button asChild variant="link" className="text-primary">
                 <Link href="/log">View all activity</Link>
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
