import Credentials from 'next-auth/providers/credentials';

const loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};

// 設定
const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);  // 最大試行回数
const LOCKOUT_TIME = parseInt(process.env.LOGIN_ATTEMPTS_TIMEOUT || '15', 10) * 60 * 1000;  // ロックアウト時間（15分）

export const authOptions = {
    providers: [
        Credentials({
            name: 'Password',
            credentials: {
                password: {
                    label: "パスワード",
                    type: "password"
                }
            },
            async authorize(credentials, req) {
                if (!credentials?.password) {
                    throw new Error("パスワードを入力してください");
                }

                // IPアドレスの取得 - リクエストヘッダーから取得
                let ipAddress = "127.0.0.1";
                if (req && req.headers) {
                    // X-Forwarded-For, X-Real-IP, またはリモートアドレスを確認
                    const forwardedFor = req.headers['x-forwarded-for'] as string;
                    const realIP = req.headers['x-real-ip'] as string;
                    
                    if (forwardedFor) {
                        // カンマ区切りの場合は最初のIPを使用
                        ipAddress = forwardedFor.split(',')[0].trim();
                    } else if (realIP) {
                        ipAddress = realIP;
                    }
                }

                const allowedIPs = process.env.ALLOWED_IP
                    ? process.env.ALLOWED_IP.split(',').map(ip => ip.trim()).filter(ip => ip)
                    : [];
                
                console.log(`IPアドレス: ${ipAddress}`);
                console.log(`許可されたIPアドレス: ${allowedIPs.join(', ')}`);

                if (allowedIPs.length > 0 && !allowedIPs.includes("0.0.0.0") && !allowedIPs.includes(ipAddress)) {
                    throw new Error("このIPアドレスからのログインは許可されていません");
                }

                // ブルートフォース対策
                const now = Date.now();
                if (!loginAttempts[ipAddress]) {
                    loginAttempts[ipAddress] = { count: 0, lastAttempt: now };
                }

                if (now - loginAttempts[ipAddress].lastAttempt > LOCKOUT_TIME) {
                    loginAttempts[ipAddress].count = 0;
                }

                if (loginAttempts[ipAddress].count >= MAX_ATTEMPTS) {
                    throw new Error(`ログイン試行回数が上限に達しました。${Math.ceil(LOCKOUT_TIME / 60000)}分後に再試行してください`);
                }

                loginAttempts[ipAddress].lastAttempt = now;
                loginAttempts[ipAddress].count++;

                if (credentials.password === process.env.AUTH_PASSWORD) {
                    loginAttempts[ipAddress].count = 0;
                    return {
                        id: '1',
                        name: 'authenticated'
                    };
                }

                throw new Error("パスワードが正しくありません");
            }
        })
    ],
    pages: {
        signIn: '/'
    }
}
