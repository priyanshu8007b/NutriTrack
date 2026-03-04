'use client';

import * as React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Dna, 
  Wheat, 
  Droplets,
  Plus,
  Loader2,
  RefreshCcw,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking
} from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { smartIndianMealSuggestion, SuggestionOutput } from '@/ai/flows/smart-indian-meal-suggestion';
import { FOOD_BY_ID, DEFAULT_GOALS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function SuggestionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SuggestionOutput | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user?.uid]);
  const { data: userProfile } = useDoc(userProfileRef);

  const userGoalRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'userProfiles', user.uid, 'userGoal', 'userGoal');
  }, [db, user?.uid]);
  const { data: userGoal } = useDoc(userGoalRef);

  const mealLogsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, 'userProfiles', user.uid, 'mealLogs');
  }, [db, user?.uid]);
  const { data: allLogs } = useCollection(mealLogsQuery);

  const todayTotals = React.useMemo(() => {
    if (!allLogs) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const now = new Date();
    const todayLogs = allLogs.filter(log => {
      const logDate = new Date(log.loggedAt);
      return logDate.toDateString() === now.toDateString();
    });

    return todayLogs.reduce((acc, log) => {
      const food = FOOD_BY_ID.get(log.foodId);
      if (!food) return acc;
      return {
        calories: acc.calories + (food.calories * log.quantity),
        protein: acc.protein + (food.protein * log.quantity),
        carbs: acc.carbs + (food.carbs * log.quantity),
        fats: acc.fats + (food.fats * log.quantity),
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [allLogs]);

  const generateSuggestions = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Auth Required',
            description: 'Please sign in to get personalized suggestions.',
        });
        return;
    }
    setIsLoading(true);
    try {
      const calorieTarget = userGoal?.targetCalories || DEFAULT_GOALS.calories;
      const proteinTarget = userGoal ? Math.round(userGoal.targetCalories * (userGoal.targetProteinRatio || 0.2) / 4) : DEFAULT_GOALS.protein;
      const carbsTarget = userGoal ? Math.round(userGoal.targetCalories * (userGoal.targetCarbsRatio || 0.5) / 4) : DEFAULT_GOALS.carbs;
      const fatsTarget = userGoal ? Math.round(userGoal.targetCalories * (userGoal.targetFatsRatio || 0.3) / 9) : DEFAULT_GOALS.fats;

      const res = await smartIndianMealSuggestion({
        targetCalories: calorieTarget,
        remainingCalories: Math.max(0, calorieTarget - todayTotals.calories),
        remainingProtein: Math.max(0, proteinTarget - todayTotals.protein),
        remainingCarbs: Math.max(0, carbsTarget - todayTotals.carbs),
        remainingFats: Math.max(0, fatsTarget - todayTotals.fats),
        isVegOnly: userProfile?.isVegOnly || false,
      });
      setSuggestions(res);
      toast({
          title: 'Suggestions Ready!',
          description: 'AI has analyzed your day and found the best matches.',
      });
    } catch (e: any) {
      console.error('AI Suggestion error:', e);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate suggestions. Ensure your Gemini API key is set.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLog = (suggestion: any) => {
    if (!user || !db) return;
    const colRef = collection(db, 'userProfiles', user.uid, 'mealLogs');
    addDocumentNonBlocking(colRef, {
      userId: user.uid,
      foodId: suggestion.foodId,
      quantity: suggestion.servings,
      loggedAt: new Date().toISOString()
    });
    toast({
      title: 'Added to Log',
      description: `${suggestion.name} added to your daily tracker.`,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Smart Suggestions
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Personalized Indian meals optimized for your macro goals.
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={generateSuggestions} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 h-14 px-8 font-black shadow-lg shadow-primary/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
          {suggestions ? "Refresh Recommendations" : "Generate Suggestions"}
        </Button>
      </header>

      {!suggestions && !isLoading && (
        <Card className="border-dashed border-2 border-border/50 bg-secondary/5 py-20">
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold">Ready to balance your macros?</h3>
              <p className="text-muted-foreground mt-2">
                Our AI analyzes your current logs and finds the perfect Indian dishes to hit your protein and calorie targets.
              </p>
            </div>
            <Button size="lg" onClick={generateSuggestions} className="mt-4 px-10 h-12 font-bold">
              Analyze My Day
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-[400px] border-border/50 bg-secondary/10" />
          ))}
        </div>
      )}

      {suggestions && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
            <div className="bg-primary rounded-xl p-2 mt-1">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Nutritionist Insight</p>
              <p className="text-foreground font-medium leading-relaxed">{suggestions.insight}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.suggestions.map((item, idx) => (
              <Card key={idx} className="group hover:border-primary/50 transition-all shadow-sm rounded-3xl overflow-hidden border-border/50">
                <CardHeader className="bg-secondary/20 pb-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest">
                      AI MATCH
                    </Badge>
                    <span className="text-xs font-black text-muted-foreground">
                      {item.servings} Servings
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black mt-2 leading-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <MacroMetric label="Protein" value={item.protein} icon={Dna} color="primary" />
                    <MacroMetric label="Calories" value={item.calories} icon={Flame} color="accent" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Carbs: {item.carbs}g</span>
                    <span>Fats: {item.fats}g</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                    "{item.reason}"
                  </p>
                </CardContent>
                <CardFooter className="bg-secondary/10 border-t border-border/30 p-4">
                  <Button 
                    className="w-full h-12 rounded-xl font-black gap-2 shadow-sm"
                    onClick={() => handleAddLog(item)}
                  >
                    <Plus className="w-4 h-4" />
                    Add to Plate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroMetric({ label, value, icon: Icon, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className={cn("w-3 h-3", color === 'primary' ? 'text-primary' : 'text-accent')} />
        <span className="text-[10px] font-black uppercase text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-black">{value}{label === 'Protein' ? 'g' : ' kcal'}</p>
    </div>
  );
}
