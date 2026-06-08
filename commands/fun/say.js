const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'say',
  description: 'Lass den Bot eine Nachricht senden',
  aliases: ['echo', 'repeat'],
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Lass den Bot eine Nachricht senden')
    .addStringOption(option =>
      option.setName('nachricht')
        .setDescription('Die Nachricht die gesendet werden soll')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('embed')
        .setDescription('Als Embed senden?')
        .setRequired(false)),

  async execute(interaction, client) {
    const message = interaction.options.getString('nachricht');
    const asEmbed = interaction.options.getBoolean('embed') || false;

    await interaction.reply({
      embeds: [SakuraEmbed.success('Nachricht gesendet', `${config.emojis.sakura} Deine Nachricht wurde gesendet.`)],
      ephemeral: true
    });

    if (asEmbed) {
      await interaction.channel.send({
        embeds: [SakuraEmbed.custom({
          title: `${config.emojis.ribbon} ${interaction.user.username} sagt:`,
          description: message,
          color: config.colors.primary,
          footer: { text: `Gesendet von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
        })]
      });
    } else {
      await interaction.channel.send(message);
    }
  }
};
