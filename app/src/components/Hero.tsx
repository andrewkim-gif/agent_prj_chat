"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()
  return (
    <section className="relative isolate py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <ScrollAnimated animation="fade-up">
                <Badge variant="secondary" className="inline-flex items-center gap-2 hover-lift">
                  <Icon name="sparkles" size={16} />
                  CrossToken Ecosystem AI Expert
                </Badge>
              </ScrollAnimated>

              <ScrollAnimated animation="fade-up" delay={100}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  ARA
                </h1>
              </ScrollAnimated>

              <ScrollAnimated animation="fade-up" delay={200}>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Your dedicated AI assistant with complete understanding of
                  the Web3 all-in-one super app <span className="text-primary font-semibold">CROSSx</span>
                </p>
              </ScrollAnimated>
            </div>

            <ScrollAnimated animation="fade-up" delay={300}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Real-time token prices and market analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Complete DEX trading and bridge guide</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Gaming token ecosystem expertise</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">Real-time community updates</span>
                </div>
              </div>
            </ScrollAnimated>

            <ScrollAnimated animation="fade-up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="hover-lift px-12 h-12 rounded-full shadow-md cursor-pointer !px-8"
                  onClick={() => router.push('/chat')}
                >
                  <Icon name="message" size={16} className="mr-2 brightness-0 invert " />
                  Start Chatting Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="hover-lift px-8 h-12 rounded-full cursor-pointer"
                  onClick={() => {
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  View Services Overview
                </Button>
              </div>
            </ScrollAnimated>
          </div>

          {/* Demo Card */}
          <ScrollAnimated animation="slide-up" delay={200}>
            <Card className="bg-card rounded-2xl overflow-hidden shadow-xl hover-lift p-6 border border-border">
              <div className="space-y-6">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/ara.png" alt="ARA" />
                    <AvatarFallback>
                      <Icon name="robot" size={24} />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">ARA</h3>
                    <p className="text-sm text-muted-foreground">CrossToken Ecosystem Expert</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    <Icon name="sparkles" size={12} className="mr-1" />
                    Online
                  </Badge>
                </div>

                {/* Sample Messages */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src="/ara.png" alt="ARA" />
                      <AvatarFallback>
                        <Icon name="robot" size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                      <p className="text-sm">
                        Hello! I&apos;m ARA, your CrossToken ecosystem specialist.
                        I can help with DEX trading, bridges, token info, and more! 🤖✨
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold">You</span>
                    </div>
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[85%]">
                      <p className="text-sm">What&apos;s the current BNGO token price?</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src="/ara.png" alt="ARA" />
                      <AvatarFallback>
                        <Icon name="robot" size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                      <p className="text-sm">
                        📊 <strong>BNGO Current Price</strong><br/>
                        💰 $2.45 (+12.5% 24h)<br/>
                        🎮 Gaming tokens are showing strong momentum!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      How to use DEX
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      Bridge Guide
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      Token Info
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollAnimated>
        </div>
      </div>
    </section>
  )
}