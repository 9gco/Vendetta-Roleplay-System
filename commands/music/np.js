const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'np',
  description: 'Zeige den aktuell laufenden Song',
  aliases: ['nowplaying', 'current', 'now'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('np')
    .setDescription('Zeige den aktuell laufenden Song'),

  async execute(interaction, client) {
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue.playing || !queue.currentSong) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Wiedergabe', 'Es wird gerade keine Musik abgespielt.')],
        ephemeral: true
      });
    }

    const song = queue.currentSong;
    const progress = client.music.createProgressBar(0, song.duration);
    const duration = client.music.getFormattedDuration(song.duration);

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.music} Jetzt läuft`,
      description: `[${song.title}](${song.url})\n\n\`${progress}\`\n\nDauer: \`${duration}\`\nVolume: \`${queue.volume}%\`\nLoop: \`${queue.loopMode}\`\nAngefordert von: ${song.requester}`,
      color: config.colors.secondary,
      thumbnail: song.thumbnail,
    });

    await interaction.reply({ embeds: [embed] });
  }
};
