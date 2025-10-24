"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Icon } from "@/components/ui/icon"
import { RiveARALogo } from "@/components/ui/RiveARALogo"
import { useState } from "react"
import { useRouter } from 'next/navigation'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleChatClick = () => {
    router.push('/chat')
  }

  const handleAIInsightClick = () => {
    router.push('/content-insight')
  }

  const handleNavClick = (section: string) => {
    // Navigate to home page first, then scroll to section
    if (window.location.pathname !== '/') {
      router.push('/')
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    } else {
      // Already on home page, just scroll
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20 shadow-sm h-16" style={{
      boxShadow: '0 1px 3px oklch(0 0 0 / 0.1)'
    }}>
      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <div className="flex items-center">
            <div className="rounded-lg overflow-hidden flex items-center justify-center">
              <RiveARALogo width={65} height={65} className="w-full h-full "  />
            </div>
            <span className="text-2xl font-bold text-foreground">
              ARA
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavClick('features')}
            className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200 relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200 relative group"
          >
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5  bg-primary transition-all duration-200 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200 relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleChatClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer py-2 h-9 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md !px-6"
            >
              <Icon name="message" size={16} className="mr-2 brightness-0 invert" />
              Chat
            </Button>
            <Button
              onClick={handleAIInsightClick}
              variant="outline"
              className="border-primary/20 hover:bg-primary/10 text-foreground cursor-pointer py-2 h-9 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md !px-6"
            >
              <Icon name="chart-bar" size={16} className="mr-2" />
              AI Insight
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="menu" size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-6 mt-8">
                <button
                  onClick={() => {
                    handleNavClick('features')
                    setIsOpen(false)
                  }}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    handleNavClick('services')
                    setIsOpen(false)
                  }}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Services
                </button>
                <button
                  onClick={() => {
                    handleNavClick('about')
                    setIsOpen(false)
                  }}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  About
                </button>
                <Button
                  onClick={() => {
                    handleChatClick()
                    setIsOpen(false)
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground justify-start"
                >
                  <Icon name="message" size={16} className="mr-2 brightness-0 invert" />
                  Chat
                </Button>
                <Button
                  onClick={() => {
                    handleAIInsightClick()
                    setIsOpen(false)
                  }}
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/10 text-foreground justify-start"
                >
                  <Icon name="chart-bar" size={16} className="mr-2" />
                  AI Insight
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}