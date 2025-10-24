# ARA Chat Platform

A sophisticated AI-powered chat platform with blockchain integration, real-time insights, and advanced user interface built with Next.js 15 and React 19.

## 🌟 Features

### Core Features
- 🤖 **Advanced AI Chat**: Intelligent conversations powered by LangChain and OpenAI
- 🔗 **Blockchain Integration**: Multi-chain wallet support with CrossToken SDK
- 📊 **AI Insights Dashboard**: Real-time analytics and data visualization
- 💰 **Token Management**: Create, trade, and manage tokens seamlessly
- 🎨 **Modern UI/UX**: Clean design with Tailwind CSS v4 and Radix UI
- 🌙 **Theme Support**: Dark/Light mode with smooth transitions
- 📱 **Responsive Design**: Optimized for all device sizes

### Advanced Features
- 🚀 **Real-time Updates**: Live data synchronization
- 🎭 **Rive Animations**: Interactive animations with Rive
- 📈 **Price Charts**: Real-time token price visualization with Recharts
- 🔐 **Secure Wallet Integration**: Multi-wallet support (MetaMask, WalletConnect, etc.)
- 🌐 **Multi-Network Support**: Ethereum, Polygon, BSC, and more
- 📝 **Chat Analytics**: Conversation insights and analytics
- 🎯 **Quick Actions**: One-click shortcuts for common tasks

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 (App Router)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: MynaUI Icons (custom icon system)
- **Animations**: Rive (@rive-app/react-canvas)

### Backend & APIs
- **AI/ML**: LangChain, OpenAI API
- **Database**: MongoDB
- **Blockchain**: Ethers.js, CrossToken SDK
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Recharts

### Development Tools
- **Testing**: Playwright
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Build System**: Next.js Turbopack (disabled for stability)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB instance
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/andrewkim-gif/agent_prj_chat.git
cd arachat
```

2. **Install dependencies**
```bash
cd app
npm install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env.local

# Configure your environment variables:
# - OPENAI_API_KEY=your_openai_api_key
# - MONGODB_URI=your_mongodb_connection_string
# - NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
- Development: [http://localhost:3009](http://localhost:3009)
- Production: [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
arachat/
├── app/                          # Next.js application
│   ├── src/
│   │   ├── app/                  # App router pages & API routes
│   │   │   ├── api/              # API endpoints
│   │   │   │   ├── chat/         # Chat API routes
│   │   │   │   ├── insight/      # Analytics API routes
│   │   │   │   └── crossscan/    # Blockchain API routes
│   │   │   ├── chat/             # Chat page
│   │   │   └── insights/         # Analytics dashboard
│   │   ├── components/           # React components
│   │   │   ├── ui/               # Base UI components
│   │   │   ├── chat/             # Chat-related components
│   │   │   ├── wallet/           # Wallet & blockchain components
│   │   │   ├── layout/           # Layout components
│   │   │   └── ai-insight/       # Analytics components
│   │   ├── lib/                  # Utility functions & services
│   │   ├── hooks/                # Custom React hooks
│   │   ├── stores/               # Zustand state stores
│   │   ├── providers/            # React context providers
│   │   ├── services/             # External service integrations
│   │   ├── types/                # TypeScript type definitions
│   │   └── config/               # Configuration files
│   ├── public/                   # Static assets
│   │   └── assets/               # Images, animations, icons
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── docs/                         # Documentation
├── package.json                  # Root package.json
└── README.md
```

## 🎯 Key Components

### Chat System
- **ChatInterface**: Main chat component with message handling
- **ChatSidebar**: Quick actions and conversation management
- **ChatHeader**: Status indicators and controls
- **MessageInput**: Advanced input with quick actions

### Blockchain Integration
- **WalletConnection**: Multi-wallet connection management
- **TokenPortfolio**: Token balance and portfolio display
- **TransactionHistory**: Transaction tracking and history
- **TokenSwap**: Token exchange functionality

### AI Insights
- **AIInsightMain**: Main analytics dashboard
- **AIInsightPanel**: Individual insight panels
- **Charts**: Various data visualization components

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server (port 3009)
npm run build:dev    # Build for development
npm run start:dev    # Start development build (port 3009)
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server (port 3001)
```

### Utilities
```bash
npm run lint         # Run ESLint
npm run clean        # Clean all build directories
npm run clean:dev    # Clean development build
npm run clean:prod   # Clean production build
```

## 🎨 Design System

### Icon System
- **Primary**: @mynaui/icons-react (required)
- **Forbidden**: lucide-react (use MynaUI alternatives)
- **Mapping**: Documented in `/app/CLAUDE.md`

### Color Scheme
- **Background**: bg-background, bg-card, bg-muted
- **Borders**: border-border
- **Primary**: bg-primary, text-primary
- **Accent**: bg-accent, text-accent

### Component Guidelines
- Clean, minimal design without complex gradients
- Consistent spacing using Tailwind CSS
- Accessible color contrasts
- Responsive design patterns

## 🌐 API Endpoints

### Chat APIs
- `POST /api/chat` - Send chat message
- `POST /api/chat/stream` - Streaming chat responses
- `POST /api/chat/collect` - Collect chat data

### Insights APIs
- `GET /api/insight/daily` - Daily analytics
- `GET /api/insight/metrics` - Performance metrics
- `GET /api/insight/trends` - Trend analysis
- `GET /api/insight/languages` - Language statistics

### Blockchain APIs
- `GET /api/crossscan/tokens` - Token data retrieval

### AI Insights
- `POST /api/ai-insights/generate` - Generate AI insights

## 🔐 Environment Variables

```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database
MONGODB_URI=your_mongodb_connection_string

# Blockchain
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CROSSTOKEN_API_KEY=your_crosstoken_api_key

# Application
NODE_ENV=development|production
NEXT_PUBLIC_APP_URL=your_app_url
```

## 📱 Features Deep Dive

### Chat System
- **Smart Responses**: Context-aware AI responses
- **Quick Actions**: Pre-defined shortcuts for common tasks
- **Message History**: Persistent conversation storage
- **Typing Indicators**: Real-time typing status
- **Rich Media**: Support for images, charts, and formatted content

### Blockchain Integration
- **Multi-Chain Support**: Ethereum, Polygon, BSC, Arbitrum
- **Wallet Management**: Connect multiple wallets simultaneously
- **Token Operations**: View, send, swap, and create tokens
- **Transaction Tracking**: Real-time transaction monitoring
- **Price Charts**: Live price data and historical charts

### Analytics Dashboard
- **Real-time Metrics**: Live performance indicators
- **Data Visualization**: Interactive charts and graphs
- **Trend Analysis**: Historical data analysis
- **Export Functionality**: Data export capabilities

## 🧪 Testing

### Test Structure
```bash
app/src/tests/              # Test files
├── wallet-integration-test.ts
├── TokenPriceChart.test.tsx
└── component-tests/
```

### Running Tests
```bash
npm run test                # Run all tests
npx playwright test        # Run Playwright tests
```

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **File Organization**: Feature-based component structure
- **Naming**: Descriptive, consistent naming conventions

### Performance
- **Build Optimization**: Separate dev/prod build directories
- **Asset Management**: Optimized image loading
- **Code Splitting**: Dynamic imports for large components
- **Caching**: Strategic caching for API responses

### Security
- **Environment Variables**: Secure API key management
- **Input Validation**: Sanitized user inputs
- **CORS**: Proper cross-origin resource sharing
- **Error Handling**: Graceful error management

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** the project's code style and guidelines
4. **Test** your changes thoroughly
5. **Commit** with descriptive messages
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Submit** a pull request

### Code Review Process
- All changes require review
- Tests must pass
- Documentation must be updated
- Follow established patterns

## 📚 Documentation

Detailed documentation available in `/docs/`:
- **Wallet Integration**: Complete wallet setup guide
- **API Documentation**: Endpoint specifications
- **Component Guide**: UI component usage
- **Design System**: Visual design guidelines

## 🎯 Roadmap

### Upcoming Features
- [ ] Multi-language support
- [ ] Voice chat integration
- [ ] Advanced analytics
- [ ] Mobile app development
- [ ] Enhanced blockchain features

### Performance Improvements
- [ ] Bundle size optimization
- [ ] SSR implementation
- [ ] Database query optimization
- [ ] CDN integration

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support and questions:
- **Issues**: GitHub Issues
- **Documentation**: `/docs` directory
- **Code Guidelines**: `/app/CLAUDE.md`

---

**Built with ❤️ using Next.js 15, React 19, and modern web technologies.**