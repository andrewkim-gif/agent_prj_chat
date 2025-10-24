#!/bin/bash

# 3009번 포트를 사용하는 프로세스 종료
echo "3009번 포트를 사용하는 프로세스를 찾는 중..."

# 여러 방법으로 프로세스 찾기 및 종료
PIDS=$(lsof -ti:3009 2>/dev/null)

if [ ! -z "$PIDS" ]; then
    echo "3009번 포트를 사용하는 프로세스들을 종료합니다..."
    for PID in $PIDS; do
        echo "PID $PID 종료 중..."
        kill -9 $PID 2>/dev/null
    done
    echo "프로세스들이 종료되었습니다."
else
    echo "lsof로 찾을 수 없어서 netstat으로 다시 확인합니다..."
    PIDS=$(netstat -tlnp 2>/dev/null | grep :3009 | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' | sort -u)
    if [ ! -z "$PIDS" ]; then
        echo "netstat으로 찾은 프로세스들을 종료합니다..."
        for PID in $PIDS; do
            echo "PID $PID 종료 중..."
            kill -9 $PID 2>/dev/null
        done
    else
        echo "3009번 포트를 사용하는 프로세스가 없습니다."
    fi
fi

# 포트가 완전히 해제될 때까지 대기
echo "포트가 해제될 때까지 대기 중..."
for i in {1..10}; do
    if ! lsof -ti:3009 >/dev/null 2>&1; then
        echo "포트가 해제되었습니다."
        break
    fi
    echo "대기 중... ($i/10)"
    sleep 1
done

# app 폴더로 이동
cd /home/nexus/apps/services/arachat/app

# 개발 모드로 실행 (빌드 없이 바로 실행)
echo "개발 모드로 앱을 시작합니다..."
echo "개발 서버: http://localhost:3009"
echo "프로덕션 서버와 별도의 빌드 폴더(.next-dev)를 사용합니다."

# 개발 모드 실행 (백그라운드에서)
nohup npm run dev > dev.log 2>&1 &
echo "개발 앱이 백그라운드에서 실행 중입니다. 로그는 dev.log 파일에서 확인할 수 있습니다."
echo "프로세스 ID: $!"