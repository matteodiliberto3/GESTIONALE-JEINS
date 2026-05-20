const isProd = process.env.NODE_ENV === 'production';

export function requestLog(req, res, next) {
    if (isProd && req.path === '/health') return next();

    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
    });
    next();
}

export function requestBodyLog(req, res, next) {
    if (isProd) return next();
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && req.body) {
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '***';
        if (bodyCopy.managerCode) bodyCopy.managerCode = '***';
        console.log('   Body:', JSON.stringify(bodyCopy).substring(0, 200));
    }
    next();
}
