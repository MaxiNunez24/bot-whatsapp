const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const exceljs = require('exceljs')
const moment = require('moment')

const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    // Si existe cargamos el archivo con las credenciales
    console.log('Cargando sesión...');
    sessionData = require(SESSION_FILE_PATH);

    client = new Client({
        session: sessionData
    })

    client.on('ready', () => {
        console.log('Cliente está listo!');
        listenMessage();
    })

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

        switch (body) {
            case "Quiero un certificado":
                sendMessage(from, "Recibimos tu petición, te informaremos cuando esté listo");
                break;
            case "Hola":
                sendMessage(from, "Hola! ¿En qué puedo ayudarte?");
                break;
            case "Adiós":
                sendMessage(from, "Adiós! Que tengas un buen día");
                break;
            case "Gracias":
                sendMessage(from, "De nada! Estoy para ayudarte");
                break;
        }

        console.log(from, to, body);
        sendMessage(from, "Hola! Funciona el bot!")

        saveHistory(from, body);
    });
};

const sendMessage = (to, message) => {

    client.sendMessage(to, message)
}

const saveHistory = (number, message) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new exceljs.Workbook();
    const today = moment().format('DD-MM-YYYY hh:mm')

    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
            .then(() => {
                const worksheet = workbook.getWorksheet(1);
                const lastRow = worksheet.lastRow;
                let getRowInsert = worksheet.getRow(++(lastRow.number))
                getRowInsert.getCell('A').value = today;
                getRowInsert.getCell('B').value = message;
                getRowInsert.commit();
                workbook.xlsx.writeFile(pathChat)
                    .then(() => {
                        console.log('Chat agregado con éxito!')
                    })
                    .catch(() => {
                        console.log('Algo salió mal con el guardado!')
                    })
            })
    } else {
        const worksheet = workbook.addWorksheet('Chats')
        worksheet.columns = [
            { header: 'Fecha', key: 'date' },
            { header: 'Mensaje', key: message },
        ]
        worksheet.addRow([today, message])
        workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log('Historial creado!')
            })
            .catch(() => {
                console.log('Algo ha fallado!');
            })
    }
}

// Verificamos si existe el archivo de sesión
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withoutSession();