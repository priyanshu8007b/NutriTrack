"use client"

import * as React from "react"
import { Search, Info, Filter, ArrowUpRight } from "lucide-react"
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

export default function DatabasePage() {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string | null>(null)

  const categories = Array.from(new Set(INDIAN_FOOD_DATABASE.map(f => f.category)))

  const filtered = INDIAN_FOOD_DATABASE.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category ? food.category === category : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Indian Food Database</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
          Explore over 1,000+ traditional and modern Indian dishes with verified macro-nutrient data.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search database... (e.g. Biryani, Samosa, Dal)" 
            className="pl-10 h-12 bg-white border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground py-6 pl-8">Food Name</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground">Category</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Calories</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Protein</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right">Carbs</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground text-right pr-8">Fats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((food) => (
              <TableRow key={food.id} className="hover:bg-primary/5 group cursor-pointer">
                <TableCell className="font-bold py-5 pl-8 text-foreground group-hover:text-primary transition-colors">
                  <div className="flex items-center gap-2">
                    {food.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-secondary/50 font-bold uppercase text-[9px] tracking-tighter">
                    {food.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-black">{food.calories} kcal</TableCell>
                <TableCell className="text-right font-medium text-accent">{food.protein}g</TableCell>
                <TableCell className="text-right font-medium">{food.carbs}g</TableCell>
                <TableCell className="text-right font-medium pr-8">{food.fats}g</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  No matches found in our traditional database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 p-4 rounded-xl">
        <Info className="w-4 h-4 text-primary" />
        Values are estimates based on standard Indian recipes. Individual preparation methods may vary.
      </div>
    </div>
  )
}