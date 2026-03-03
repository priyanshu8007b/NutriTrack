"use client"

import * as React from "react"
import { UtensilsCrossed, ArrowRight, Sparkles, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth, useUser, initiateAnonymousSignIn } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const handleQuickSignIn = () => {
    initiateAnonymousSignIn(auth)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
            <UtensilsCrossed className="text-primary-foreground w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Paushtik<span className="text-primary">Path</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Your journey to balanced Indian nutrition starts here.</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to track your meals and get AI suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Button 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 group"
              onClick={handleQuickSignIn}
              disabled={isUserLoading}
            >
              <Sparkles className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              Quick Start (Guest)
              <ArrowRight className="ml-auto w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest py-2">
              <div className="h-px flex-1 bg-border/50" />
              <span>Features Included</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Personalized Indian Macro Targets
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                AI-Powered Culturally Relevant Suggestions
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                1,000+ Dish Nutritional Database
              </li>
            </ul>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground px-8 leading-relaxed">
          By continuing, you agree to PaushtikPath's terms of service and nutritional guidance policies.
        </p>
      </div>
    </div>
  )
}
