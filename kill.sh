#!/bin/bash

# 3001번 포트에서 실행 중인 프로세스를 종료하는 스크립트

echo "3001번 포트에서 실행 중인 프로세스를 찾는 중..."

# 3001번 포트를 사용하는 프로세스 찾기
PID=$(lsof -ti:3001)

if [ -z "$PID" ]; then
    echo "3001번 포트에서 실행 중인 프로세스가 없습니다."
    exit 0
fi

echo "발견된 프로세스 ID: $PID"

# 프로세스 정보 출력
echo "프로세스 정보:"
ps -p $PID -o pid,ppid,cmd

# 프로세스 종료
echo "프로세스를 종료합니다..."
kill -TERM $PID

# 5초 대기
sleep 5

# 프로세스가 여전히 실행 중인지 확인
if kill -0 $PID 2>/dev/null; then
    echo "프로세스가 아직 실행 중입니다. 강제 종료합니다..."
    kill -KILL $PID
    sleep 2
fi

# 최종 확인
if kill -0 $PID 2>/dev/null; then
    echo "프로세스 종료에 실패했습니다."
    exit 1
else
    echo "프로세스가 성공적으로 종료되었습니다."
fi

# 포트 상태 확인
echo "3001번 포트 상태 확인:"
lsof -i:3001 || echo "3001번 포트가 비어있습니다."

