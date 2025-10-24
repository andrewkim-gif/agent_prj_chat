#!/bin/bash

# E2E Test Setup Script
# Prepares the environment for running Playwright E2E tests

set -e

echo "🚀 Setting up E2E test environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    print_error "Node.js version $NODE_VERSION is not supported. Please use version $REQUIRED_VERSION or higher."
    exit 1
fi

print_status "Node.js version $NODE_VERSION is supported"

# Navigate to app directory
cd "$(dirname "$0")/../../../app"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci
fi

# Check if Playwright is installed
if ! npx playwright --version &> /dev/null; then
    print_status "Installing Playwright..."
    npm install @playwright/test
fi

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install

# Install system dependencies for browsers
if command -v apt-get &> /dev/null; then
    print_status "Installing system dependencies..."
    npx playwright install-deps
fi

# Create test results directory
mkdir -p ../test-results/{screenshots,videos,traces}
print_status "Created test results directories"

# Set up environment variables
if [ ! -f "../tests/e2e/.env.test" ]; then
    print_status "Creating test environment file..."
    cat > ../tests/e2e/.env.test << EOF
# E2E Test Environment Variables
TEST_ENV=development
TEST_BASE_URL=http://localhost:3009
TEST_TIMEOUT=30000
HEADLESS=true
SLOW_MO=0

# API Settings
MOCK_API=true
API_TIMEOUT=10000

# Database (if needed for integration tests)
MONGODB_URL=mongodb://localhost:27017/arachat-test

# Optional: Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
EOF
fi

# Verify application can start
print_status "Verifying application startup..."
timeout 60s npm run dev &
APP_PID=$!

# Wait for application to be ready
sleep 10

# Check if application is responding
if curl -f http://localhost:3009 > /dev/null 2>&1; then
    print_status "Application is running successfully"
else
    print_warning "Application may not be fully ready, but continuing with setup"
fi

# Kill the test application
kill $APP_PID 2>/dev/null || true

# Run a basic test to verify setup
print_status "Running setup verification test..."
npx playwright test --config=../playwright.config.ts --grep="setup" || {
    print_warning "Setup verification test failed, but environment is ready"
}

print_status "E2E test environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "  1. Start your application: npm run dev"
echo "  2. Run tests: npm run test:e2e"
echo "  3. Run tests in UI mode: npm run test:e2e:ui"
echo "  4. Generate test report: npm run test:e2e:report"
echo ""
echo "📁 Test files location: ../tests/e2e/specs/"
echo "🔧 Configuration file: ../playwright.config.ts"
echo "📊 Test results: ../test-results/"