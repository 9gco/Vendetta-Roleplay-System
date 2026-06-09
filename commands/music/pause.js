const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'pause',
  description: 'Pausiere die aktuelle Wiedergabe',
  aliases: ['hold'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausiere die aktuelle Wiedergabe'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue.playing || !queue.currentSong) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Wiedergabe', 'Es wird gerade keine Musik abgespielt.')],
        ephemeral: true
      });
    }

    client.music.pause(interaction.guild.id);

    await interaction.reply({
      embeds: [SakuraEmbed.info('Pausiert', `${config.emojis.music} Die Wiedergabe wurde pausiert.`)],
    });
  }
};
