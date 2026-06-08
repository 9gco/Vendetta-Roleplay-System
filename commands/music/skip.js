const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'skip',
  description: 'Überspringe den aktuellen Song',
  aliases: ['next', 's'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Überspringe den aktuellen Song'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    await interaction.reply({
      embeds: [SakuraEmbed.info('Song übersprungen', `${config.emojis.music} Der aktuelle Song wurde übersprungen.`)],
    });
  }
};
