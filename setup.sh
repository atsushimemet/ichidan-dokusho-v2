#!/bin/bash

echo "🚀 一段読書 v2 セットアップスクリプト"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js が見つかりません。Node.js v22+ をインストールしてください。"
    exit 1
fi

echo "✅ Node.js $(node --version) が見つかりました"

# Check if npm is installed  
if ! command -v npm &> /dev/null; then
    echo "❌ npm が見つかりません。"
    exit 1
fi

echo "✅ npm $(npm --version) が見つかりました"

# Install dependencies
echo ""
echo "📦 依存関係をインストール中..."

echo "  🔧 バックエンドの依存関係をインストール..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ バックエンドの依存関係のインストールに失敗しました"
    exit 1
fi

echo "  🎨 フロントエンドの依存関係をインストール..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then
    echo "❌ フロントエンドの依存関係のインストールに失敗しました"
    exit 1
fi

cd ..

# Create environment files if they don't exist
echo ""
echo "🔧 環境ファイルをセットアップ中..."

if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "  ✅ backend/.env を作成しました"
else
    echo "  ⚠️  backend/.env は既に存在します"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example frontend/.env
    echo "  ✅ frontend/.env を作成しました"
else
    echo "  ⚠️  frontend/.env は既に存在します"
fi

# Check if PostgreSQL is available
echo ""
echo "🐘 データベース接続を確認中..."
if command -v psql &> /dev/null; then
    echo "  ✅ PostgreSQL が見つかりました"
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw ichidan_dokusho; then
        echo "  ✅ データベース 'ichidan_dokusho' が見つかりました"
    else
        echo "  ⚠️  データベース 'ichidan_dokusho' が見つかりません"
        echo "      データベースを作成するには以下を実行してください："
        echo "      sudo -u postgres createdb ichidan_dokusho"
        echo "      sudo -u postgres psql ichidan_dokusho < backend/supabase-schema.sql"
    fi
else
    echo "  ⚠️  PostgreSQL が見つかりません"
    echo "      インストールするには以下を実行してください："
    echo "      sudo apt-get update && sudo apt-get install postgresql postgresql-contrib"
fi

# Build applications
echo ""
echo "🏗️  アプリケーションをビルド中..."

echo "  🔧 バックエンドをビルド..."
cd backend && npm run build
if [ $? -ne 0 ]; then
    echo "❌ バックエンドのビルドに失敗しました"
    exit 1
fi

echo "  🎨 フロントエンドをビルド..."
cd ../frontend && npm run build
if [ $? -ne 0 ]; then
    echo "❌ フロントエンドのビルドに失敗しました"
    exit 1
fi

cd ..

echo ""
echo "🎉 セットアップが完了しました！"
echo ""
echo "次のステップ："
echo "1. Google OAuth認証情報を設定してください："
echo "   - https://console.cloud.google.com/ でプロジェクトを作成"
echo "   - OAuth 2.0 認証情報を作成"
echo "   - backend/.env と frontend/.env にクライアントIDを設定"
echo ""
echo "2. PostgreSQL データベースをセットアップしてください："
echo "   - sudo -u postgres createdb ichidan_dokusho"
echo "   - sudo -u postgres psql ichidan_dokusho < backend/supabase-schema.sql"
echo ""
echo "3. アプリケーションを起動してください："
echo "   ターミナル1: cd backend && npm run dev"
echo "   ターミナル2: cd frontend && npm run dev"
echo ""
echo "4. ブラウザでアクセスしてください："
echo "   http://localhost:3003"
echo ""
echo "詳細な情報は IMPLEMENTATION_STATUS.md をご覧ください。"