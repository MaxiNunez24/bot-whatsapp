const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
});

client.on('ready', () => {
    console.log("Conexión exitosa!")
});

client.on('message', message => {
    const { from, to, body } = message;
    console.log(from, to, body);
    switch (body) {
        case ["hola", "Hola", "ola", "buenas", "Buenas"]:
            sendMessage(from, "Hola! En qué puedo ayudarte?")
            break;
        case "adiós":
            sendMessage(from, "Nos vemos pronto!")
            break;
        case body.toLowerCase().includes("certificado"):
            sendMessage(from, "Estamos preparando su certificado. Le avisaremos cuando esté disponible.")
            break;
        default:
            `Bienvenido al Centro de Formación Profesional Nº401 "Laura Vicuña"!
            
            En qué puedo ayudarle?
            
            Escriba:

            - Certificado
            - Cursos
            - Información
            `
    }
});

const sendMessage = (to, message) => {
    client.sendMessage(to, message)
};

client.initialize();