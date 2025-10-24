// Cross Wallet Testnet Debug Script
console.log('🔍 Cross Wallet Testnet Debug Script');

// Check if window.cross exists
if (typeof window !== 'undefined' && window.cross) {
  console.log('✅ window.cross is available');

  // Test chainId detection
  window.cross.getChainId().then(chainId => {
    console.log(`📊 Current chainId: ${chainId}`);

    // Test mainnet token list
    console.log('🌐 Testing mainnet (chainId: 4157)...');
    return window.cross.getTokenList({ chainId: 4157 });
  }).then(mainnetTokens => {
    console.log(`📋 Mainnet tokens (4157): ${mainnetTokens.length} found`);
    console.log('Sample mainnet tokens:', mainnetTokens.slice(0, 3));

    // Test testnet token list
    console.log('🧪 Testing testnet (chainId: 4158)...');
    return window.cross.getTokenList({ chainId: 4158 });
  }).then(testnetTokens => {
    console.log(`📋 Testnet tokens (4158): ${testnetTokens.length} found`);
    console.log('Sample testnet tokens:', testnetTokens.slice(0, 3));

    // Test without chainId parameter
    console.log('🔄 Testing without chainId parameter...');
    return window.cross.getTokenList();
  }).then(defaultTokens => {
    console.log(`📋 Default tokens (no chainId): ${defaultTokens.length} found`);
    console.log('Sample default tokens:', defaultTokens.slice(0, 3));

  }).catch(error => {
    console.error('❌ Cross Wallet SDK error:', error);
  });

} else {
  console.warn('❌ window.cross is not available');
  console.log('💡 This means Cross Wallet extension is not installed or not loaded');

  // Check if Cross SDK is loaded
  if (typeof window !== 'undefined' && window.crossSdk) {
    console.log('📦 Cross SDK found, but window.cross not available');
  } else {
    console.log('📦 Cross SDK not detected');
  }
}

// Additional network debugging
console.log('🌐 Network debugging:');
console.log('- Mainnet chainId: 4157');
console.log('- Testnet chainId: 4158');
console.log('- Expected behavior: Testnet should return fewer/different tokens than mainnet');