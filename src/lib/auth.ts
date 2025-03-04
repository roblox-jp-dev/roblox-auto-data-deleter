import Credentials from 'next-auth/providers/credentials';

const loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};

// Configuration
const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);  // Maximum login attempts
const LOCKOUT_TIME = parseInt(process.env.LOGIN_ATTEMPTS_TIMEOUT || '15', 10) * 60 * 1000;  // Lockout time (15 minutes)

export const authOptions = {
    providers: [
        Credentials({
            name: 'Password',
            credentials: {
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials, req) {
                if (!credentials?.password) {
                    throw new Error("Please enter a password");
                }

                // Get IP address from request headers
                let ipAddress = "127.0.0.1";
                if (req && req.headers) {
                    // Check X-Forwarded-For, X-Real-IP, or remote address
                    const forwardedFor = req.headers['x-forwarded-for'] as string;
                    const realIP = req.headers['x-real-ip'] as string;
                    
                    if (forwardedFor) {
                        // Use the first IP if comma-separated
                        ipAddress = forwardedFor.split(',')[0].trim();
                    } else if (realIP) {
                        ipAddress = realIP;
                    }
                }

                const allowedIPs = process.env.ALLOWED_IP
                    ? process.env.ALLOWED_IP.split(',').map(ip => ip.trim()).filter(ip => ip)
                    : [];
                
                console.log(`IP Address: ${ipAddress}`);
                console.log(`Allowed IP Addresses: ${allowedIPs.join(', ')}`);

                if (allowedIPs.length > 0 && !allowedIPs.includes("0.0.0.0") && !allowedIPs.includes(ipAddress)) {
                    throw new Error("Login from this IP address is not allowed");
                }

                // Brute force protection
                const now = Date.now();
                if (!loginAttempts[ipAddress]) {
                    loginAttempts[ipAddress] = { count: 0, lastAttempt: now };
                }

                if (now - loginAttempts[ipAddress].lastAttempt > LOCKOUT_TIME) {
                    loginAttempts[ipAddress].count = 0;
                }

                if (loginAttempts[ipAddress].count >= MAX_ATTEMPTS) {
                    throw new Error(`Maximum login attempts reached. Please try again in ${Math.ceil(LOCKOUT_TIME / 60000)} minutes`);
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

                throw new Error("Incorrect password");
            }
        })
    ],
    pages: {
        signIn: '/'
    }
}
