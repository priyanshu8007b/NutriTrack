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
  LogIn,
  Leaf
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DEFAULT_GOALS, FOOD_BY_ID } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  setDocumentNonBlocking
} from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function DashboardPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // --- Real-time Data Fetching ---

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

  // --- Actions ---

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

  // --- Data Processing (Optimized with O(1) Map) ---

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

  const macroData = React.useMemo(() => [
    { name: "Protein", value: todayTotals.protein, color: "hsl(var(--primary))" },
    { name: "Carbs", value: todayTotals.carbs, color: "hsl(var(--accent))" },
    { name: "Fats", value: todayTotals.fats, color: "hsl(var(--chart-3))" },
  ], [todayTotals])

  const totalMacros = todayTotals.protein + todayTotals.carbs + todayTotals.fats

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
            Sign in to NutriTrack to start logging your meals, setting nutritional goals, and getting AI-powered Indian dish suggestions.
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user?.displayName ? `Namaste, ${user.displayName.split(' ')[0]}!` : "Namaste!"}
          </h1>
          <p className="text-muted-foreground">Welcome to NutriTrack. Here's your overview for today.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border/50">
            <div className="flex items-center gap-2">
              <Leaf className={cn("w-4 h-4 transition-colors", userProfile?.isVegOnly ? "text-green-600" : "text-muted-foreground")} />
              <Label htmlFor="veg-mode" className="text-xs font-black uppercase tracking-widest cursor-pointer">Veg Only</Label>
            </div>
            <Switch 
              id="veg-mode" 
              checked={userProfile?.isVegOnly || false} 
              onCheckedChange={handleVegToggle}
            />
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
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Calories" 
          current={Math.round(todayTotals.calories)} 
          target={calorieTarget} 
          unit="kcal" 
          icon={Flame}
          color="primary"
        />
        <SummaryCard 
          title="Protein" 
          current={Math.round(todayTotals.protein)} 
          target={proteinTarget} 
          unit="g" 
          icon={Dna}
          color="primary"
        />
        <SummaryCard 
          title="Carbs" 
          current={Math.round(todayTotals.carbs)} 
          target={carbsTarget} 
          unit="g" 
          icon={Wheat}
          color="accent"
        />
        <SummaryCard 
          title="Fats" 
          current={Math.round(todayTotals.fats)} 
          target={fatsTarget} 
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
            {allLogs && allLogs.length > 0 ? (
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={processWeeklyData(allLogs)}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                     <YAxis hide />
                     <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                     />
                     <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border/50 rounded-xl">
                <div className="text-center p-6">
                  <p className="font-bold text-muted-foreground">No logs yet this week</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start logging meals to see your progress.</p>
                  <Button asChild variant="link" className="mt-2 text-primary p-0">
                    <Link href="/log">Log your first meal</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Macro Distribution</CardTitle>
            <CardDescription>Today's nutrient balance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
             {totalMacros > 0 ? (
               <div className="h-[250px] w-full">
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
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="w-full space-y-3 mt-4">
                  {macroData.map((macro) => (
                    <div key={macro.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
                        <span className="font-medium">{macro.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {Math.round((macro.value / totalMacros) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
               </div>
             ) : (
              <>
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
              </>
             )}
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
          <CardContent className="p-0 px-6 pb-6">
            {allLogs && allLogs.length > 0 ? (
              <div className="space-y-4">
                {allLogs.slice().reverse().slice(0, 3).map((log) => {
                  const food = FOOD_BY_ID.get(log.foodId)
                  return (
                    <div key={log.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{food?.name || "Unknown Dish"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <span className="font-black text-sm">{Math.round((food?.calories || 0) * log.quantity)} kcal</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm font-medium">No recent meals found.</p>
                <Button asChild variant="link" className="text-primary mt-1">
                  <Link href="/log">Add a meal now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function processWeeklyData(logs: any[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weekly = days.map(day => ({ day, calories: 0 }))
  
  const now = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(now.getDate() - 7)

  logs.forEach(log => {
    const logDate = new Date(log.loggedAt)
    if (logDate >= sevenDaysAgo) {
      const dayName = days[logDate.getDay()]
      const food = FOOD_BY_ID.get(log.foodId)
      if (food) {
        const dayObj = weekly.find(d => d.day === dayName)
        if (dayObj) dayObj.calories += Math.round(food.calories * log.quantity)
      }
    }
  })

  const todayIdx = now.getDay()
  return [...weekly.slice(todayIdx + 1), ...weekly.slice(0, todayIdx + 1)]
}

function SummaryCard({ title, current, target, unit, icon: Icon, color }: any) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  
  return (
    <Card className="shadow-sm border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10",
            color === "accent" && "bg-accent/10",
            color === "chart-3" && "bg-chart-3/10"
          )}>
            <Icon className={cn("w-5 h-5 text-primary", color === "accent" && "text-accent", color === "chart-3" && "text-chart-3")} />
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
