import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Troppi tentativi di login. Riprova tra 15 minuti.' },
    skip: () => process.env.NODE_ENV === 'test',
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Troppi tentativi di registrazione. Riprova più tardi.' },
    skip: () => process.env.NODE_ENV === 'test',
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Troppe richieste. Riprova tra poco.' },
    skip: () => process.env.NODE_ENV === 'test',
});
