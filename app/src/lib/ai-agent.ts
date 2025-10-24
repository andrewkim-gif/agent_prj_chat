import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { crossTokenKnowledge } from "./crosstoken-knowledge"
import { VectorSearch } from "./vector-search"

// Initialize OpenAI model
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// Create ARA assistant prompt template
const araPromptTemplate = PromptTemplate.fromTemplate(`
You are ARA, an intelligent AI assistant specialized in the CrossToken ecosystem. You have comprehensive knowledge about:

🎮 **CrossToken Ecosystem:**
- CROSSx: All-in-one Web3 super app designed for gaming and DeFi
- CROSS GameToken DEX: Specialized decentralized exchange for gaming tokens (ZENY, MGT, BNGO)
- CROSS Bridge: Secure cross-chain asset transfer between BSC ⇄ CROSS Chain
- CROSS NFT Marketplace: Gaming NFTs including Ragnarok Monster NFT and Pixel Heroes
- Integrated Games: Ragnarok Monster World, Pixel Heroes Adventure, Everybody's Bingo
- Crossscan Explorer: CROSS blockchain explorer for transactions and balances

💰 **Token Information:**
- CROSS: Native ecosystem token
- BNGO: Gaming token with strong community
- ZENY: In-game currency token
- MGT: Gaming ecosystem utility token

🔧 **Technical Features:**
- Multi-chain support (CROSS Chain + BSC)
- Social login & biometric authentication
- Real-time price tracking and market analysis
- Low trading fees and fast transactions
- API/SDK for developers

**Your Personality:**
- Expert in Web3, DeFi, and gaming ecosystems
- Friendly, helpful, and professional
- Provide clear, actionable guidance
- Always respond in English
- Use appropriate emojis to enhance communication
- Focus specifically on CrossToken ecosystem

**Relevant Context:**
{relevantContext}

**Current Market Data:**
- BNGO: $2.45 (+12.5%) 📈
- CROSS: $0.89 (+8.2%) 📈
- ETH: $2,341 (-2.1%) 📉

**User Question:** {question}

**Instructions:**
- Always respond in English
- Provide detailed, helpful information about the CrossToken ecosystem
- If asked about topics outside CrossToken, politely redirect to ecosystem-related topics
- Include practical examples and step-by-step guidance when helpful
- Use markdown formatting for better readability
`)

// Create the chain
const chain = araPromptTemplate.pipe(model).pipe(new StringOutputParser())

// ARA Agent functions
export class ARAAgent {
  private static formatKnowledgeBase(): string {
    return JSON.stringify(crossTokenKnowledge, null, 2)
  }

  static async processMessage(message: string): Promise<string> {
    try {
      // Get relevant context using vector search
      const relevantContext = VectorSearch.getRelevantContext(message)

      const response = await chain.invoke({
        question: message,
        relevantContext: relevantContext
      })

      return response
    } catch (error) {
      console.error('ARA Agent error:', error)
      return "I apologize for the temporary error. Please try again with your CrossToken-related question! 🤖"
    }
  }

  static async generateQuickResponse(query: string): Promise<string> {
    // Quick responses for common queries
    const quickResponses: Record<string, string> = {
      "price": "📊 **Current Token Prices**\n\n🪙 **BNGO**: $2.45 (+12.5%)\n🔷 **CROSS**: $0.89 (+8.2%)\n💎 **ETH**: $2,341 (-2.1%)\n\nGaming tokens are showing strong momentum today! 📈",
      "bridge": "🌉 **CROSS Bridge Guide**\n\nSecurely transfer assets between BSC ⇄ CROSS Chain:\n1. Navigate to Bridge section\n2. Select source/destination chains\n3. Enter token and amount\n4. Confirm transaction fees\n5. Approve and execute transfer\n\n✨ Free BSC → CROSS transfers available!",
      "dex": "💹 **CROSS GameToken DEX Features**\n\n🎮 **Specialized gaming token exchange**\n- Market & Limit orders\n- Real-time price tracking\n- Low trading fees\n- Advanced order book\n\n**How to trade:**\n1. Connect your wallet\n2. Select token pair\n3. Choose order type\n4. Execute trade\n\nPerfect for trading ZENY, MGT, and BNGO tokens! 🚀",
      "wallet": "🔐 **CROSSx Wallet Support**\n\nMultiple connection options:\n- MetaMask integration\n- Native CROSSx wallet\n- Social login (Google, Apple)\n- Biometric authentication\n- Multi-chain asset management\n\nSecure and user-friendly for all experience levels! 💫"
    }

    const lowercaseQuery = query.toLowerCase()
    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowercaseQuery.includes(key)) {
        return response
      }
    }

    return await this.processMessage(query)
  }

  static getMarketData() {
    return crossTokenKnowledge.marketData
  }

  static getServices() {
    return crossTokenKnowledge.services
  }

  static getFAQ() {
    return crossTokenKnowledge.faq
  }
}