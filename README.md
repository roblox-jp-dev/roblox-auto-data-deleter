# Roblox Auto Data Deleter

## Japanese/日本語版
日本語版は[こちらの記事](https://roblog.jp/studio/?p=4542)をご覧ください。
For the Japanese version, please [click here.](https://roblog.jp/studio/?p=4542)

## Installation Instructions

### Prerequisites
- Node.js version 22.8.0 or above
   - **Windows**: Download the installer from [nodejs.org](https://nodejs.org/)
   - **Linux (Debian/Ubuntu)**: `sudo apt install nodejs npm`
   - **Linux (CentOS/RHEL)**: `sudo yum install nodejs npm` or `sudo dnf install nodejs npm`
   - **Linux (Arch)**: `sudo pacman -S nodejs npm`
   - **macOS**: `brew install node` (Homebrew is required)

### Setup Method

1. **Clone the Repository and Install**

   **Windows**:
   ```cmd
   git clone https://github.com/roblox-jp-dev/roblox-auto-data-deleter.git
   cd roblox-data-auto-deleter
   npm install
   npx auth secret
   npm run setup
   ```

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)/macOS**:
   ```bash
   git clone https://github.com/roblox-jp-dev/roblox-auto-data-deleter.git
   cd roblox-data-auto-deleter
   npm install
   npx auth secret
   npm run setup
   ```

2. **Setting Environment Variables**  
   Edit the `.env.local` file and configure the following settings:

   | Variable Name         | Description |
   |-----------------------|-------------|
   | `AUTH_PASSWORD`       | Login password (must be at least 9 characters and include symbols. Default: `1234`) |
   | `AUTH_SECRET`         | Secret key for session encryption (do not disclose) |
   | `NEXTAUTH_URL`        | URL of the application |
   | `ALLOWED_IP`          | List of allowed IP addresses (e.g., `127.0.0.1, 0.0.0.0`); including `0.0.0.0` permits all IP addresses |
   | `MAX_LOGIN_ATTEMPTS`  | Maximum number of failed login attempts (Default: `5`) |
   | `LOGIN_ATTEMPTS_TIMEOUT` | Account lock period (in minutes, Default: `10`) |

   **Windows**:
   ```cmd
   notepad .env.local
   ```
   Or open and edit with Visual Studio Code, Notepad, etc.

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)**:
   ```bash
   nano .env.local
   ```
   or
   ```bash
   vim .env.local
   ```

   **macOS**:
   ```bash
   nano .env.local
   ```
   or
   ```bash
   vim .env.local
   ```

3. **Starting the Application**

   **Windows**:
   ```cmd
   npm run start
   ```

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)/macOS**:
   ```bash
   npm run start
   ```

## Deployment and SSL Configuration

### Method 1: SSL Configuration Using Reverse Proxy

#### For Nginx

1. **Installing Nginx**

   **Windows**:
   Download and install from Nginx's [official website](https://nginx.org/en/download.html)

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

2. **Configuring Nginx**

   **Windows**:
   Edit the configuration file at `C:\nginx\conf\nginx.conf` or a similar path

   **Linux (Debian/Ubuntu/CentOS/RHEL/Arch)**:
   ```bash
   sudo nano /etc/nginx/conf.d/your-site.conf
   ```

   **macOS**:
   ```bash
   nano /usr/local/etc/nginx/nginx.conf
   ```

   Example configuration:
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

3. **Configuring SSL Certificates (Let's Encrypt)**

   **Windows**:
   Use tools like [Win-ACME](https://www.win-acme.com/)

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

#### For Apache

1. **Installing Apache**

   **Windows**:
   Download and install from [Apache Lounge](https://www.apachelounge.com/download/)

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

2. **Configuring Apache**

   **Windows**:
   Edit the configuration file at `C:\Apache24\conf\httpd.conf` or a similar path

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

   Example configuration:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       ProxyPreserveHost On
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
   </VirtualHost>
   ```

3. **Enabling Modules (Debian/Ubuntu)**:
   ```bash
   sudo a2enmod proxy proxy_http
   sudo a2ensite your-site.conf
   sudo systemctl restart apache2
   ```

   **CentOS/RHEL/Arch/macOS**:
   Check and enable modules and restart:
   ```bash
   sudo systemctl restart httpd   # CentOS/RHEL/Arch
   brew services restart httpd    # macOS
   ```

4. **Configuring SSL Certificates (Let's Encrypt)**

   **Windows**:
   Use tools like [Win-ACME](https://www.win-acme.com/)

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

### Method 2: Setting Up Cloudflare Tunnel

1. **Installing Cloudflare CLI**

   **Windows**:
   Download from the [Cloudflare official website](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation)

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
   or
   ```bash
   sudo pacman -S cloudflared
   ```

   **macOS**:
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Authentication to Cloudflare**

   **All operating systems**:
   ```bash
   cloudflared tunnel login
   ```

3. **Creating and Configuring the Tunnel**

   **All operating systems**:
   ```bash
   cloudflared tunnel create my-tunnel
   cloudflared tunnel route dns my-tunnel your-domain.com
   ```

   Creating the configuration file:
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

4. **Starting the Tunnel**

   **Windows**:
   ```cmd
   cloudflared tunnel run my-tunnel
   ```

   **Linux/macOS**:
   ```bash
   cloudflared tunnel run my-tunnel
   ```

## Security Measures

### Important Recommendations

1. **Enforcing HTTPS**  
   In production, always use HTTPS and ensure that `NEXTAUTH_URL` begins with `https://`.

2. **Configuring HSTS**

   **For Nginx:**
   ```nginx
   add_header Strict-Transport-Security "max-age=15768000; includeSubDomains" always;
   ```

   **For Apache:**
   ```apache
   Header always set Strict-Transport-Security "max-age=15768000; includeSubDomains"
   ```

## Legal Information

### License

This project is licensed under the [MIT License](./LICENSE.md).

### Dependencies

This project uses the following main dependency libraries:

| Library                    | License  |
|----------------------------|----------|
| @prisma/client             | Apache-2.0 |
| @radix-ui/react-select     | MIT      |
| @radix-ui/react-tabs       | MIT      |
| @tippyjs/react             | MIT      |
| axios                      | MIT      |
| next                       | MIT      |
| react                      | MIT      |
| react-datepicker           | MIT      |
| lucide-react               | ISC      |

For details on all dependencies and their licenses, please refer to the [NOTICE](./NOTICE.md) file.

### Disclaimer

This software is provided "as is", without any express or implied warranties. Roblox enthusiasts and contributors are not liable for any damages resulting from the use of this software.

---

© 2025 Roblox好きの集い. All Rights Reserved.
