#!/bin/bash

# 프로젝트 경로로 이동
cd /Users/sungjk0706/Desktop/joli-joli

echo "------------------------------------------"
echo "🚀 joli.joli 라이브 컬렉션 시작"
echo "------------------------------------------"
echo "📁 현재 경로: $(pwd)"
echo ""

# package.json이 있는지 확인
if [ ! -f "package.json" ]; then
    echo "❌ 오류: 현재 디렉토리에 package.json이 없습니다."
    exit 1
fi

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
echo "창이 뜨면 잠시만 기다려 주세요! ✨"
echo ""

# 서버를 실행하면서 동시에 브라우저를 엽니다.
npm run dev -- --open
