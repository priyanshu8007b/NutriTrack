"use client"

import * as React from "react"
import { Salad, ArrowRight, Sparkles, ShieldCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth, useUser, initiateAnonymousSignIn, initiateGoogleSignIn } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  React.useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const handleQuickSignIn = () => {
    initiateAnonymousSignIn(auth)
  }

  const handleGoogleSignIn = () => {
    initiateGoogleSignIn(auth, setIsGoogleLoading)
  }

  const isLoading = isUserLoading || isGoogleLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
            <Salad className="text-primary-foreground w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Nutri<span className="text-primary">Track</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Your journey to balanced Indian nutrition starts here.</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to track your meals and manage your health goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Button 
              className="w-full h-12 text-md font-bold bg-white text-foreground border border-border/50 hover:bg-secondary/20 shadow-sm flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              )}
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold">Or</span>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 group"
              onClick={handleQuickSignIn}
              disabled={isLoading}
            >
              <Sparkles className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              Quick Start (Guest)
              <ArrowRight className="ml-auto w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest py-2">
              <div className="h-px flex-1 bg-border/50" />
              <span>Core Features</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Personalized Indian Macro Targets
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Regional Nutritional Accuracy
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                1,000+ Verified Indian Food Items
              </li>
            </ul>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground px-8 leading-relaxed">
          By continuing, you agree to NutriTrack's terms of service and nutritional guidance policies.
        </p>
      </div>
    </div>
  )
}
