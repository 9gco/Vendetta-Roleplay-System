const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'volume',
  description: 'Stelle die Lautstärke ein (0-200)',
  aliases: ['vol', 'v'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Stelle die Lautstärke ein (0-200)')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Lautstärke (0-200)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(200)),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    const level = interaction.options.getInteger('level');
    const newVol = client.music.setVolume(interaction.guild.id, level);

    await interaction.reply({
      embeds: [SakuraEmbed.success('Lautstärke geändert', `${config.emojis.music} Lautstärke auf \`${newVol}%\` gesetzt.`)],
    });
  }
};
