// Cross Wallet 진단 스크립트
console.log('=== Cross Wallet 진단 시작 ===');

// 1. 모든 가능한 Cross Wallet 객체 확인
const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet'];
let foundWallet = null;

console.log('1. Cross Wallet 객체 검색:');
possibleNames.forEach(name => {
  const obj = window[name];
  if (obj) {
    console.log(`✅ 발견: window.${name}`, typeof obj);

    if (typeof obj.request === 'function') {
      console.log(`  → request 메소드 있음`);
      foundWallet = obj;
    } else {
      console.log(`  → request 메소드 없음`);
    }

    console.log(`  → 속성들:`, Object.keys(obj).slice(0, 10));
  } else {
    console.log(`❌ 없음: window.${name}`);
  }
});

// 2. isAvailable 함수 테스트 (우리가 실제 사용하는 것)
console.log('\n2. isAvailable 함수 테스트:');
const isAvailable = () => {
  if (typeof window === 'undefined') return false;

  const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet'];

  for (const name of possibleNames) {
    const wallet = window[name];
    if (wallet && typeof wallet.request === 'function') {
      return true;
    }
  }

  return false;
};

const available = isAvailable();
console.log(`isAvailable() 결과: ${available ? '✅ Available' : '❌ Unavailable'}`);

// 3. Cross 관련 window 객체 전체 스캔
console.log('\n3. Cross 관련 window 객체 스캔:');
const windowKeys = Object.keys(window);
const crossKeys = windowKeys.filter(key =>
  key.toLowerCase().includes('cross') ||
  key.toLowerCase().includes('nexus')
);

if (crossKeys.length > 0) {
  console.log(`발견된 Cross 관련 키들 (${crossKeys.length}개):`);
  crossKeys.forEach(key => {
    console.log(`  - ${key}: ${typeof window[key]}`);
  });
} else {
  console.log('Cross 관련 window 객체 없음');
}

// 4. Cross Wallet 기능 테스트
if (foundWallet) {
  console.log('\n4. Cross Wallet 기능 테스트:');

  // chainId 확인
  foundWallet.request({ method: 'eth_chainId' })
    .then(chainId => {
      console.log('✅ eth_chainId 성공:', chainId);
    })
    .catch(err => {
      console.log('❌ eth_chainId 실패:', err.message);
    });

  // 계정 확인 (연결되어 있다면)
  foundWallet.request({ method: 'eth_accounts' })
    .then(accounts => {
      console.log('✅ eth_accounts 성공:', accounts.length, '개 계정');
    })
    .catch(err => {
      console.log('❌ eth_accounts 실패:', err.message);
    });
} else {
  console.log('\n4. Cross Wallet 기능 테스트: 건너뜀 (지갑 없음)');
}

console.log('\n=== Cross Wallet 진단 완료 ===');