"use client"

import * as React from "react"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  Target,
  Database,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { useAuth, useUser } from "@/firebase"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Log Meal", href: "/log", icon: UtensilsCrossed },
  { name: "AI Suggestions", href: "/suggestions", icon: Sparkles },
  { name: "My Goals", href: "/goals", icon: Target },
  { name: "Food Database", href: "/database", icon: Database },
]

export function AppSidebar() {
  const pathname = usePathname()
  const auth = useAuth()
  const { user } = useUser()

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("Logout failed", error)
    })
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || "?"
  const userName = user?.displayName || "Anonymous User"
  const userEmail = user?.email || "No email provided"

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="h-16 flex flex-row items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <UtensilsCrossed className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Paushtik<span className="text-primary">Path</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-6 rounded-lg transition-all",
                      pathname === item.href 
                        ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                        : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                      {pathname === item.href && (
                        <ChevronRight className="ml-auto w-4 h-4 opacity-70" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full flex items-center gap-3 px-4 py-6 hover:bg-secondary/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {userInitial}
              </div>
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="text-sm font-semibold truncate w-full">{userName}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{userEmail}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 px-4 py-4 rounded-lg mt-2 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
