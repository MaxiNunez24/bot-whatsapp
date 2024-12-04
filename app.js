const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    // Si existe cargamos el archivo con las credenciales
    console.log('Cargando sesión...');
    sessionData = require(SESSION_FILE_PATH);

    client = new Client({
        session: sessionData
    });

    client.on('ready', () => {
        console.log('Cliente está listo!');
        listenMessage();
    });

    client.on('auth_failure', () => {
        console.log('** Error de autenticación vuelve a generar el QRCODE (Borrar el archivo session.js) **');
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
        // Guardamos credenciales de la sesión para usar luego
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
    client.on('message', msg => {
        const { from, to, body } = msg;
        console.log(from, to, body);
    });
};

// Verificamos si existe el archivo de sesión
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withoutSession();