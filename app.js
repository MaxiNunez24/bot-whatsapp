import { Client } from 'whatsapp-web.js';
import ora from 'ora';
import fs from 'fs';
import qrcode from 'qrcode-terminal';

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    // Si existe cargamos el archivo con las credenciales
    const spinner = ora('Cargando sesión...').start();
    sessionData = require(SESSION_FILE_PATH);
    spinner.succeed();

    client = new Client({
        session: sessionData
    });

    client.on('ready', () => {
        console.log('Cliente está listo!');
        listenMessage();
    });

    client.on('auth_failure', () => {
        console.log('Error de autenticación, generando nuevo QR...');
        fs.unlinkSync(SESSION_FILE_PATH);
        withoutSession();
    });

    client.initialize();
};

const withoutSession = () => {
    console.log('No se encontró sesión guardada, generando QR...');
    client = new Client();

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });

    client.initialize();
};

const listenMessage = () => {
    client.on('message', async msg => {
        const { from, to, body } = msg;
        console.log(from, to, body);
        if (body === 'Hola') {
            client.sendMessage(from, 'Hola, ¿Cómo estás?');
        }
    });
};

// Verificamos si existe el archivo de sesión
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withoutSession();

export default withSession;