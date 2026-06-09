const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'remove',
  description: 'Entferne einen Song aus der Warteschlange',
  aliases: ['rm', 'delete'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Entferne einen Song aus der Warteschlange')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('Position des Songs in der Warteschlange')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    const position = interaction.options.getInteger('position') - 1;
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue.songs.length) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Leere Warteschlange', 'Die Warteschlange ist leer.')],
        ephemeral: true
      });
    }

    if (position < 0 || position >= queue.songs.length) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Ungültige Position', `Die Position muss zwischen 1 und ${queue.songs.length} liegen.`)],
        ephemeral: true
      });
    }

    const removed = client.music.remove(interaction.guild.id, position);

    await interaction.reply({
      embeds: [SakuraEmbed.info('Entfernt', `${config.emojis.music} **${removed.title}** wurde aus der Warteschlange entfernt.`)],
    });
  }
};
