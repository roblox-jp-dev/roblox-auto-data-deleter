# インストール手順

## 前提条件

- Node.jsバージョン22.8.0以上が必要です

### インストール方法

#### リポジトリのクローンとセットアップ

以下のコマンドをターミナルで実行してください。

```shell
git clone https://github.com/roblox-jp-dev/roblox-data-auto-deleter.git
cd roblox-data-auto-deleter
npm install
npm run setup
```

#### 環境変数の設定

プロジェクトルートにある `.env.local` ファイルをテキストエディターで開き、必要に応じて以下の設定を変更してください。

- `AUTH_PASSWORD`  
    ログイン時に使用するパスワード。初期値は `1234` です

- `AUTH_SECRET`  
    セッションの暗号化に使用する秘密キーです。第三者に公開しないようにしてください

- `NEXTAUTH_URL`  
    アプリケーションを動作させるURLです。実行する環境に合わせて設定してください
