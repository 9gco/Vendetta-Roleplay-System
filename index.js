const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const http = require('http');
const config = require('./config.json');

// 1. Web-Server für Render (verhindert 'No open ports')
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

// 3. Player initialisieren (client existiert hier bereits)
const player = new Player(client);

// 4. Extractor laden (Fix für: loadDefault is no longer supported)
async function initPlayer() {
    await player.extractors.loadMulti(DefaultExtractors);
    console.log("🎵 Musik-Player und Extractor geladen.");
}
initPlayer();

// HIER: Event-Handler und Command-Handler einfügen, falls vorhanden.
// Beispiel für Event-Import (falls du einen hast):
// require('./src/handlers/eventHandler')(client);

// 5. Login
client.login(config.TOKEN);