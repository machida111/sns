# SNS & note 運用自動化アプリ

note.com / X (Twitter) / Instagram への投稿を、AIによる下書き生成・スケジュール投稿・管理画面からの手動トリガーで
運用できるWebアプリです。

## 主な機能

- **AI下書き生成**: テーマを入力すると、プラットフォームに合わせた投稿文(note記事 / Xの短文 / Instagramキャプション)をClaude(Anthropic API)が自動生成します
- **スケジュール投稿**: 日時を指定して予約投稿し、Cron経由で自動的に公開します
- **管理画面からの手動トリガー**: ダッシュボードから下書きの確認・編集・即時投稿・削除が行えます
- **複数プラットフォーム/複数アカウント対応**: note・X・Instagramそれぞれに複数のアカウントを登録できます

## 技術構成

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- 認証: 簡易な管理者ログイン(JWTセッションCookie)
- 認証情報の保存: AES-256-GCMで暗号化してDBに保存
- AI: Anthropic Claude API (`@anthropic-ai/sdk`)
- X投稿: `twitter-api-v2` (OAuth1.0aユーザーコンテキスト)
- Instagram投稿: Instagram Graph API
- note投稿: **非公式API(要注意、下記参照)**

## セットアップ (ローカル開発)

```bash
npm install
cp .env.example .env   # 値を編集する
docker compose up -d   # ローカルPostgresを起動
npm run db:push        # スキーマ反映
npm run db:seed        # 管理者アカウント作成 (.envのADMIN_EMAIL/ADMIN_PASSWORD)
npm run dev
```

`http://localhost:3000` にアクセスし、`.env` に設定した `ADMIN_EMAIL` / `ADMIN_PASSWORD` でログインしてください。

### 環境変数

`.env.example` を参照してください。主なもの:

| 変数名 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL接続文字列 |
| `APP_SECRET` | セッションJWT署名用のランダム文字列 |
| `APP_ENCRYPTION_KEY` | 各SNSの認証情報を暗号化するための32バイトキー(base64) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 初回シードで作成する管理者アカウント |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | AI下書き生成に使用 |
| `CRON_SECRET` | `/api/cron/publish` を呼び出す際のBearerトークン |
| `APP_BASE_URL` | デプロイ後のURL(GitHub Actionsからcronを叩く際に使用) |

`APP_SECRET` / `APP_ENCRYPTION_KEY` は以下のように生成できます:

```bash
openssl rand -base64 32
```

## デプロイ (Vercel想定)

1. Vercelにリポジトリをインポートし、上記環境変数をすべて設定
2. Postgresは Vercel Postgres / Neon / Supabase などを利用し `DATABASE_URL` を設定
3. デプロイ後、Vercelのビルドコマンドで `prisma generate` が実行されます(`npm run build` に含まれています)。初回のみ別途 `npx prisma db push` と seedスクリプトの実行が必要です
4. `vercel.json` に `crons` 設定を同梱しています(1時間毎に `/api/cron/publish` を実行)。Vercelは `CRON_SECRET` 環境変数が設定されていると自動的に `Authorization: Bearer <CRON_SECRET>` ヘッダーを付与してリクエストします
   - Vercelの無料プランはCronの実行頻度に制限があります。より高頻度(例: 15分毎)で予約投稿を実行したい場合は、同梱の GitHub Actions ワークフロー (`.github/workflows/scheduled-publish.yml`) を利用してください。リポジトリの Secrets に `CRON_SECRET` と `APP_BASE_URL` を設定するだけで動作します

## 各プラットフォームの連携設定

管理画面の「連携アカウント設定」からそれぞれの認証情報を登録してください。

### X (Twitter)

1. [developer.twitter.com](https://developer.twitter.com/) でAppを作成
2. "User authentication settings" で **Read and Write** 権限を有効化
3. Consumer Keys(API Key/Secret)とAccess Token & Secretを発行し、管理画面に入力

### Instagram

1. Instagramアカウントを「ビジネス/クリエイターアカウント」に切り替え、Facebookページと連携
2. [Meta for Developers](https://developers.facebook.com/) でアプリを作成し `instagram_content_publish` 権限を含む長期アクセストークンを取得
3. Instagram Business Account ID とアクセストークンを管理画面に入力
4. **Instagramはテキストのみの投稿に対応していません。** 投稿には画像URL(`mediaUrl`)が必須です

### note.com ⚠️重要な注意事項

note.comには外部アプリ向けの**公式投稿APIは存在しません**。本アプリのnote連携は、ログイン後のブラウザから
取得できるCookieを使って、note内部で使用されている非公式エンドポイントにリクエストを送る実装です。

- note.comの仕様変更により予告なく動作しなくなる可能性があります
- note.comの利用規約に抵触しないか、必ずご自身の責任でご確認のうえご利用ください
- Cookieの値は他人と共有せず、必ず本アプリの暗号化ストレージ以外に平文で保存しないでください
- 自動投稿が失敗した場合は、管理画面で生成した下書き本文をコピーし、note.comの編集画面に手動で貼り付けて
  公開することを推奨します

## ディレクトリ構成(抜粋)

```
src/
  app/
    login/                 ログイン画面
    (dashboard)/           管理画面(投稿一覧・新規作成・アカウント設定)
    api/
      auth/                ログイン/ログアウト
      accounts/            連携アカウントCRUD
      posts/               投稿CRUD・AI生成・手動publish
      cron/publish/        スケジュール投稿の実行(外部Cronから呼び出し)
  lib/
    ai/generate.ts         AI下書き生成(Anthropic)
    platforms/             X / Instagram / note の投稿アダプタ
    publish.ts             投稿実行・予約投稿バッチ処理
    crypto.ts               認証情報の暗号化/復号
    auth.ts                 セッション管理
```

## セキュリティに関する注意

- 管理画面は単一の管理者アカウントを想定した簡易認証です。社内/複数人での利用や公開インターネットへの
  デプロイ時は、追加の認証強化(2FA、IP制限など)を検討してください
- 各SNSの認証情報はDBに暗号化して保存されますが、`APP_ENCRYPTION_KEY` の管理には十分注意してください
- 生成AIによる投稿文は必ず内容を確認してから公開することを推奨します(自動生成のまま無検証で大量投稿しない)
