const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'resume',
  description: 'Setze die Wiedergabe fort',
  aliases: ['unpause', 'continue'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Setze die Wiedergabe fort'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue.currentSong) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Wiedergabe', 'Es wird gerade keine Musik abgespielt.')],
        ephemeral: true
      });
    }

    client.music.resume(interaction.guild.id);

    await interaction.reply({
      embeds: [SakuraEmbed.success('Fortgesetzt', `${config.emojis.music} Die Wiedergabe wurde fortgesetzt.`)],
    });
  }
};
