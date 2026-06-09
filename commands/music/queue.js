const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'queue',
  description: 'Zeige die aktuelle Warteschlange',
  aliases: ['q', 'playlist'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Zeige die aktuelle Warteschlange'),

  async execute(interaction, client) {
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue.songs.length && !queue.currentSong) {
      return interaction.reply({
        embeds: [SakuraEmbed.info('Warteschlange leer', 'Die Warteschlange ist leer. Füge Songs mit `/play` hinzu.')],
        ephemeral: true
      });
    }

    const embed = SakuraEmbed.base()
      .setTitle(`${config.emojis.music} Warteschlange`)
      .setColor(config.colors.secondary);

    if (queue.currentSong) {
      const progress = client.music.createProgressBar(0, queue.currentSong.duration);
      embed.addFields({
        name: `${config.emojis.music} Jetzt läuft`,
        value: `[${queue.currentSong.title}](${queue.currentSong.url})\n\`${progress}\`\nAngefordert von: ${queue.currentSong.requester}`,
      });
    }

    if (queue.songs.length > 0) {
      const songList = queue.songs
        .slice(0, 10)
        .map((song, i) => `**${i + 1}.** [${song.title}](${song.url}) \`${client.music.getFormattedDuration(song.duration)}\` — ${song.requester}`)
        .join('\n');

      embed.addFields({
        name: `${config.emojis.leaf} Als Nächstes (${queue.songs.length} Songs)`,
        value: songList,
      });

      if (queue.songs.length > 10) {
        embed.setFooter({
          text: `🌸 Vendetta System | +${queue.songs.length - 10} weitere Songs`,
          iconURL: 'https://i.imgur.com/3z7qW9R.png'
        });
      }
    }

    const loopEmoji = queue.loopMode === 'song' ? '🔂' : queue.loopMode === 'queue' ? '🔁' : '➡️';
    embed.addFields({
      name: '⚙️ Einstellungen',
      value: `Volume: \`${queue.volume}%\` | Loop: \`${queue.loopMode}\` ${loopEmoji}`,
    });

    await interaction.reply({ embeds: [embed] });
  }
};
