import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email non valida'),
    password: z.string().min(1, 'Password obbligatoria'),
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Nome obbligatorio'),
    email: z.string().email('Email non valida'),
    password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
    area: z.enum(['CDA', 'Marketing', 'IT', 'Commerciale']).optional(),
    managerCode: z.string().optional(),
});

export function validateBody(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.errors.map((e) => e.message).join('; ');
            return res.status(400).json({ error: msg });
        }
        req.body = parsed.data;
        next();
    };
}
