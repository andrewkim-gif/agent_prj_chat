"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"

const features = [
  {
    icon: "robot",
    title: "AI Expert Assistant",
    description: "ARA provides 24/7 assistance with complete understanding of the CrossToken ecosystem.",
    details: ["Real-time answers", "Personalized guides", "Multi-language support"]
  },
  {
    icon: "trending-up",
    title: "Real-time Market Data",
    description: "Provides real-time prices and market analysis for major tokens like CROSS, BNGO, MGT.",
    details: ["Live prices", "24h changes", "Volume analysis"]
  },
  {
    icon: "controller",
    title: "Gaming Token Expert",
    description: "Provides expert knowledge about Web3 gaming ecosystem and gaming tokens.",
    details: ["ZENY tokens", "MGT tokens", "Gaming NFTs"]
  },
  {
    icon: "arrow-up-down",
    title: "DEX & Bridge Guide",
    description: "Easy explanations for CrossToken DEX trading and cross-chain bridge usage.",
    details: ["Trading guide", "Bridge usage", "Fee optimization"]
  },
  {
    icon: "message",
    title: "Community Updates",
    description: "Stay updated with the latest news from official Twitter and community channels.",
    details: ["Live feeds", "Official announcements", "Community news"]
  },
  {
    icon: "shield",
    title: "Security-First Design",
    description: "Guides safe usage based on Web3 security best practices.",
    details: ["Wallet security", "Safe trading", "Scam prevention"]
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <ScrollAnimated animation="fade-up">
              <Badge variant="secondary" className="inline-flex items-center gap-2">
                <Icon name="zap" size={16} />
                Key Features
              </Badge>
            </ScrollAnimated>
            <ScrollAnimated animation="fade-up" delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything About the CrossToken Ecosystem
              </h2>
            </ScrollAnimated>
            <ScrollAnimated animation="fade-up" delay={200}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ARA Chat helps everyone from Web3 beginners to experts easily understand and utilize the CrossToken ecosystem.
              </p>
            </ScrollAnimated>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const iconName = feature.icon
              const delay = (index * 100) as 100 | 200 | 300 | 400 | 500
              const animations = ["bounce-in", "flip-in", "zoom-rotate", "elastic-in"] as const
              const animation = animations[index % 4]
              return (
                <ScrollAnimated
                  key={index}
                  animation={animation}
                  delay={delay}
                  threshold={0.1}
                >
                  <Card className="p-6 bg-card hover-lift border border-border">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                          <Icon name={iconName} size={24} className="text-secondary-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                      </div>

                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="space-y-2">
                        {feature.details.map((detail, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </ScrollAnimated>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}