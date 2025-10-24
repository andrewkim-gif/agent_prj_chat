#!/bin/bash

# CCR Code 실행 스크립트 - Sonnet 4.0 모델 사용

echo "=== CCR Code 실행 (Sonnet 4.0) ==="

# 1. Claude Code Router가 실행 중인지 확인
echo "1. Claude Code Router 상태를 확인합니다..."
if ! lsof -i:3456 >/dev/null 2>&1; then
    echo "❌ Claude Code Router가 실행되지 않았습니다."
    echo "먼저 Claude Code Router를 시작해주세요:"
    echo "npx @musistudio/claude-code-router@latest start"
    exit 1
fi

echo "✅ Claude Code Router가 실행 중입니다."

# 2. 환경 변수 설정
echo ""
echo "2. 환경 변수를 설정합니다..."
export ANTHROPIC_BASE_URL=http://localhost:3456

# 3. CCR Code 실행
echo ""
echo "3. CCR Code를 Sonnet 4.0 모델로 실행합니다..."
echo "모델: anthropic/claude-sonnet-4"
echo "라우터: http://localhost:3456"
echo ""

# CCR Code 실행 (Sonnet 4.0 모델 지정)
ccr code --model anthropic/claude-sonnet-4 "$@"










