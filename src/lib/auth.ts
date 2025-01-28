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
            async authorize(credentials) {
                if (!credentials?.password) {
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
