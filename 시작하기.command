#!/bin/bash

# 1. 스크립트가 위치한 폴더에서 먼저 찾아보기
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="초간편-주문-페이지"

# 2. 이동할 후보지들
POSSIBLE_PATHS=(
    "$DIR"
    "$DIR/$PROJECT_NAME"
    "$HOME/Desktop/$PROJECT_NAME"
    "/Users/sungjk0706/Desktop/$PROJECT_NAME"
    "/Users/sungjk0706/Desktop/joli-joli"
)

FOUND=false
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -f "$path/package.json" ]; then
        cd "$path"
        FOUND=true
        break
    fi
done

if [ "$FOUND" = false ]; then
    echo "------------------------------------------"
    echo "❌ 오류: 프로젝트 폴더를 찾을 수 없습니다."
    echo "------------------------------------------"
    echo "초간편-주문-페이지 폴더 안에 package.json이 있는지 확인해 주세요."
    exit 1
fi

echo "------------------------------------------"
echo "🚀 joli.joli 라이브 컬렉션 시작"
echo "------------------------------------------"
echo "📁 프로젝트 경로: $(pwd)"
echo ""

# 필요한 패키지가 없으면 설치합니다.
if [ ! -d "node_modules" ]; then
    echo "📦 필요한 라이브러리를 설치 중입니다... (약 1~2분 소요)"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 오류: 패키지 설치에 실패했습니다."
        exit 1
    fi
    echo "✅ 패키지 설치 완료"
    echo ""
fi

echo "🌐 개발 서버를 실행하고 브라우저를 엽니다..."
echo "잠시만 기다려 주세요! ✨"
echo ""

# 서버 실행 (외부 접속 허용 및 브라우저 자동 오픈)
npm run dev -- --host --open
