const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');
let config = {};
   try {
       config = require('../config.json');
   } catch (e) {
       config = {
           token: process.env.DISCORD_TOKEN,
           clientId: process.env.CLIENT_ID || "1513627285935231147",
           guildId: process.env.GUILD_ID || "1513659339662163968",
           prefix: "!"
       };
   }
const { SakuraEmbed } = require('../utils/embedBuilder');
const { Collection } = require('discord.js');

class CommandHandler {
  static load(client) {
    client.commands = new Collection();
    client.slashCommands = new Collection();
    client.categories = [];

    const categories = ['moderation', 'fun', 'utility', 'music', 'system'];

    for (const category of categories) {
      const categoryPath = path.join(__dirname, '..', 'commands', category);
      if (!fs.existsSync(categoryPath)) continue;

      const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);

        if (!command.name) {
          Logger.warn(`Befehl in ${filePath} hat keinen Namen und wird übersprungen.`);
          continue;
        }

        command.category = category;
        client.commands.set(command.name, command);
        client.slashCommands.set(command.name, command);

        if (command.aliases) {
          for (const alias of command.aliases) {
            client.commands.set(alias, command);
          }
        }

        if (!client.categories.includes(category)) {
          client.categories.push(category);
        }

        Logger.debug(`Befehl geladen: ${command.name} [${category}]`);
      }
    }

    Logger.success(`${client.slashCommands.size} Befehle erfolgreich geladen ${'🌸'}`);
  }

  static async handlePrefix(message, client) {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
      return message.reply({
        embeds: [SakuraEmbed.error('Nicht verfügbar', 'Dieser Befehl kann nur auf einem Server verwendet werden.')]
      });
    }

    if (command.ownerOnly && !config.owners.includes(message.author.id)) {
      return message.reply({
        embeds: [SakuraEmbed.error('Kein Zugriff', 'Dieser Befehl ist nur für Bot-Besitzer verfügbar.')]
      });
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      Logger.error(`Fehler bei ${commandName}: ${error.message}`);
      message.reply({
        embeds: [SakuraEmbed.error('Befehlsfehler', 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.')]
      });
    }
  }

  static async handleSlash(interaction, client) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    if (command.ownerOnly && !config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Zugriff', 'Dieser Befehl ist nur für Bot-Besitzer verfügbar.')],
        ephemeral: true
      });
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      Logger.error(`Fehler bei /${interaction.commandName}: ${error.message}`);
      const embed = SakuraEmbed.error('Befehlsfehler', 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }
}

module.exports = CommandHandler;
