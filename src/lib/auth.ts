import Credentials from 'next-auth/providers/credentials';

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
                    return null;
                }
                
                // IP address check
                const ipAddress = req?.headers?.["x-forwarded-for"] || 
                                 "";
                
                const allowedIPs = process.env.ALLOWED_IP ? 
                                  process.env.ALLOWED_IP.split(',').map(ip => ip.trim()) : 
                                  [];
                
                if (allowedIPs.length > 0 && !allowedIPs.includes(String(ipAddress))) {
                    console.log(`Access denied: IP ${ipAddress} is not allowed`);
                    return null;
                }
                
                if (credentials.password === process.env.AUTH_PASSWORD) {
                    return {
                        id: '1',
                        name: 'authenticated'
                    };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: '/'
    }
}
