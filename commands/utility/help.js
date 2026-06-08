const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'help',
  description: 'Zeigt alle verfügbaren Befehle',
  aliases: ['cmds', 'commands', 'hilfe'],
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Zeigt alle verfügbaren Befehle')
    .addStringOption(option =>
      option.setName('befehl')
        .setDescription('Zeige Hilfe zu einem bestimmten Befehl')
        .setRequired(false)),

  async execute(interaction, client) {
    const commandName = interaction.options.getString('befehl');

    if (commandName) {
      const command = client.slashCommands.get(commandName.toLowerCase());
      if (!command) {
        return interaction.reply({
          embeds: [SakuraEmbed.error('Nicht gefunden', `Der Befehl \`${commandName}\` existiert nicht.`)],
          ephemeral: true
        });
      }

      const embed = SakuraEmbed.custom({
        title: `${config.emojis.ribbon} Hilfe: /${command.name}`,
        color: config.colors.primary,
        fields: [
          { name: 'Beschreibung', value: command.description || 'Keine Beschreibung', inline: false },
          { name: 'Kategorie', value: `\`${command.category}\``, inline: true },
          { name: 'Aliase', value: command.aliases ? command.aliases.map(a => `\`${a}\``).join(', ') : 'Keine', inline: true },
        ],
      });

      return interaction.reply({ embeds: [embed] });
    }

    const categories = {
      moderation: `${config.emojis.shield} Moderation`,
      fun: `${config.emojis.star} Spaß`,
      utility: `${config.emojis.settings} Utility`,
      music: `${config.emojis.music} Musik`,
      system: `${config.emojis.crown} System`,
    };

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.sakura} Vendetta System – Hilfezentrum`,
      description: `Willkommen im Hilfezentrum! Wähle eine Kategorie aus dem Menü unten aus.\n\n${config.emojis.ribbon} Prefix: \`${config.prefix}\`\n${config.emojis.leaf} Gesamt: \`${client.slashCommands.size}\` Befehle`,
      color: config.colors.primary,
      fields: Object.entries(categories).map(([key, value]) => ({
        name: value,
        value: client.slashCommands.filter(cmd => cmd.category === key).map(cmd => `\`/${cmd.name}\``).join(', ') || 'Keine Befehle',
        inline: false,
      })),
      thumbnail: client.user.displayAvatarURL({ dynamic: true }),
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_categories')
      .setPlaceholder('Wähle eine Kategorie...')
      .addOptions(
        Object.entries(categories).map(([key, value]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(value.replace(/[^\w\säöüÄÖÜ]/g, '').trim())
            .setValue(key)
            .setDescription(`Zeige alle ${value.replace(/[^\w\säöüÄÖÜ]/g, '').trim()}-Befehle`)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
