export class AppError extends Error {
    constructor(message, status = 500, code = undefined) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
    }
}

export function assertFound(row, message = 'Risorsa non trovata') {
    if (!row) throw new AppError(message, 404);
    return row;
}
