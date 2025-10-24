// Cross Wallet 강제 리셋 스크립트 - Connection Declined 문제 해결
console.log('🔧 Cross Wallet 강제 리셋 시작...');

async function forceCrossWalletReset() {
  try {
    // 1. 모든 Cross Wallet 인스턴스 찾기
    const possibleNames = ['crossWallet', 'cross', 'Cross', 'CrossWallet'];
    let crossWallet = null;

    for (const name of possibleNames) {
      if (window[name] && typeof window[name].request === 'function') {
        crossWallet = window[name];
        console.log(`✅ Cross Wallet 발견: window.${name}`);
        break;
      }
    }

    if (!crossWallet) {
      console.log('❌ Cross Wallet을 찾을 수 없습니다.');

      // Ethereum provider에서 Cross Wallet 찾기
      if (window.ethereum) {
        const providers = window.ethereum.providers || [window.ethereum];
        const crossProvider = providers.find(p => p.isCross || p.isCrossWallet);
        if (crossProvider) {
          crossWallet = crossProvider;
          console.log('✅ Ethereum provider에서 Cross Wallet 발견');
        }
      }

      if (!crossWallet) {
        console.log('⚠️ Cross Wallet 확장 프로그램이 설치되지 않았거나 비활성화되었습니다.');
        return false;
      }
    }

    console.log('🧹 Cross Wallet 상태 강제 정리 시작...');

    // 2. 모든 pending request 강제 취소
    try {
      // 내부 상태 정리
      if (crossWallet._state) {
        crossWallet._state = {};
        console.log('✓ _state 정리됨');
      }

      if (crossWallet._pendingRequests) {
        crossWallet._pendingRequests = [];
        console.log('✓ _pendingRequests 정리됨');
      }

      if (crossWallet._requests) {
        crossWallet._requests.clear();
        console.log('✓ _requests 정리됨');
      }

      if (crossWallet.selectedAddress) {
        crossWallet.selectedAddress = null;
        console.log('✓ selectedAddress 정리됨');
      }
    } catch (e) {
      console.log('⚠️ 내부 상태 정리 중 일부 실패:', e.message);
    }

    // 3. 여러 disconnect 방법 시도
    const disconnectMethods = [
      'wallet_disconnect',
      'wallet_revokePermissions',
      'wallet_clearSession',
      'eth_accounts'
    ];

    for (const method of disconnectMethods) {
      try {
        console.log(`🔄 ${method} 시도...`);

        if (method === 'wallet_revokePermissions') {
          await crossWallet.request({
            method: method,
            params: [{ eth_accounts: {} }]
          });
        } else {
          await crossWallet.request({ method });
        }

        console.log(`✓ ${method} 성공`);

        // 각 메소드 후 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (e) {
        console.log(`⚠️ ${method} 실패:`, e.message);
      }
    }

    // 4. 모든 localStorage/sessionStorage Cross 관련 데이터 정리
    console.log('🧹 브라우저 저장소 정리...');

    // localStorage 정리
    const lsKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
        lsKeys.push(key);
      }
    }
    lsKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`✓ localStorage.${key} 제거됨`);
    });

    // sessionStorage 정리
    const ssKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('cross') || key.includes('Cross') || key.includes('nexus') || key.includes('to-nexus'))) {
        ssKeys.push(key);
      }
    }
    ssKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`✓ sessionStorage.${key} 제거됨`);
    });

    // 5. 이벤트 리스너 정리
    try {
      if (crossWallet.removeAllListeners) {
        crossWallet.removeAllListeners();
        console.log('✓ 모든 이벤트 리스너 제거됨');
      }
    } catch (e) {
      console.log('⚠️ 이벤트 리스너 정리 실패:', e.message);
    }

    console.log('⏳ 5초 대기 후 새로운 연결 시도...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. 새로운 연결 테스트
    console.log('🔌 새로운 연결 테스트...');
    try {
      const accounts = await crossWallet.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        console.log('✅ Cross Wallet 연결 성공!', accounts[0]);
        console.log('🎉 Connection Declined 문제 해결됨!');
        return true;
      } else {
        console.log('❌ 계정을 찾을 수 없습니다.');
        return false;
      }
    } catch (error) {
      console.log('❌ 연결 테스트 실패:', error.message);

      if (error.message.includes('Connection declined')) {
        console.log('🔄 아직도 Connection Declined 에러. 브라우저 재시작이 필요할 수 있습니다.');
      }

      return false;
    }

  } catch (error) {
    console.error('💥 강제 리셋 중 오류 발생:', error);
    return false;
  }
}

// 실행
forceCrossWalletReset()
  .then(success => {
    if (success) {
      console.log('🎉 Cross Wallet 리셋 및 연결 완료!');
      // 페이지 새로고침으로 상태 완전 초기화
      setTimeout(() => {
        console.log('🔄 페이지 새로고침으로 완전 초기화...');
        window.location.reload();
      }, 2000);
    } else {
      console.log('⚠️ 리셋 완료했지만 연결 실패. 수동으로 Cross Wallet을 열어서 연결해보세요.');
    }
  })
  .catch(error => {
    console.error('💥 리셋 실패:', error);
  });