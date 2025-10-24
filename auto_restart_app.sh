#!/bin/bash

# app 서비스 자동 재시작 스크립트

echo "=== App 서비스 자동 재시작 모니터링 시작 ==="
echo "포트: 3001"
echo "tmux 세션: app-dev"
echo "모니터링 간격: 30초"
echo ""

# 기존 중복 프로세스 정리
echo "1. 기존 중복 프로세스를 정리합니다..."
pkill -f "next-server" 2>/dev/null || true
tmux kill-session -t app-dev 2>/dev/null || true
sleep 3

# 초기 서비스 시작
echo "2. 초기 서비스를 시작합니다..."
cd /home/nexus/apps/services/arachat/app
tmux new-session -d -s app-dev 'npm run dev'
sleep 5

# 서비스 상태 확인
if lsof -i:3001 >/dev/null 2>&1; then
    echo "✅ 초기 서비스 시작 성공"
else
    echo "❌ 초기 서비스 시작 실패"
fi

echo ""
echo "3. 자동 재시작 모니터링을 시작합니다..."
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

# 자동 재시작 루프
while true; do
    # 서비스 상태 확인
    if ! lsof -i:3001 >/dev/null 2>&1; then
        echo "$(date): ❌ 서비스가 중단됨. 재시작 중..."
        
        # 기존 프로세스 정리
        pkill -f "next-server" 2>/dev/null || true
        tmux kill-session -t app-dev 2>/dev/null || true
        sleep 2
        
        # 서비스 재시작
        cd /home/nexus/apps/services/arachat/app
        tmux new-session -d -s app-dev 'npm run dev'
        
        # 재시작 확인
        sleep 5
        if lsof -i:3001 >/dev/null 2>&1; then
            echo "$(date): ✅ 서비스 재시작 성공"
        else
            echo "$(date): ❌ 서비스 재시작 실패"
        fi
    else
        # 서비스가 정상 실행 중
        echo "$(date): ✅ 서비스 정상 실행 중"
    fi
    
    # 30초 대기
    sleep 30
done





