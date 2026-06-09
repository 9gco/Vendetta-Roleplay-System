// ================= GLOBALER QUICK.DB V9 CONSTRUCTOR PATCH =================
const { QuickDB } = require('quick.db');

const originalTableMethod = QuickDB.prototype.table;
const globalDbInstance = new QuickDB();

const originalRequire = module.constructor.prototype.require;
module.constructor.prototype.require = function(path) {
    const moduleExport = originalRequire.apply(this, arguments);
    
    if (path === 'quick.db') {
        moduleExport.table = class {
            constructor(tableName) {
                return originalTableMethod.call(globalDbInstance, tableName);
            }
        };
    }
    return moduleExport;
};
// ===========================================================================
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');
const Logger = require('./utils/logger');

let config = {};
try {
    config = require('./config.json');
} catch (e) {
    config = {};
}

const finalToken = process.env.DISCORD_TOKEN || config.token;
config.clientId = process.env.CLIENT_ID || config.clientId || "1513627285935231147";
config.guildId = process.env.GUILD_ID || config.guildId || "1513659339662163968";
config.prefix = config.prefix || "!";

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

client.commands = new Collection();
client.config = config;
client.Logger = Logger;

// 1. Zuerst laden wir die Events und Befehle in den Bot
EventHandler.load(client);
CommandHandler.load(client);

// 2. Sobald der Bot bereit ist, registrieren wir NUR die geladenen Befehle bei Discord
client.once('ready', async () => {
    try {
        Logger.info('Starte die Registrierung der Slash-Commands bei Discord...');
        
        const rest = new REST({ version: '10' }).setToken(finalToken);
        const commandsJson = [];

        // Wir nutzen AUSSCHLIESSLICH die Befehle, die der CommandHandler erfolgreich akzeptiert hat!
        if (client.commands && client.commands.size > 0) {
            client.commands.forEach(cmd => {
                if (cmd.data && typeof cmd.data.toJSON === 'function') {
                    commandsJson.push(cmd.data.toJSON());
                }
            });
        }

        Logger.info(`${commandsJson.length} verifizierte Befehle für Discord vorbereitet.`);

        if (commandsJson.length > 0) {
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commandsJson },
            );
            Logger.success('🌸 ALLE BEFEHLE ERFOLGREICH BEI DISCORD REGISTRIERT! 🌸');
        } else {
            Logger.warn('Keine gültigen Befehle im client.commands gefunden.');
        }
    } catch (error) {
        Logger.error(`Fehler beim Registrieren der Befehle: ${error.message}`);
    }
});

if (!finalToken || finalToken === "") {
  Logger.error("✖ ERROR: Kein Token gefunden!");
  process.exit(1);
}

client.login(finalToken).catch((err) => {
  Logger.error(`Login fehlgeschlagen: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  Logger.error(`Unhandled Rejection: ${error.message}`);
});

process.on('uncaughtException', (error) => {
  Logger.error(`Uncaught Exception: ${error.message}`);
});