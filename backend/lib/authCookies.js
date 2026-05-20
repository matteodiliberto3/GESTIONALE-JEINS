const isProduction = process.env.NODE_ENV === 'production';

const baseCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
};

export function accessCookieOptions() {
    const maxAge = parseInt(process.env.ACCESS_TOKEN_MAX_AGE_MS || `${15 * 60 * 1000}`, 10);
    return { ...baseCookie, maxAge };
}

export function refreshCookieOptions() {
    const maxAge = parseInt(process.env.REFRESH_TOKEN_MAX_AGE_MS || `${7 * 24 * 60 * 60 * 1000}`, 10);
    return { ...baseCookie, maxAge };
}

export function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, accessCookieOptions());
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());
}

export function clearAuthCookies(res) {
    const clearOpts = { path: '/', httpOnly: true, secure: isProduction, sameSite: baseCookie.sameSite };
    res.clearCookie('access_token', clearOpts);
    res.clearCookie('refresh_token', clearOpts);
}

export function extractBearerOrCookie(req, cookieName = 'access_token') {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return req.cookies?.[cookieName] || null;
}
