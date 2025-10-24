"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"

const services = [
  {
    icon: "credit-card",
    title: "CROSSx Wallet",
    description: "Multi-chain asset management with enhanced security Web3 wallet",
    features: [
      "CROSS Chain + BSC support",
      "Social login & biometric auth",
      "NFT collection management",
      "API/SDK developer tools"
    ],
    link: "https://x.crosstoken.io/",
    linkText: "Download CROSSx App"
  },
  {
    icon: "arrow-up-down",
    title: "CROSS GameToken DEX",
    description: "Specialized decentralized exchange for gaming tokens",
    features: [
      "ZENY, MGT, BNGO trading",
      "Real-time price tracking",
      "Limit/market orders",
      "Low trading fees"
    ],
    link: "https://x.crosstoken.io/en/dex",
    linkText: "Trade on DEX"
  },
  {
    icon: "arrow-up-down",
    title: "CROSS Bridge",
    description: "Safe cross-chain asset transfer service",
    features: [
      "BSC ⇄ CROSS Chain",
      "Free BSC → CROSS",
      "Low fees",
      "Fast transfer speed"
    ],
    link: "https://x.crosstoken.io/en/bridge",
    linkText: "Use Bridge"
  },
  {
    icon: "shopping-bag",
    title: "CROSS NFT Marketplace",
    description: "Dedicated marketplace for gaming NFTs",
    features: [
      "Ragnarok Monster NFT",
      "Pixel Heroes assets",
      "Rarity-based classification",
      "Secure trading system"
    ],
    link: "https://crossnft.io/",
    linkText: "Explore NFT Market"
  },
  {
    icon: "controller",
    title: "Integrated Games",
    description: "Web3 games integrated with CROSS ecosystem",
    features: [
      "Ragnarok: Monster World",
      "Pixel Heroes Adventure",
      "Everybody's Bingo",
      "More games coming soon"
    ],
    link: "https://docs.crosstoken.io/docs/introduce",
    linkText: "View Gaming Ecosystem"
  },
  {
    icon: "chart-bar",
    title: "Crossscan Explorer",
    description: "CROSS blockchain explorer",
    features: [
      "Transaction history lookup",
      "Balance verification",
      "Token tracking",
      "Complete transparency"
    ],
    link: "https://www.crossscan.io/",
    linkText: "Explore Blockchain"
  }
]

export function Services() {
  return (
    <section id="services" className="py-20 md:py-32 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <ScrollAnimated animation="fade-up">
              <Badge variant="secondary" className="inline-flex items-center gap-2">
                <Icon name="controller" size={16} />
                Ecosystem Services
              </Badge>
            </ScrollAnimated>
            <ScrollAnimated animation="fade-up" delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                CrossToken Ecosystem Services
              </h2>
            </ScrollAnimated>
            <ScrollAnimated animation="fade-up" delay={200}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience all services from the gaming-focused Web3 ecosystem on one platform.
              </p>
            </ScrollAnimated>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const iconName = service.icon
              const delay = (index * 100) as 100 | 200 | 300 | 400 | 500
              return (
                <ScrollAnimated
                  key={index}
                  animation="fade-up"
                  delay={delay}
                  threshold={0.1}
                >
                  <Card className="p-6 bg-card hover-lift border border-border group">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Icon name={iconName} size={24} className="text-secondary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {service.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      className="w-full hover-lift group-hover:border-primary/50 transition-colors"
                      asChild
                    >
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        {service.linkText}
                        <Icon name="external-link" size={16} />
                      </a>
                    </Button>
                  </div>
                  </Card>
                </ScrollAnimated>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <ScrollAnimated animation="fade-up" delay={300}>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Need more detailed information?
              </p>
              <Button size="lg" className="hover-lift px-8 h-12 rounded-full shadow-md">
                Ask ARA
              </Button>
            </div>
          </ScrollAnimated>
        </div>
      </div>
    </section>
  )
}