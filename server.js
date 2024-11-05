const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

let bot;

// Endpoint to generate a QR code
app.get('/generate-qr', async (req, res) => {
    try {
            const { version, isLatest } = await fetchLatestBaileysVersion();
                    const { state, saveCreds } = await useMultiFileAuthState('./sessions');

                            bot = makeWASocket({
                                        version,
                                                    auth: state,
                                                                printQRInTerminal: false, // Prevents QR from showing in terminal
                                                                        });

                                                                                bot.ev.on('connection.update', async (update) => {
                                                                                            const { qr } = update;
                                                                                                        if (qr) {
                                                                                                                        const qrCodeImage = await QRCode.toDataURL(qr);
                                                                                                                                        res.json({ qrCode: qrCodeImage });
                                                                                                                                                    }
                                                                                                                                                            });

                                                                                                                                                                    bot.ev.on('creds.update', saveCreds);
                                                                                                                                                                        } catch (error) {
                                                                                                                                                                                console.error('Error generating QR code:', error);
                                                                                                                                                                                        res.status(500).json({ error: 'Failed to generate QR code' });
                                                                                                                                                                                            }
                                                                                                                                                                                            });

                                                                                                                                                                                            // Endpoint to generate pairing code
                                                                                                                                                                                            app.post('/generate-pairing-code', async (req, res) => {
                                                                                                                                                                                                try {
                                                                                                                                                                                                        const { phoneNumber } = req.body;
                                                                                                                                                                                                                if (!phoneNumber) {
                                                                                                                                                                                                                            return res.status(400).json({ error: 'Phone number is required' });
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                            const { version, isLatest } = await fetchLatestBaileysVersion();
                                                                                                                                                                                                                                                    const { state, saveCreds } = await useMultiFileAuthState('./sessions');

                                                                                                                                                                                                                                                            bot = makeWASocket({
                                                                                                                                                                                                                                                                        version,
                                                                                                                                                                                                                                                                                    auth: state,
                                                                                                                                                                                                                                                                                                printQRInTerminal: false, // Prevents QR from showing in terminal
                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                const pairingCode = await bot.requestPairingCode(phoneNumber);
                                                                                                                                                                                                                                                                                                                        const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;

                                                                                                                                                                                                                                                                                                                                res.json({ pairingCode: formattedCode });

                                                                                                                                                                                                                                                                                                                                        bot.ev.on('creds.update', saveCreds);
                                                                                                                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                                                                                                                    console.error('Error generating pairing code:', error);
                                                                                                                                                                                                                                                                                                                                                            res.status(500).json({ error: 'Failed to generate pairing code' });
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                                                                // Endpoint to handle disconnect and cleanup
                                                                                                                                                                                                                                                                                                                                                                app.get('/disconnect', (req, res) => {
                                                                                                                                                                                                                                                                                                                                                                    if (bot) {
                                                                                                                                                                                                                                                                                                                                                                            bot.end();
                                                                                                                                                                                                                                                                                                                                                                                    fs.rmSync('./sessions', { recursive: true, force: true });
                                                                                                                                                                                                                                                                                                                                                                                            res.json({ message: 'Disconnected and session cleared' });
                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                        res.status(400).json({ error: 'Bot not connected' });
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                                                                                                                            // Start the server
                                                                                                                                                                                                                                                                                                                                                                                                            app.listen(PORT, () => {
                                                                                                                                                                                                                                                                                                                                                                                                                console.log(`Server running on http://localhost:${PORT}`);
                                                                                                                                                                                                                                                                                                                                                                                                                });