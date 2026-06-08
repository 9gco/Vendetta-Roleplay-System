const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const Logger = require('../utils/logger');

const commands = [];
const categories = ['moderation', 'fun', 'utility', 'music', 'system'];

for (const category of categories) {
  const categoryPath = path.join(__dirname, '..', 'commands', category);
  if (!fs.existsSync(categoryPath)) continue;

  const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    const command = require(filePath);
    if (command.data) {
      commands.push(command.data.toJSON());
      Logger.debug(`Slash-Command registriert: ${command.name}`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    Logger.startup('🌸 Starte Deployment der Slash-Commands...');

    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );

    Logger.success(`${commands.length} Slash-Commands erfolgreich deployed!`);
    Logger.info(`Server: ${config.guildId}`);
  } catch (error) {
    Logger.error(`Deployment fehlgeschlagen: ${error.message}`);
  }
})();
