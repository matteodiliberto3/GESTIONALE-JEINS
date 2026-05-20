/**
 * Genera l'hash bcrypt da mettere in ELEVATED_REGISTRATION_CODE_HASH.
 *
 * Uso (la password NON va committata):
 *   node scripts/hash-elevated-registration-code.js
 *   node scripts/hash-elevated-registration-code.js "tua-password-segreta"
 *
 * Oppure:
 *   set ELEVATED_REGISTRATION_CODE_PLAIN=tua-password && node scripts/hash-elevated-registration-code.js
 */

import bcrypt from 'bcrypt';
import readline from 'readline';

const SALT_ROUNDS = 10;

async function readFromStdin() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    return new Promise((resolve) => {
        rl.question('Inserisci il codice di registrazione elevata: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    const plain =
        process.argv[2] ||
        process.env.ELEVATED_REGISTRATION_CODE_PLAIN ||
        (process.stdin.isTTY ? await readFromStdin() : '');

    if (!plain || !String(plain).trim()) {
        console.error('Nessun codice fornito.');
        process.exit(1);
    }

    const hash = await bcrypt.hash(String(plain).trim(), SALT_ROUNDS);

    console.log('\nAggiungi al file .env (backend) o alle variabili Render:\n');
    console.log(`ELEVATED_REGISTRATION_CODE_HASH=${hash}`);
    console.log('ELEVATED_REGISTRATION_ROLE=CDA');
    console.log('\nNon committare la password in chiaro.\n');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
