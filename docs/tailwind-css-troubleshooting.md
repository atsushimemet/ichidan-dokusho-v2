# Tailwind CSS トラブルシューティング備忘録

## 概要
このドキュメントは、ichidan-dokusho-v2プロジェクトで発生したTailwind CSSの設定問題とその解決方法を記録したものです。

## 発生した問題

### 1. PostCSSプラグイン設定エラー
```
[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. 
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS 
you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

#### 原因
- Tailwind CSS v4では、PostCSSプラグインが`@tailwindcss/postcss`という別パッケージに分離されている
- 従来の`tailwindcss`を直接PostCSSプラグインとして使用しようとしていた

#### 解決方法
1. **Tailwind CSS v3にダウングレード**
   ```json
   // package.json
   "tailwindcss": "^3.4.17"
   ```

2. **PostCSS設定を修正**
   ```javascript
   // postcss.config.js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

### 2. 依存関係の不整合
```
npm error invalid: tailwindcss@4.1.11 /app/node_modules/tailwindcss
npm error A complete log of this run can be found in: /root/.npm/_logs/...
```

#### 原因
- Dockerのキャッシュにより、古いバージョンのTailwind CSSが残存
- コンテナ内でnode_modulesがロックされている状態

#### 解決方法
1. **完全なクリーンアップ**
   ```bash
   # 全てのコンテナとボリュームを削除
   docker compose -f docker-compose.dev.yml down -v
   
   # ホスト側の依存関係もクリア
   cd frontend
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. **Dockerfileの修正**
   ```dockerfile
   # Dockerfile.dev
   FROM node:22-alpine
   WORKDIR /app
   COPY package*.json ./
   
   # 既存のnode_modulesを削除してからインストール
   RUN rm -rf node_modules package-lock.json && npm install
   
   COPY . .
   EXPOSE 3002
   CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3002"]
   ```

3. **再ビルド**
   ```bash
   docker compose -f docker-compose.dev.yml build --no-cache frontend
   docker compose -f docker-compose.dev.yml up frontend -d
   ```

## 最終的な設定

### package.json (frontend)
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6"
  }
}
```

### postcss.config.js (frontend)
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### tailwind.config.js (frontend)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### index.css (frontend/src)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

## 学んだ教訓

1. **バージョン管理の重要性**
   - Tailwind CSS v4はまだ実験的な段階で、安定版のv3を使用することを推奨
   - 新しいバージョンに移行する際は、公式ドキュメントを必ず確認

2. **Dockerキャッシュの問題**
   - 依存関係の変更時は、Dockerのキャッシュを完全にクリアする必要がある
   - `--no-cache`オプションとボリューム削除を組み合わせる

3. **段階的なトラブルシューティング**
   - エラーメッセージを正確に読み取り、原因を特定
   - 小さな変更から始めて、問題を段階的に解決

## 参考リンク
- [Tailwind CSS v3 Documentation](https://tailwindcss.com/docs)
- [PostCSS Documentation](https://postcss.org/)
- [Vite CSS Pre-processors](https://vitejs.dev/guide/features.html#css-pre-processors)

## 作成日
2025年7月21日 
