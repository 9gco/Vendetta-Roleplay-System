const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'shuffle',
  description: 'Mische die Warteschlange',
  aliases: ['mix', 'random'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Mische die Warteschlange'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    const queue = client.music.getQueue(interaction.guild.id);
    if (queue.songs.length < 2) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Zu wenig Songs', 'Es müssen mindestens 2 Songs in der Warteschlange sein.')],
        ephemeral: true
      });
    }

    client.music.shuffle(interaction.guild.id);

    await interaction.reply({
      embeds: [SakuraEmbed.success('Gemischt', `${config.emojis.music} Die Warteschlange wurde gemischt.`)],
    });
  }
};
