# Roblox Auto Data Deleter

## インストール手順

### 前提条件
- Node.js バージョン 22.8.0 以上
   - **Windows**: [nodejs.org](https://nodejs.org/)からインストーラーをダウンロード
   - **Linux (Debian/Ubuntu)**: `sudo apt install nodejs npm`
   - **Linux (CentOS/RHEL)**: `sudo yum install nodejs npm` または `sudo dnf install nodejs npm`
   - **Linux (Arch)**: `sudo pacman -S nodejs npm`
   - **macOS**: `brew install node` (Homebrewが必要)

### セットアップ方法

1. **リポジトリのクローンとインストール**

   **Windows**:
   ```cmd
   git clone https://github.com/roblox-jp-dev/roblox-data-auto-deleter.git
   cd roblox-data-auto-deleter
   npm install
   npx auth secret
   npm run setup
   ```

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)/macOS**:
   ```bash
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

   **Windows**:
   ```cmd
   notepad .env.local
   ```
   または Visual Studio Code、メモ帳などのエディタで開いて編集

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)**:
   ```bash
   nano .env.local
   ```
   または
   ```bash
   vim .env.local
   ```

   **macOS**:
   ```bash
   nano .env.local
   ```
   または
   ```bash
   vim .env.local
   ```

3. **アプリケーション起動**

   **Windows**:
   ```cmd
   npm run start
   ```

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)/macOS**:
   ```bash
   npm run start
   ```

## デプロイと SSL 設定

### 方法1: リバースプロキシによる SSL 設定

#### Nginx の場合

1. **Nginxのインストール**

   **Windows**:
   Nginxの[公式サイト](https://nginx.org/en/download.html)からダウンロードしてインストール

   **Linux (Debian/Ubuntu)**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

   **Linux (CentOS/RHEL)**:
   ```bash
   sudo yum install epel-release
   sudo yum install nginx
   ```

   **Linux (Arch)**:
   ```bash
   sudo pacman -S nginx
   ```

   **macOS**:
   ```bash
   brew install nginx
   ```

2. **Nginxの設定**

   **Windows**:
   `C:\nginx\conf\nginx.conf` または同様のパスにある設定ファイルを編集

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)**:
   ```bash
   sudo nano /etc/nginx/conf.d/your-site.conf
   ```

   **macOS**:
   ```bash
   nano /usr/local/etc/nginx/nginx.conf
   ```

   設定例:
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

3. **SSL証明書の設定 (Let's Encrypt)**

   **Windows**:
   [Win-ACME](https://www.win-acme.com/) などのツールを使用

   **Linux (Debian/Ubuntu)**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

   **Linux (CentOS/RHEL)**:
   ```bash
   sudo yum install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

   **Linux (Arch)**:
   ```bash
   sudo pacman -S certbot certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

   **macOS**:
   ```bash
   brew install certbot
   sudo certbot --nginx -d your-domain.com
   ```

#### Apache の場合

1. **Apacheのインストール**

   **Windows**:
   [Apache Lounge](https://www.apachelounge.com/download/)からダウンロードしてインストール

   **Linux (Debian/Ubuntu)**:
   ```bash
   sudo apt update
   sudo apt install apache2
   ```

   **Linux (CentOS/RHEL)**:
   ```bash
   sudo yum install httpd
   ```

   **Linux (Arch)**:
   ```bash
   sudo pacman -S apache
   ```

   **macOS**:
   ```bash
   brew install httpd
   ```

2. **Apacheの設定**

   **Windows**:
   `C:\Apache24\conf\httpd.conf` または同様のパスにある設定ファイルを編集

   **Linux (Debian/Ubuntu)**:
   ```bash
   sudo nano /etc/apache2/sites-available/your-site.conf
   ```
   
   **Linux (CentOS/RHEL)**:
   ```bash
   sudo nano /etc/httpd/conf.d/your-site.conf
   ```

   **Linux (Arch)**:
   ```bash
   sudo nano /etc/httpd/conf/extra/httpd-vhosts.conf
   ```

   **macOS**:
   ```bash
   nano /usr/local/etc/httpd/httpd.conf
   ```

   設定例:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       ProxyPreserveHost On
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
   </VirtualHost>
   ```

3. **モジュール有効化 (Debian/Ubuntu)**:
   ```bash
   sudo a2enmod proxy proxy_http
   sudo a2ensite your-site.conf
   sudo systemctl restart apache2
   ```

   **CentOS/RHEL/Arch/macOS**:
   モジュールを確認・有効化して再起動
   ```bash
   sudo systemctl restart httpd   # CentOS/RHEL/Arch
   brew services restart httpd    # macOS
   ```

4. **SSL証明書の設定 (Let's Encrypt)**

   **Windows**:
   [Win-ACME](https://www.win-acme.com/) などのツールを使用

   **Linux (Debian/Ubuntu)**:
   ```bash
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d your-domain.com
   ```

   **Linux (CentOS/RHEL)**:
   ```bash
   sudo yum install certbot python3-certbot-apache
   sudo certbot --apache -d your-domain.com
   ```

   **Linux (Arch)**:
   ```bash
   sudo pacman -S certbot certbot-apache
   sudo certbot --apache -d your-domain.com
   ```

   **macOS**:
   ```bash
   brew install certbot
   sudo certbot --apache -d your-domain.com
   ```

### 方法2: Cloudflare Tunnel の設定

1. **Cloudflare CLI のインストール**

   **Windows**:
   [Cloudflare公式サイト](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation)からダウンロード

   **Linux (Debian/Ubuntu)**:
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   ```

   **Linux (CentOS/RHEL)**:
   ```bash
   curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
   sudo rpm -ivh cloudflared.rpm
   ```

   **Linux (Arch)**:
   ```bash
   yay -S cloudflared
   ```
   または
   ```bash
   sudo pacman -S cloudflared
   ```

   **macOS**:
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Cloudflare への認証**

   **全OS共通**:
   ```bash
   cloudflared tunnel login
   ```

3. **トンネルの作成と設定**

   **全OS共通**:
   ```bash
   cloudflared tunnel create my-tunnel
   cloudflared tunnel route dns my-tunnel your-domain.com
   ```

   設定ファイルの作成:
   ```bash
   mkdir -p ~/.cloudflared
   ```

   **Windows**:
   ```cmd
   echo ingress:> %USERPROFILE%\.cloudflared\config.yml
   echo   - hostname: your-domain.com>> %USERPROFILE%\.cloudflared\config.yml
   echo     service: http://localhost:3000>> %USERPROFILE%\.cloudflared\config.yml
   echo   - service: http_status:404>> %USERPROFILE%\.cloudflared\config.yml
   ```

   **Linux/macOS**:
   ```bash
   cat > ~/.cloudflared/config.yml << EOF
   ingress:
     - hostname: your-domain.com
       service: http://localhost:3000
     - service: http_status:404
   EOF
   ```

4. **トンネル起動**

   **Windows**:
   ```cmd
   cloudflared tunnel run my-tunnel
   ```

   **Linux/macOS**:
   ```bash
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
