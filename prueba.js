const qrcode = require('qrcode-terminal');
const exceljs = require('exceljs');
const moment = require('moment');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
});

client.on('ready', () => {
    console.log("Conexión exitosa!")
});

client.on('message', msg => {
    const { from, to, body } = msg;
    bodyLowerCase = body.toLowerCase();
    switch (bodyLowerCase) {
        case "certificado":
            sendMessage(from, "Recibimos tu petición, te informaremos cuando esté listo");
            break;
        case "hola":
            sendMessage(from, `Hola! Soy el chatbot del Centro de Formación profesional Nº401 'Laura Vicuña'.
                En qué puedo ayudarte hoy?
                
                Escribe:
                        - Certificado: Para solicitar un certificado
                        - Inscripción: Para inscribirte a un curso
                        - Cursos: Para ver los cursos disponibles
                    `);
            break;
        case "adios":
            sendMessage(from, "Adiós! Que tengas un buen día");
            break;
        case "gracias":
            sendMessage(from, "De nada! Estoy para ayudarte");
            break;
        case "inscripcion":
            sendMessage(from, "A qué curso desea inscribirse?")
            sendMessage(from, "Escriba Cursos para ver el listado de cursos disponibles")
        //default:
    }

    console.log(from, to, body);
    saveHistory(from, body);
});


const sendMessage = (to, message) => {
    client.sendMessage(to, message)
};

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
        const buffer = workbook.xlsx.writeBuffer();
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const blob = new Blob([buffer], { type: fileType });
        saveAs(blob, pathChat + EXCEL_EXTENSION);
    }
}


client.initialize();