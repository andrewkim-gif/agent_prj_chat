"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Icon } from "@/components/ui/icon"
import { ScrollAnimated } from "@/components/ui/ScrollAnimated"
import { useRouter } from 'next/navigation'


const stats = [
  { label: "24/7 Support", value: "Non-stop", icon: "zap" },
  { label: "Multi-language", value: "Korean/English", icon: "globe" },
  { label: "Expertise", value: "Web3/DeFi", icon: "robot" },
  { label: "User Satisfaction", value: "99%+", icon: "heart" }
]

export function About() {
  const router = useRouter()

  return (
    <section id="about" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <ScrollAnimated animation="fade-up">
              <Badge variant="secondary" className="inline-flex items-center gap-2">
                <Icon name="users" size={16} />
                About ARA Chat
              </Badge>
            </ScrollAnimated>
            <ScrollAnimated animation="fade-up" delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Reliable Partner for CrossToken Ecosystem
              </h2>
            </ScrollAnimated>
            <ScrollAnimated animation="fade-up" delay={200}>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                ARA Chat is an AI assistant that makes the complex Web3 world simple.
                It perfectly understands all services in the CrossToken ecosystem and provides personalized guidance.
              </p>
            </ScrollAnimated>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <ScrollAnimated animation="fade-right" delay={100}>
              <Card className="p-8 bg-card hover-lift border border-border">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <Icon name="robot" size={24} className="text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Help everyone from Web3 beginners to experts easily understand and utilize the CrossToken ecosystem.
                    Make complex technology friendly and easy to understand, lowering the barriers to Web3 adoption.
                  </p>
                </div>
              </Card>
            </ScrollAnimated>

            <ScrollAnimated animation="fade-left" delay={200}>
              <Card className="p-8 bg-card hover-lift border border-border">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <Icon name="globe" size={24} className="text-secondary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create better user experiences through the convergence of AI technology and Web3.
                    Lead the growth of the Web3 ecosystem through real-time information and personalized services.
                  </p>
                </div>
              </Card>
            </ScrollAnimated>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const iconName = stat.icon
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
                  <Card className="p-6 text-center bg-card hover-lift border border-border">
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mx-auto">
                        <Icon name={iconName} size={20} className="text-secondary-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </Card>
                </ScrollAnimated>
              )
            })}
          </div>

          {/* Team */}
          <ScrollAnimated animation="fade-up" delay={200}>
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Meet ARA</h3>
                <p className="text-muted-foreground">AI Assistant specialized in CrossToken ecosystem</p>
              </div>

              <div className="flex justify-center">
                <Card className="p-8 max-w-md w-full text-center bg-card hover-lift border border-border">
                  <div className="space-y-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src="/ara.png" alt="ARA" />
                      <AvatarFallback>
                        <Icon name="robot" size={40} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-semibold">ARA</h4>
                      <p className="text-sm text-muted-foreground mb-2">AI Assistant</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Hello! I&apos;m ARA. I know everything about the CrossToken ecosystem.
                        From DEX trading to bridge usage, feel free to ask me anytime! 🤖✨
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </ScrollAnimated>

          {/* Technology */}


          {/* CTA */}
          <ScrollAnimated animation="fade-up" delay={300}>
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-bold">Start chatting with ARA now!</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                If you have any questions about the CrossToken ecosystem or need help with your Web3 journey,
                feel free to talk to ARA anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="hover-lift px-12 h-12 rounded-full shadow-md cursor-pointer !px-8"
                  onClick={() => router.push('/chat')}
                >
                  <Icon name="message" size={16} className="mr-2 brightness-0 invert" />
                  Chat with ARA
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="hover-lift px-8 h-12 rounded-full"
                  asChild
                >
                  <a
                    href="https://docs.crosstoken.io/docs/introduce"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View CrossToken Docs
                    <Icon name="external-link" size={16} />
                  </a>
                </Button>
              </div>
            </div>
          </ScrollAnimated>
        </div>
      </div>
    </section>
  )
}