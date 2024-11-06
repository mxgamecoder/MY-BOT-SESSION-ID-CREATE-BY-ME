const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { sendWelcomeMessage } = require('./sendWelcomeMessage'); // Import the function

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
        browser: ["Chrome", "MacOS", "10.15.7"],
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('Connection successful');
            sendWelcomeMessage(sock, '2349021506036', state.creds); // Pass credentials to send as message
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Disconnected. Attempting to reconnect...', shouldReconnect);

            if (shouldReconnect) {
                setTimeout(startBot, 3000);
            }
        }
    });

    await sock.ev.on('creds.update', saveCreds);
}

startBot();
