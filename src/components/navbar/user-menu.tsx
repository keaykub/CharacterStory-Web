// src/components/navbar/user-menu.tsx
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useUser, useClerk } from "@clerk/nextjs"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { LogOut, Settings, Menu, X, Coins } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import clsx from "clsx"

const routes = [
  { href: "/", label: "Home", requireAuth: false },
  { href: "/generate", label: "Generate", requireAuth: false },
  { href: "/pricing", label: "Pricing", requireAuth: false },
  { href: "/inventory", label: "My Creations", requireAuth: true },
]

export function UserMenu() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Mock credit data
  const userCredits = 96

  // Filter routes for mobile menu
  const visibleRoutes = routes.filter(route => 
    !route.requireAuth || (route.requireAuth && isSignedIn)
  )

  const handleSignOut = () => {
    signOut(() => router.push("/"))
  }

  if (!isSignedIn) {
    return (
      <>
        {/* Desktop: Login/Signup buttons */}
        <div className="hidden md:flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
              Sign up
            </Button>
          </SignUpButton>
        </div>

        {/* Mobile: Hamburger menu with navigation + auth */}
        <div className="md:hidden relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Mobile Menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu */}
              <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                <div className="py-2">
                  {/* Navigation Links */}
                  {visibleRoutes.map((route) => {
                    const isActive = pathname === route.href
                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          "block px-4 py-3 text-sm transition-colors",
                          isActive 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        {route.label}
                      </Link>
                    )
                  })}
                  
                  <div className="border-t border-border mt-2 pt-2">
                    {/* Login */}
                    <SignInButton mode="modal">
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      >
                        Login
                      </button>
                    </SignInButton>
                    
                    {/* Sign up */}
                    <SignUpButton mode="modal">
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      >
                        Sign up
                      </button>
                    </SignUpButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Desktop: User dropdown */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.imageUrl} 
                  alt={user?.fullName || "User"} 
                />
                <AvatarFallback className="bg-teal-500 text-white text-sm">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            <div className="flex flex-col space-y-1 p-2">
              {user?.fullName && (
                <p className="text-sm font-medium">{user.fullName}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link href="/account">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Hamburger menu with navigation + user actions */}
      <div className="md:hidden relative">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
              <div className="py-2">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium">{user?.fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>

                {/* Credits */}
                <Link 
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span>เครดิต: {userCredits}</span>
                </Link>

                {/* Navigation Links */}
                {visibleRoutes.map((route) => {
                  const isActive = pathname === route.href
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "block px-4 py-3 text-sm transition-colors",
                        isActive 
                          ? "bg-accent text-accent-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      {route.label}
                    </Link>
                  )
                })}
                
                <div className="border-t border-border mt-2 pt-2">
                  {/* Account */}
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account</span>
                  </Link>
                  
                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}