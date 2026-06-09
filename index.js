const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');
const { Player } = require('discord-player');
const http = require('http');
const config = require('./config.json');

// 1. Web-Server (für Render notwendig)
http.createServer((req, res) => {
  res.end('Bot ist online!');
}).listen(process.env.PORT || 3000);

// 2. Client initialisieren
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 3. Player initialisieren (NACH dem Client, damit 'client' existiert)
const player = new Player(client);

// 4. Player-Extractor laden
async function initPlayer() {
    await player.extractors.loadDefault();
}
initPlayer();

// 5. Login
client.login(config.TOKEN);