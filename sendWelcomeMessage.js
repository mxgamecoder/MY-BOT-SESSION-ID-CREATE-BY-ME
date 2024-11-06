// File: sendWelcomeMessage.js
async function sendWelcomeMessage(sock, number, creds) {
    const message = `Connection successful! Your bot is now active.\n\nSession ID:\n${JSON.stringify(creds, null, 2)}`;
    await sock.sendMessage(number + '@s.whatsapp.net', {
        text: message
    });
}

module.exports = { sendWelcomeMessage };
