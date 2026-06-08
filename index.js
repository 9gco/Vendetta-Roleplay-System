// ================= GLOBALER QUICK.DB V9 CONSTRUCTOR PATCH =================
const { QuickDB } = require('quick.db');

// Wir merken uns die ECHTE originale Tabellen-Funktion von QuickDB
const originalTableMethod = QuickDB.prototype.table;

// Wir erstellen eine zentrale, globale Instanz
const globalDbInstance = new QuickDB();

// Falls irgendwo versucht wird, "new (require('quick.db')).table()" zu nutzen:
const originalRequire = module.constructor.prototype.require;
module.constructor.prototype.require = function(path) {
    const moduleExport = originalRequire.apply(this, arguments);
    
    if (path === 'quick.db') {
        // Wir hängen eine gefakte Klasse ein, die das 'new'-Schlüsselwort abfängt
        moduleExport.table = class {
            constructor(tableName) {
                // Hier rufen wir die ORIGINALE Methode auf der globalen Instanz auf (keine Endlosschleife!)
                return originalTableMethod.call(globalDbInstance, tableName);
            }
        };
    }
    return moduleExport;
};
// ===========================================================================
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
let config = {};
   try {
       config = require('./config.json');
   } catch (e) {
       // Wenn die Datei auf Render fehlt, nutzen wir die Umgebungsvariablen
       config = {
           token: process.env.DISCORD_TOKEN,
           clientId: process.env.CLIENT_ID || "1513627285935231147",
           guildId: process.env.GUILD_ID || "1513659339662163968",
           prefix: "!"
       };
   }
const Logger = require('./utils/logger');
const EventHandler = require('./handlers/eventHandler');
const CommandHandler = require('./handlers/commandHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true,
  },
});

client.config = config;
client.Logger = Logger;

EventHandler.load(client);
CommandHandler.load(client);

client.login(config.token).catch((err) => {
  Logger.error(`Login fehlgeschlagen: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  Logger.error(`Unhandled Rejection: ${error.message}`);
});

process.on('uncaughtException', (error) => {
  Logger.error(`Uncaught Exception: ${error.message}`);
});
