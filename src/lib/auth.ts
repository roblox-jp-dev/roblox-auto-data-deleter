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
                
                const forwardedFor = req?.headers?.["x-forwarded-for"] || "";
                const ipAddress = Array.isArray(forwardedFor) 
                                  ? forwardedFor[0]?.split(',')[0].trim() 
                                  : String(forwardedFor).split(',')[0].trim();
                
                const allowedIPs = process.env.ALLOWED_IPS
                    ? process.env.ALLOWED_IPS.split(',').map(ip => ip.trim()).filter(ip => ip)
                    : [];
                
                console.log(`IP check: Current IP: ${ipAddress}, Allowed IPs: ${allowedIPs.join(', ')}`);
                
                if (allowedIPs.length > 0 && !allowedIPs.includes(ipAddress)) {
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
