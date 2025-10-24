// Simple test to validate blockchain integration
console.log("Testing blockchain command patterns...");

// Test Korean command patterns
const COMMAND_PATTERNS = {
  SEND_CROSS: [
    /(\d+(?:\.\d+)?)\s*cross\s*(?:를|을)?\s*보내(?:줘|라|기)/i,
    /cross\s*(?:를|을)?\s*보내(?:줘|라|기)/i,
    /(?:크로스|cross)\s*전송/i,
  ],
  CHECK_BALANCE: [
    /잔액\s*(?:확인|체크|조회)/i,
    /balance\s*(?:확인|체크|조회)/i,
    /얼마\s*(?:있어|가지고|소유)/i,
    /내\s*(?:돈|자산|잔고)/i
  ],
  CONNECT_WALLET: [
    /지갑\s*연결/i,
    /wallet\s*(?:연결|connect)/i,
    /지갑\s*(?:을|를)\s*연결/i
  ]
};

// Test cases
const testMessages = [
  "100 Cross 보내줘",
  "잔액 확인해줘",
  "지갑 연결해줘",
  "크로스 전송하고 싶어",
  "내 돈 얼마나 있어?",
  "wallet connect please"
];

console.log("\nTesting command pattern matching:");
testMessages.forEach(message => {
  console.log(`\nMessage: "${message}"`);

  // Test SEND_CROSS patterns
  for (const pattern of COMMAND_PATTERNS.SEND_CROSS) {
    const match = message.match(pattern);
    if (match) {
      console.log(`  ✅ SEND_CROSS matched: ${match[1] || 'no amount'}`);
      break;
    }
  }

  // Test CHECK_BALANCE patterns
  for (const pattern of COMMAND_PATTERNS.CHECK_BALANCE) {
    if (pattern.test(message.toLowerCase())) {
      console.log(`  ✅ CHECK_BALANCE matched`);
      break;
    }
  }

  // Test CONNECT_WALLET patterns
  for (const pattern of COMMAND_PATTERNS.CONNECT_WALLET) {
    if (pattern.test(message.toLowerCase())) {
      console.log(`  ✅ CONNECT_WALLET matched`);
      break;
    }
  }
});

console.log("\n✅ Blockchain pattern testing completed!");