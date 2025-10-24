/**
 * Cross Wallet Diagnostic Script
 * Run this in browser console to diagnose Cross Wallet extension detection issues
 */

console.log('🔍 Cross Wallet Diagnostic Starting...');

// Check all possible Cross Wallet objects
const crossWalletObjects = [
  'crossWallet',
  'cross',
  'Cross',
  'CrossWallet',
  'window.crossWallet',
  'window.cross',
  'window.Cross',
  'window.CrossWallet'
];

console.log('\n📦 Checking Cross Wallet Objects:');
crossWalletObjects.forEach(objName => {
  const obj = eval(`typeof window !== 'undefined' ? window.${objName.replace('window.', '')} : undefined`);
  console.log(`${objName}: ${obj ? '✅ Found' : '❌ Not Found'}`, obj ? typeof obj : '');

  if (obj) {
    console.log(`  - Properties:`, Object.keys(obj).slice(0, 5));
    if (typeof obj.request === 'function') {
      console.log(`  - Has request method: ✅`);
    }
  }
});

// Check window object keys for Cross-related objects
console.log('\n🔍 Scanning window for Cross-related objects:');
if (typeof window !== 'undefined') {
  const windowKeys = Object.keys(window);
  const crossKeys = windowKeys.filter(key =>
    key.toLowerCase().includes('cross') ||
    key.toLowerCase().includes('nexus')
  );

  console.log('Cross-related keys found:', crossKeys.length);
  crossKeys.forEach(key => {
    console.log(`  - ${key}: ${typeof window[key]}`);
  });
}

// Test actual Cross Wallet detection (same as SUPPORTED_WALLETS)
console.log('\n🎯 Testing Current Detection Logic:');
const isAvailableResult = typeof window !== 'undefined' && !!window.crossWallet;
console.log(`Current isAvailable() result: ${isAvailableResult ? '✅ Available' : '❌ Unavailable'}`);

// Enhanced detection test
console.log('\n🔍 Enhanced Detection Test:');
const enhancedDetection = () => {
  if (typeof window === 'undefined') return false;

  // Check multiple possible names
  const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet'];
  for (const name of possibleNames) {
    if (window[name] && typeof window[name].request === 'function') {
      console.log(`✅ Found working Cross Wallet at window.${name}`);
      return true;
    }
  }

  return false;
};

const enhancedResult = enhancedDetection();
console.log(`Enhanced detection result: ${enhancedResult ? '✅ Available' : '❌ Unavailable'}`);

// Test Cross Wallet methods if available
console.log('\n🧪 Testing Cross Wallet Methods:');
const testCrossWallet = async () => {
  const wallet = window.crossWallet || window.cross || window.Cross || window.CrossWallet;

  if (!wallet) {
    console.log('❌ No Cross Wallet object found');
    return;
  }

  console.log('✅ Cross Wallet object found:', typeof wallet);

  if (typeof wallet.request !== 'function') {
    console.log('❌ No request method found');
    return;
  }

  try {
    // Test eth_accounts (should not require user interaction if already connected)
    const accounts = await wallet.request({ method: 'eth_accounts' });
    console.log('✅ eth_accounts successful:', accounts?.length || 0, 'accounts');

    if (accounts && accounts.length > 0) {
      console.log('🎉 Cross Wallet is connected!');
    } else {
      console.log('⚠️ Cross Wallet found but no accounts (not connected)');
    }
  } catch (error) {
    console.log('⚠️ eth_accounts failed:', error.message);
  }

  try {
    // Test chainId
    const chainId = await wallet.request({ method: 'eth_chainId' });
    console.log('✅ eth_chainId successful:', chainId);
  } catch (error) {
    console.log('⚠️ eth_chainId failed:', error.message);
  }
};

testCrossWallet();

console.log('\n📋 Diagnostic Summary:');
console.log('1. Run this script in your browser console (not headless)');
console.log('2. Make sure Cross Wallet extension is installed and enabled');
console.log('3. Check if any Cross-related objects were found');
console.log('4. If found but not working, try refreshing the page');
console.log('5. If not found, reinstall Cross Wallet extension');

export {};