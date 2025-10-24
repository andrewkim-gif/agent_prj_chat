#!/bin/bash

# 3001번 포트를 사용하는 프로세스 종료
echo "3001번 포트를 사용하는 프로세스를 찾는 중..."

# 여러 방법으로 프로세스 찾기 및 종료
PIDS=$(lsof -ti:3001 2>/dev/null)

if [ ! -z "$PIDS" ]; then
    echo "3001번 포트를 사용하는 프로세스들을 종료합니다..."
    for PID in $PIDS; do
        echo "PID $PID 종료 중..."
        kill -9 $PID 2>/dev/null
    done
    echo "프로세스들이 종료되었습니다."
else
    echo "lsof로 찾을 수 없어서 netstat으로 다시 확인합니다..."
    PIDS=$(netstat -tlnp 2>/dev/null | grep :3001 | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' | sort -u)
    if [ ! -z "$PIDS" ]; then
        echo "netstat으로 찾은 프로세스들을 종료합니다..."
        for PID in $PIDS; do
            echo "PID $PID 종료 중..."
            kill -9 $PID 2>/dev/null
        done
    else
        echo "3001번 포트를 사용하는 프로세스가 없습니다."
    fi
fi

# 포트가 완전히 해제될 때까지 대기
echo "포트가 해제될 때까지 대기 중..."
for i in {1..10}; do
    if ! lsof -ti:3001 >/dev/null 2>&1; then
        echo "포트가 해제되었습니다."
        break
    fi
    echo "대기 중... ($i/10)"
    sleep 1
done

# app 폴더로 이동
cd /home/nexus/apps/services/arachat/app

# 프로덕션 빌드 파일 확인 및 강제 빌드
echo "프로덕션 빌드 상태를 확인합니다..."

# .next-prod 폴더와 buildId 파일 존재 여부 확인
if [ ! -d ".next-prod" ] || [ ! -f ".next-prod/BUILD_ID" ]; then
    echo "프로덕션 빌드가 필요합니다. 기존 .next-prod 폴더를 삭제하고 새로 빌드합니다..."
    rm -rf .next-prod
    npm run build
    if [ $? -ne 0 ]; then
        echo "프로덕션 빌드에 실패했습니다."
        exit 1
    fi
    echo "프로덕션 빌드가 완료되었습니다."
else
    echo "프로덕션 빌드 파일이 존재하지만 문제가 있을 수 있습니다. 강제로 다시 빌드합니다..."
    rm -rf .next-prod
    npm run build
    if [ $? -ne 0 ]; then
        echo "프로덕션 빌드에 실패했습니다."
        exit 1
    fi
    echo "프로덕션 빌드가 완료되었습니다."
fi

# npm run start 실행 (백그라운드에서)
echo "앱을 백그라운드에서 시작합니다..."
nohup npm run start > app.log 2>&1 &
echo "앱이 백그라운드에서 실행 중입니다. 로그는 app.log 파일에서 확인할 수 있습니다."
echo "프로세스 ID: $!"