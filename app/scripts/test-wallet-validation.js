// Simple validation test script for wallet addresses
// This tests the core validation logic used in the wallet integration

function isValidAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check if address starts with 0x and has exactly 40 hex characters
  const hexPattern = /^0x[a-fA-F0-9]{40}$/;
  return hexPattern.test(address);
}

// Test cases
const testCases = [
  {
    address: '0x742d35Cc6634C0532925a3b8D564123456789abc',
    expected: true,
    name: 'Valid address'
  },
  {
    address: 'invalid-address',
    expected: false,
    name: 'Invalid address'
  },
  {
    address: '',
    expected: false,
    name: 'Empty address'
  },
  {
    address: '742d35Cc6634C0532925a3b8D564123456789abc',
    expected: false,
    name: 'Missing 0x prefix'
  },
  {
    address: '0x742d35Cc6634C0532925a3b8D564',
    expected: false,
    name: 'Too short'
  },
  {
    address: '0x742d35Cc6634C0532925a3b8D564123456789abcdef',
    expected: false,
    name: 'Too long'
  },
  {
    address: '0x742d35Cc6634C0532925a3b8D564123456789ABC',
    expected: true,
    name: 'Valid with uppercase'
  },
  {
    address: '0xG42d35Cc6634C0532925a3b8D564123456789abc',
    expected: false,
    name: 'Invalid hex character'
  }
];

console.log('🧪 Testing Wallet Address Validation');
console.log('=====================================');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = isValidAddress(test.address);
  const status = result === test.expected ? '✅ PASS' : '❌ FAIL';

  if (result === test.expected) {
    passed++;
  } else {
    failed++;
  }

  console.log(`${index + 1}. ${test.name}: ${status}`);
  if (result !== test.expected) {
    console.log(`   Expected: ${test.expected}, Got: ${result}`);
    console.log(`   Address: "${test.address}"`);
  }
});

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All validation tests passed!');
} else {
  console.log('\n⚠️  Some tests failed. Please check the validation logic.');
}

console.log('\n📋 Manual Testing Instructions:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3002 in your browser');
console.log('3. Check the left sidebar for the wallet section');
console.log('4. Try connecting with address: 0x742d35Cc6634C0532925a3b8D564123456789abc');
console.log('5. Test invalid addresses to see error messages');
console.log('6. Verify wallet-specific quick actions appear when connected');
console.log('\n⚠️  Note: API calls require NEXT_PUBLIC_CROSSSCAN_API_KEY in .env.local');