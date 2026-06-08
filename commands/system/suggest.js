const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed, SakuraButtons } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'suggest',
  description: 'Erstelle einen Vorschlag für den Server',
  aliases: ['vorschlag', 'suggestion', 'idea'],
  category: 'system',
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Erstelle einen Vorschlag für den Server')
    .addStringOption(option =>
      option.setName('titel')
        .setDescription('Titel deines Vorschlags')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('beschreibung')
        .setDescription('Beschreibung deines Vorschlags')
        .setRequired(true)),

  async execute(interaction, client) {
    const title = interaction.options.getString('titel');
    const description = interaction.options.getString('beschreibung');

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.star} ${title}`,
      description: description,
      color: config.colors.secondary,
      author: { name: `Vorschlag von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
      footer: { text: `Server: ${interaction.guild.name} • ID: ${interaction.id}` },
    });

    const buttons = SakuraButtons.row(
      SakuraButtons.success('suggest_yes', 'Dafür', '👍'),
      SakuraButtons.danger('suggest_no', 'Dagegen', '👎')
    );

    const msg = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true });
    await msg.react('👍');
    await msg.react('👎');

    await interaction.followUp({
      embeds: [SakuraEmbed.success('Vorschlag erstellt', 'Dein Vorschlag wurde erfolgreich erstellt.')],
      ephemeral: true
    });
  }
};
