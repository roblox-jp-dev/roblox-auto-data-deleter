import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req });
    const isLoginPage = req.nextUrl.pathname === '/';
    const isLogoutRequest = req.nextUrl.pathname === '/logout';

    // ログアウト処理
    if (isLogoutRequest) {
        const response = NextResponse.redirect(new URL('/', req.url));
        // セッションクッキーをクリア
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete('__Secure-next-auth.session-token');
        return response;
    }

    // ログインしていない場合の処理
    if (!token) {
        if (!isLoginPage) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    // ログイン済みの場合の処理
    if (isLoginPage || req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/logout', '/dashboard/:path*', '/api/error/:path*', '/api/history/:path*', '/api/error/:path*', '/api/setting/:path*']
}