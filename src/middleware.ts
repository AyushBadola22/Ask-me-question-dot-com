import {  NextRequest , NextResponse } from "next/server";
export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt";


export async function middleware(request : NextRequest) {


    const token = await getToken({req : request})
    const url = request.nextUrl

    if(token && (
        url.pathname === '/sign-in' ||
        url.pathname === '/sign-up' || 
        url.pathname === '/verify' ||
        url.pathname === '/'  
    )){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if(!token && url.pathname.startsWith('/dashboard')){
        return NextResponse.redirect(new URL('/', request.url)); 
    }   

    return NextResponse.next(); 
    
}

export const config = {
    matcher : [
        '/auth/sign-in', 
        '/sign-up', 
        '/', 
        '/dashboard/:path*', 
        '/verify/:path*'
    ]
}