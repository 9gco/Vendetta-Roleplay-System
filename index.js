const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor'); // Neu für V7+
const http = require('http');
const config = require('./config.json');

// 1. Web-Server
http.createServer((req, res) => { res.end('Bot online'); }).listen(process.env.PORT || 3000);

// 2. Client initialisieren
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// 3. Player JETZT initialisieren (client existiert jetzt)
const player = new Player(client);

// 4. Extractor korrekt laden (loadMulti statt loadDefault)
async function initPlayer() {
    await player.extractors.loadMulti(DefaultExtractors);
}
initPlayer();

// 5. Login
client.login(config.TOKEN);