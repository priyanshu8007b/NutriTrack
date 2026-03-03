"use client"

import * as React from "react"
import { Search, Plus, Trash2, Clock, Calculator, Info, UtensilsCrossed } from "lucide-react"
import { INDIAN_FOOD_DATABASE, FoodItem } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function LogMealPage() {
  const [search, setSearch] = React.useState("")
  const [selectedItems, setSelectedItems] = React.useState<{ food: FoodItem, quantity: number }[]>([])
  const { toast } = useToast()

  const filteredFoods = INDIAN_FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddItem = (food: FoodItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.food.id === food.id)
      if (existing) {
        return prev.map(item => 
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { food, quantity: 1 }]
    })
  }

  const handleRemoveItem = (id: number) => {
    setSelectedItems(prev => prev.filter(item => item.food.id !== id))
  }

  const handleUpdateQuantity = (id: number, delta: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.food.id === id) {
        const newQty = Math.max(0.5, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const totals = selectedItems.reduce((acc, item) => ({
    calories: acc.calories + (item.food.calories * item.quantity),
    protein: acc.protein + (item.food.protein * item.quantity),
    carbs: acc.carbs + (item.food.carbs * item.quantity),
    fats: acc.fats + (item.food.fats * item.quantity),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 })

  const handleSave = () => {
    toast({
      title: "Meal Logged Successfully",
      description: `Added ${selectedItems.length} items to your daily log.`,
    })
    setSelectedItems([])
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Log Indian Meal</h1>
        <p className="text-muted-foreground mt-1">Search our database or add custom items to your daily intake.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for Indian dishes (e.g., Paneer, Dosa...)" 
                  className="pl-10 h-12 bg-secondary/20 border-border/50 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-1 gap-3">
                  {filteredFoods.map((food) => (
                    <div 
                      key={food.id} 
                      className="group flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                      onClick={() => handleAddItem(food)}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{food.name}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2 bg-secondary/50">
                            {food.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{food.calories} kcal per serving</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="group-hover:bg-primary group-hover:text-primary-foreground rounded-full">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {filteredFoods.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No dishes found matching your search.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-primary/20 sticky top-8">
            <CardHeader className="border-b border-border/50 bg-secondary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Meal Summary
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground">
                  {selectedItems.length} Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedItems.length > 0 ? (
                <div className="space-y-6">
                  <ScrollArea className="max-h-[300px] pr-4">
                    <div className="space-y-4">
                      {selectedItems.map((item) => (
                        <div key={item.food.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm truncate max-w-[200px]">{item.food.name}</span>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 rounded-md"
                                onClick={() => handleUpdateQuantity(item.food.id, -0.5)}
                              >
                                -
                              </Button>
                              <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 rounded-md"
                                onClick={() => handleUpdateQuantity(item.food.id, 0.5)}
                              >
                                +
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive hover:bg-destructive/10 ml-2"
                                onClick={() => handleRemoveItem(item.food.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                            <span>{(item.food.calories * item.quantity).toFixed(0)} kcal</span>
                            <span>{(item.food.protein * item.quantity).toFixed(1)}g Protein</span>
                          </div>
                          <Separator className="mt-2" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="bg-secondary/20 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Total Calories</span>
                      <span className="text-2xl font-black text-primary">{totals.calories.toFixed(0)} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-card p-3 rounded-xl border border-border/50 text-center">
                        <span className="block text-xs text-muted-foreground uppercase font-bold mb-1">Protein</span>
                        <span className="font-black text-accent">{totals.protein.toFixed(1)}g</span>
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border/50 text-center">
                        <span className="block text-xs text-muted-foreground uppercase font-bold mb-1">Carbs</span>
                        <span className="font-black text-foreground">{totals.carbs.toFixed(1)}g</span>
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border/50 text-center">
                        <span className="block text-xs text-muted-foreground uppercase font-bold mb-1">Fats</span>
                        <span className="font-black text-foreground">{totals.fats.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 opacity-20" />
                  </div>
                  <div>
                    <p className="font-semibold">Your plate is empty</p>
                    <p className="text-xs">Add items from the database to start logging.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3 border-t border-border/50 pt-6">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
                disabled={selectedItems.length === 0}
                onClick={handleSave}
              >
                Save Meal Log
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6 flex gap-4">
              <Info className="w-5 h-5 text-accent shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-accent">Pro Tip</p>
                <p className="text-muted-foreground leading-snug mt-1">
                  Indian meals often have higher carbs. Try adding protein-rich sides like Curd or Dal to balance your macros.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
