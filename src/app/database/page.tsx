"use client"

import * as React from "react"
import { Search, Info, Filter, ArrowUpRight, Leaf, Utensils } from "lucide-react"
import { INDIAN_FOOD_DATABASE } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DatabasePage() {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string | null>(null)
  const [dietType, setDietType] = React.useState<"all" | "veg" | "non-veg">("all")

  const categories = Array.from(new Set(INDIAN_FOOD_DATABASE.map(f => f.category)))

  const filtered = INDIAN_FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category ? food.category === category : true
    const matchesDiet = dietType === "all" ? true : (dietType === "veg" ? food.isVeg : !food.isVeg)
    return matchesSearch && matchesCategory && matchesDiet
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Comprehensive Indian Database</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
          Search over 500+ authentic Indian items with verified macro-nutrients and serving weights.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search Pan-India dishes... (e.g. Dosa, Rogan Josh, Momos)" 
            className="pl-10 h-12 bg-white border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-6 gap-2 border-border/50">
                <Filter className="w-4 h-4" />
                {category || "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setCategory(null)}>All Categories</DropdownMenuItem>
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setCategory(cat)}>{cat}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex bg-secondary/30 p-1 rounded-lg h-12">
            <Button 
              variant={dietType === "all" ? "default" : "ghost"} 
              size="sm" 
              className="px-4"
              onClick={() => setDietType("all")}
            >
              All
            </Button>
            <Button 
              variant={dietType === "veg" ? "default" : "ghost"} 
              size="sm" 
              className="px-4"
              onClick={() => setDietType("veg")}
            >
              <Leaf className="w-3 h-3 mr-1" /> Veg
            </Button>
            <Button 
              variant={dietType === "non-veg" ? "default" : "ghost"} 
              size="sm" 
              className="px-4"
              onClick={() => setDietType("non-veg")}
            >
              <Utensils className="w-3 h-3 mr-1" /> Non-Veg
            </Button>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground py-6 pl-8 w-[300px]">Food Name & Type</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground">Serving Size</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Calories</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Protein</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Carbs</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right pr-8">Fats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((food) => (
              <TableRow key={food.id} className="hover:bg-primary/5 group cursor-pointer transition-colors">
                <TableCell className="font-bold py-5 pl-8 text-foreground">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(food.isVeg ? "text-green-600" : "text-red-600")}>
                        {food.isVeg ? <Leaf className="w-3 h-3 fill-current" /> : <Utensils className="w-3 h-3" />}
                      </span>
                      <span className="group-hover:text-primary transition-colors">{food.name}</span>
                    </div>
                    <Badge variant="secondary" className="w-fit bg-secondary/50 font-bold uppercase text-[9px] tracking-tighter">
                      {food.category}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-medium italic">
                  {food.servingSize}
                </TableCell>
                <TableCell className="text-right font-black">{food.calories} kcal</TableCell>
                <TableCell className="text-right font-medium text-accent">{food.protein}g</TableCell>
                <TableCell className="text-right font-medium">{food.carbs}g</TableCell>
                <TableCell className="text-right font-medium pr-8">{food.fats}g</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-medium">
                  No matches found in our Pan-India database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 p-4 rounded-xl border border-border/50">
        <Info className="w-4 h-4 text-primary" />
        Values are based on standard preparation weights. Serving sizes vary by household and restaurant.
      </div>
    </div>
  )
}
