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
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');

let config = {};
try {
    config = require('./config.json');
} catch (e) {
    // Falls absolut keine config.json existiert
    config = {};
}

// WASSERDICHTER FALLBACK: Wenn config.token leer oder nicht da ist, nimm process.env
const finalToken = process.env.DISCORD_TOKEN || config.token;
config.clientId = process.env.CLIENT_ID || config.clientId || "1513627285935231147";
config.guildId = process.env.GUILD_ID || config.guildId || "1513659339662163968";
config.prefix = config.prefix || "!";

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

// WICHTIG: Erstellt die Liste für die Befehle, falls der Handler sie dort speichern will
client.commands = new Collection();
client.config = config;
client.Logger = Logger;

// Handler ausführen
EventHandler.load(client);
CommandHandler.load(client);

// ================= SLASH-COMMANDS DIREKT ZU DISCORD ERZWINGEN =================
(async () => {
    try {
        Logger.info('Starte die Registrierung der Slash-Commands bei Discord...');
        
        const rest = new REST({ version: '10' }).setToken(finalToken);
        const commandsJson = [];

        // Wir prüfen erst client.commands, falls der Handler sie dort abgelegt hat
        if (client.commands && client.commands.size > 0) {
            client.commands.forEach(cmd => {
                if (cmd.data && typeof cmd.data.toJSON === 'function') {
                    commandsJson.push(cmd.data.toJSON());
                }
            });
        }

        // Falls der CommandHandler die Befehle anders speichert, laden wir sie zur Sicherheit direkt aus den Dateien nach
        if (commandsJson.length === 0) {
            const fs = require('fs');
            const path = require('path');
            const commandsPath = path.join(__dirname, 'commands');
            
            if (fs.existsSync(commandsPath)) {
                const commandFolders = fs.readdirSync(commandsPath);
                for (const folder of commandFolders) {
                    const folderPath = path.join(commandsPath, folder);
                    if (fs.statSync(folderPath).isDirectory()) {
                        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                        for (const file of commandFiles) {
                            const filePath = path.join(folderPath, file);
                            const command = require(filePath);
                            if (command.data && typeof command.data.toJSON === 'function') {
                                commandsJson.push(command.data.toJSON());
                            }
                        }
                    }
                }
            }
        }

        Logger.info(`${commandsJson.length} Befehle für die Registrierung bei Discord vorbereitet.`);

        if (commandsJson.length > 0) {
            // Sendet die Befehle direkt an deinen Server via IDs
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commandsJson },
            );
            Logger.success('🌸 ALLE BEFEHLE ERFOLGREICH BEI DISCORD REGISTRIERT! 🌸');
        } else {
            Logger.warn('Es wurden keine gültigen Slash-Commands im Projektordner gefunden.');
        }
    } catch (error) {
        Logger.error(`Fehler beim Registrieren der Befehle: ${error.message}`);
    }
})();
// =============================================================================

// Nutzt jetzt garantiert das Render-Token, falls die config.json leer ist
if (!finalToken || finalToken === "") {
  Logger.error("✖ ERROR: Weder in config.json noch in den Render Environment Variablen wurde ein Token gefunden!");
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