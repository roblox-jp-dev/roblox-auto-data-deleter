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
npx auth secret
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

- `ALLOWED_IP`
    許可されたIPアドレスのリストです。
    ```127.0.0.1, 0.0.0.0```のような形で指定します。
    もし0.0.0.0が含まれていた場合は、すべてのIPアドレスが許可されます

##### 環境変数設定後の注意

   環境変数を変更したあとは、コマンドラインで下記のコマンドを実行して新しい環境変数を適用する必要があります。

   ```sh
   npm run build
   ```

#### 起動

以下のコマンドをターミナルで実行してください

```shell
npm run start
```

## SSL化

### リバースプロキシ設定 (nginx / Apache)

#### nginxによるリバースプロキシ設定

`/etc/nginx/conf.d/your-site.conf`に以下の設定例を追加してください：

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

##### nginxのSSL化 (certbot利用)

1. Certbotとnginx用プラグインをインストールします（例: Ubuntuの場合）:

   ```shell
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. Certbotを利用してSSL証明書を取得・設定します:

   ```shell
   sudo certbot --nginx -d your-domain.com
   ```

   ※ プロンプトにしたがってメールアドレスの入力や利用規約への同意を行ってください。

3. 自動更新の確認:

   ```shell
   sudo systemctl status certbot.timer
   ```

#### Apacheによるリバースプロキシ設定

設定ファイル（例: `/etc/apache2/sites-available/000-default.conf`）に以下を追加してください（mod_proxyとmod_proxy_httpが有効なことを確認）:

```apache
<VirtualHost *:80>
    ServerName your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

##### ApacheのSSL化 (certbot利用)

1. CertbotとApache用プラグインをインストールします（例: Ubuntuの場合）:

   ```shell
   sudo apt update
   sudo apt install certbot python3-certbot-apache
   ```

2. Certbotを利用してSSL証明書を取得・設定します:

   ```shell
   sudo certbot --apache -d your-domain.com
   ```

   ※ プロンプトにしたがってメールアドレスの入力や利用規約への同意を行ってください。

3. 自動更新設定が正しく動作しているか確認してください。

### Cloudflare Tunnelsによる設定

1. Cloudflare Tunnelのインストール  
   Cloudflareの公式サイトから`cloudflared`をダウンロードします。

2. Tunnelの作成  
   ターミナルで以下のコマンドを実行してください：

   ```shell
   cloudflared tunnel create my-tunnel
   ```

3. Tunnel設定ファイル（config.yml）の作成  
   以下のような設定ファイルをプロジェクト内に作成し、必要に応じて編集してください：

   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /path/to/credentials.json
   ingress:
     - hostname: your-domain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

4. Tunnelの実行  
   以下のコマンドでTunnelを起動します

   ```shell
   cloudflared tunnel run my-tunnel
   ```
