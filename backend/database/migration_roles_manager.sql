-- Aggiunge Manager al constraint ruoli (allineamento codice eventi / registrazione)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN (
    'Socio', 'Responsabile', 'Admin', 'Presidente', 'CDA', 'Tesoreria',
    'Marketing', 'Commerciale', 'IT', 'Audit', 'Manager'
));
