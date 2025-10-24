// Mock Twitter feed data and real-time simulation
interface Tweet {
  id: string
  author: string
  handle: string
  content: string
  time: string
  avatar: string
  timestamp: Date
}

// Mock tweet templates for simulation
const tweetTemplates = {
  henrychang10000: [
    "The future of Web3 gaming is evolving rapidly! CrossToken is leading the charge with innovative solutions.",
    "Exciting developments in the CROSS ecosystem! New partnerships and integrations coming soon.",
    "Gaming tokens are showing strong momentum today. The GameFi revolution is just getting started!",
    "Cross-chain bridges are the backbone of DeFi interoperability. Building seamless experiences.",
    "Innovation in blockchain gaming requires both technical excellence and user-centric design.",
    "Market dynamics are shifting towards utility-driven tokens. Focus on real value creation.",
    "The convergence of gaming and DeFi creates unprecedented opportunities for players and developers."
  ],
  crossplay_xyz: [
    "New game tokens added to CROSSx DEX! Trading volume surging across the platform.",
    "Bridge functionality upgraded! Faster cross-chain transfers with lower fees.",
    "Community milestone reached: 10,000+ active traders on our platform!",
    "Weekly token spotlight: BNGO showing impressive growth and adoption.",
    "Platform update deployed: Enhanced UI/UX for mobile users.",
    "Trading analytics now available! Track your portfolio performance in real-time.",
    "Partnership announcement coming tomorrow! Major gaming studio integration.",
    "New liquidity pools launched with attractive APY rates for early providers.",
    "Security audit completed successfully. Your assets are safe with us.",
    "User-requested feature: Advanced order types now live on DEX!"
  ]
}

export class TwitterFeedManager {
  private static tweets: Tweet[] = []
  private static listeners: Array<(tweets: Tweet[]) => void> = []
  private static intervalId: NodeJS.Timeout | null = null

  static initialize() {
    // Initialize with some recent tweets
    this.tweets = [
      {
        id: '1',
        author: 'Henry Chang',
        handle: '@henrychang10000',
        content: 'Excited about the new CrossToken features rolling out! The gaming ecosystem is evolving rapidly.',
        time: '2m ago',
        avatar: '/api/placeholder/40/40',
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: '2',
        author: 'CrossPlay',
        handle: '@crossplay_xyz',
        content: 'New game tokens added to CROSSx DEX! Trading volume up 150% today.',
        time: '5m ago',
        avatar: '/api/placeholder/40/40',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '3',
        author: 'Henry Chang',
        handle: '@henrychang10000',
        content: 'The future of Web3 gaming is here. Bridge between chains seamlessly with CrossToken.',
        time: '12m ago',
        avatar: '/api/placeholder/40/40',
        timestamp: new Date(Date.now() - 12 * 60 * 1000)
      }
    ]

    // Start simulating real-time tweets
    this.startRealTimeSimulation()
  }

  static startRealTimeSimulation() {
    if (this.intervalId) return

    this.intervalId = setInterval(() => {
      this.addRandomTweet()
    }, 30000 + Math.random() * 60000) // Random interval between 30s - 90s
  }

  static stopRealTimeSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private static addRandomTweet() {
    const accounts = ['henrychang10000', 'crossplay_xyz']
    const randomAccount = accounts[Math.floor(Math.random() * accounts.length)]
    const templates = tweetTemplates[randomAccount as keyof typeof tweetTemplates]
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    const newTweet: Tweet = {
      id: Date.now().toString(),
      author: randomAccount === 'henrychang10000' ? 'Henry Chang' : 'CrossPlay',
      handle: `@${randomAccount}`,
      content: randomTemplate,
      time: 'now',
      avatar: '/api/placeholder/40/40',
      timestamp: new Date()
    }

    // Add to beginning of array (most recent first)
    this.tweets.unshift(newTweet)

    // Keep only last 20 tweets
    if (this.tweets.length > 20) {
      this.tweets = this.tweets.slice(0, 20)
    }

    // Update time strings for existing tweets
    this.updateTimeStrings()

    // Notify listeners
    this.notifyListeners()
  }

  private static updateTimeStrings() {
    const now = Date.now()
    this.tweets.forEach(tweet => {
      const diffMs = now - tweet.timestamp.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)

      if (diffMins < 1) {
        tweet.time = 'now'
      } else if (diffMins < 60) {
        tweet.time = `${diffMins}m ago`
      } else if (diffHours < 24) {
        tweet.time = `${diffHours}h ago`
      } else {
        tweet.time = `${Math.floor(diffHours / 24)}d ago`
      }
    })
  }

  static subscribe(callback: (tweets: Tweet[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.tweets]))
  }

  static getTweets(): Tweet[] {
    if (this.tweets.length === 0) {
      this.initialize()
    }
    return [...this.tweets]
  }

  static addManualTweet(content: string, author: 'henry' | 'crossplay' = 'henry') {
    const newTweet: Tweet = {
      id: Date.now().toString(),
      author: author === 'henry' ? 'Henry Chang' : 'CrossPlay',
      handle: author === 'henry' ? '@henrychang10000' : '@crossplay_xyz',
      content,
      time: 'now',
      avatar: '/api/placeholder/40/40',
      timestamp: new Date()
    }

    this.tweets.unshift(newTweet)
    this.updateTimeStrings()
    this.notifyListeners()
  }

  static getLatestTweetSummary(): string {
    if (this.tweets.length === 0) return 'No recent tweets'

    const latestTweet = this.tweets[0]
    return `Latest from ${latestTweet.author}: "${latestTweet.content.substring(0, 100)}${latestTweet.content.length > 100 ? '...' : ''}"`
  }
}