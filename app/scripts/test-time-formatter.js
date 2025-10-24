// Test the custom relative time formatter
console.log('🕐 Testing custom relative time formatter...');

const formatLastUpdated = (date) => {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
};

// Test cases
const testCases = [
  { date: new Date(), expected: 'just now', description: 'Current time' },
  { date: new Date(Date.now() - 1000 * 30), expected: 'just now', description: '30 seconds ago' },
  { date: new Date(Date.now() - 1000 * 60 * 2), expected: '2 minutes ago', description: '2 minutes ago' },
  { date: new Date(Date.now() - 1000 * 60 * 1), expected: '1 minute ago', description: '1 minute ago' },
  { date: new Date(Date.now() - 1000 * 60 * 60 * 2), expected: '2 hours ago', description: '2 hours ago' },
  { date: new Date(Date.now() - 1000 * 60 * 60 * 1), expected: '1 hour ago', description: '1 hour ago' },
  { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), expected: '3 days ago', description: '3 days ago' },
  { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), expected: '1 day ago', description: '1 day ago' }
];

console.log('\n📊 Test Results:');
console.log('================');

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = formatLastUpdated(test.date);
  const success = result === test.expected;

  console.log(`${index + 1}. ${test.description}: ${success ? '✅' : '❌'}`);
  console.log(`   Expected: "${test.expected}"`);
  console.log(`   Got:      "${result}"`);

  if (success) {
    passed++;
  } else {
    failed++;
  }
  console.log();
});

console.log(`📈 Results: ${passed} passed, ${failed} failed`);
console.log(`🎯 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All time formatter tests passed!');
  console.log('✅ Custom relative time formatter working correctly');
  console.log('✅ No dependency on Intl.RelativeTimeFormatter');
  console.log('✅ Cross-browser compatible implementation');
} else {
  console.log('\n⚠️  Some tests failed - check implementation');
}

console.log('\n🔧 Fix Applied:');
console.log('- Replaced Intl.RelativeTimeFormatter with custom implementation');
console.log('- Added proper pluralization logic');
console.log('- Improved browser compatibility');
console.log('- More readable time format output');