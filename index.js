// ================= SLASH-COMMANDS DIREKT ZU DISCORD ERZWINGEN =================
(async () => {
    try {
        Logger.info('Starte die Registrierung der Slash-Commands bei Discord...');
        
        const rest = new REST({ version: '10' }).setToken(finalToken);
        const commandsJson = [];

        // Wir nutzen AUSSCHLIESSLICH die erfolgreich vom CommandHandler geladenen Befehle
        if (client.commands && client.commands.size > 0) {
            client.commands.forEach(cmd => {
                if (cmd.data && typeof cmd.data.toJSON === 'function') {
                    commandsJson.push(cmd.data.toJSON());
                }
            });
        }

        Logger.info(`${commandsJson.length} erfolgreich geladene Befehle für Discord vorbereitet.`);

        if (commandsJson.length > 0) {
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commandsJson },
            );
            Logger.success('🌸 ALLE BEFEHLE ERFOLGREICH BEI DISCORD REGISTRIERT! 🌸');
        } else {
            Logger.warn('Noch keine Befehle in client.commands registriert.');
        }
    } catch (error) {
        Logger.error(`Fehler beim Registrieren der Befehle: ${error.message}`);
    }
})();
// =============================================================================