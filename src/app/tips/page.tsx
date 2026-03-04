"use client"

import * as React from "react"
import { Lightbulb, CheckCircle2, Leaf, Info, Utensils, Coffee, Droplets, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const ALL_TIPS = [
  {
    title: "The Protein Balance",
    content: "Indian vegetarian diets can be carb-heavy. Ensure you include a protein source like Dal, Paneer, or Soya in every meal to maintain muscle health.",
    icon: Utensils,
    color: "text-primary"
  },
  {
    title: "Fibre First",
    content: "Start your lunch and dinner with a bowl of salad or steamed greens. This helps control blood sugar spikes common after eating white rice or rotis.",
    icon: Leaf,
    color: "text-green-600"
  },
  {
    title: "Portion Control",
    content: "Use the Thali method: Half your plate should be vegetables, a quarter protein, and only a quarter grains (Rice or Roti).",
    icon: Info,
    color: "text-accent"
  },
  {
    title: "Healthy Fats",
    content: "While Ghee is healthy in moderation, be careful with deep-fried snacks. Prefer roasted Makhana or nuts for evening cravings.",
    icon: Lightbulb,
    color: "text-yellow-600"
  },
  {
    title: "Smart Hydration",
    content: "Swap sugary sodas for Nimbu Pani (without sugar) or Coconut water. They provide essential electrolytes for the Indian climate.",
    icon: Droplets,
    color: "text-blue-500"
  },
  {
    title: "Caffeine Logic",
    content: "Avoid drinking Chai or Coffee immediately after meals as they can inhibit the absorption of iron and other minerals from your food.",
    icon: Coffee,
    color: "text-amber-800"
  },
  {
    title: "Spice for Health",
    content: "Turmeric (Haldi) and Ginger contain powerful anti-inflammatory properties. Use them fresh in your daily cooking for better immunity.",
    icon: Heart,
    color: "text-red-500"
  },
  {
    title: "Fermented Benefits",
    content: "South Indian staples like Idli and Dosa are fermented, making them easier to digest and providing natural probiotics for gut health.",
    icon: Utensils,
    color: "text-emerald-600"
  }
]

export default function TipsPage() {
  const [randomTips, setRandomTips] = React.useState<typeof ALL_TIPS>([])

  React.useEffect(() => {
    // Shuffle and pick 4 tips to display
    const shuffled = [...ALL_TIPS].sort(() => 0.5 - Math.random())
    setRandomTips(shuffled.slice(0, 4))
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Nutrition Tips</h1>
        <p className="text-muted-foreground mt-2 text-lg">Essential guidance for a balanced Indian lifestyle, updated daily.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {randomTips.length > 0 ? (
          randomTips.map((tip, idx) => (
            <Card key={idx} className="shadow-sm border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center ${tip.color}`}>
                  <tip.icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{tip.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{tip.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          // Skeleton loaders
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-sm border-border/50 h-40 animate-pulse bg-secondary/10" />
          ))
        )}
      </div>

      <Card className="bg-primary/5 border-primary/20 rounded-[2rem] overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Daily Habit Hack</h3>
            <p className="text-muted-foreground">
              Drink a glass of warm water with lemon in the morning. It helps stimulate digestion and keeps you hydrated before you start tracking your first meal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
