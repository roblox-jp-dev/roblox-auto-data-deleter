# Roblox Data Auto Deleter

## インストール手順

### 前提条件
- Node.js バージョン 22.8.0 以上

### セットアップ方法

1. **リポジトリのクローンとインストール**
   ```shell
   git clone https://github.com/roblox-jp-dev/roblox-data-auto-deleter.git
   cd roblox-data-auto-deleter
   npm install
   npx auth secret
   npm run setup
   ```

2. **環境変数の設定**  
   `.env.local` ファイルを編集して以下の設定を行います：

   | 変数名 | 説明 |
   |--------|------|
   | `AUTH_PASSWORD` | ログインパスワード（9文字以上で記号を含む必要あり。初期値: `1234`） |
   | `AUTH_SECRET` | セッション暗号化用の秘密キー（公開しないでください） |
   | `NEXTAUTH_URL` | アプリケーションのURL |
   | `ALLOWED_IP` | 許可IPアドレスリスト（例: `127.0.0.1, 0.0.0.0`）※`0.0.0.0`を含めると全IP許可 |
   | `MAX_LOGIN_ATTEMPTS` | ログイン失敗の最大回数（初期値: `5`） |
   | `LOGIN_ATTEMPTS_TIMEOUT` | アカウントロック期間（分単位、初期値: `10`） |

3. **アプリケーション起動**
   ```shell
   npm run start
   ```

## デプロイと SSL 設定

### 方法1: リバースプロキシによる SSL 設定

#### Nginx の場合

1. **基本設定**  
   `/etc/nginx/conf.d/your-site.conf` に追加:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

2. **SSL設定 (Certbot)**
   ```shell
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

#### Apache の場合

1. **基本設定**  
   `/etc/apache2/sites-available/000-default.conf` に追加:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com

       ProxyPreserveHost On
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
   </VirtualHost>
   ```

2. **SSL設定 (Certbot)**
   ```shell
   sudo apt update
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d your-domain.com
   ```

### 方法2: Cloudflare Tunnels の利用

1. **`cloudflared` インストール**  
   Cloudflare公式サイトからダウンロード

2. **トンネル作成**
   ```shell
   cloudflared tunnel create my-tunnel
   ```

3. **設定ファイル作成 (config.yml)**
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /path/to/credentials.json
   ingress:
     - hostname: your-domain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

4. **トンネル起動**
   ```shell
   cloudflared tunnel run my-tunnel
   ```

## セキュリティ対策

### 重要な推奨事項

1. **HTTPS の強制使用**  
   本番環境では必ず HTTPS を使用し、`NEXTAUTH_URL` を `https://` で始めるよう設定してください。

2. **HSTS の設定**

   **Nginx の場合:**
   ```nginx
   add_header Strict-Transport-Security "max-age=15768000; includeSubDomains" always;
   ```

   **Apache の場合:**
   ```apache
   Header always set Strict-Transport-Security "max-age=15768000; includeSubDomains"
   ```

   これにより一度 HTTPS で接続したブラウザは以降も自動的に HTTPS での接続を強制します。

## 法的情報

### ライセンス

このプロジェクトは [MIT ライセンス](./LICENSE.md)の下で公開されています。


### 依存ライブラリ

本プロジェクトは以下の主要な依存ライブラリを使用しています：

| ライブラリ | ライセンス |
|------------|------------|
| @prisma/client | Apache-2.0 |
| @radix-ui/react-select | MIT |
| @radix-ui/react-tabs | MIT |
| @tippyjs/react | MIT |
| axios | MIT |
| next | MIT |
| react | MIT |
| react-datepicker | MIT |
| lucide-react | ISC |

すべての依存関係とそのライセンスの詳細については[NOTICE](./NOTICE.md)ファイルをご参照ください。

### 免責事項

本ソフトウェアは「現状のまま」提供され、明示または黙示を問わず、いかなる種類の保証も行いません。Roblox好きの集いおよびコントリビューターは、本ソフトウェアの使用によって生じるいかなる損害についても責任を負いません。

---

© 2025 Roblox好きの集い. All Rights Reserved.

